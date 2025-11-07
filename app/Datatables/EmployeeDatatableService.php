<?php

namespace App\Datatables;

use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use App\Http\Requests\Common\DatatableRequest;

class EmployeeDatatableService {
    private function getStartedQuery(DatatableRequest $request, $loggedUser){
        $query = User::query()->where('id', '!=', $loggedUser->id);

        if ($loggedUser->hasRole('Businessman')) {
            // Businessman can see all employees
        } elseif ($loggedUser->hasRole('BusinessOwner')) {
            $query = $query->whereHas('roles', function ($builder) {
                $builder->whereIn('name', ['Manager', 'Cashier', 'Admin']);
            });
        } elseif ($loggedUser->hasRole('SmallBusinessOwner')) {
            $query = $query->whereHas('roles', function ($builder) {
                $builder->whereIn('name', ['Cashier', 'Admin']);
            });
        } else {
            $query = $query->whereRaw('1 = 0');
        }

        // Handle sorting
        $sortColumn = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');

        // Validate sort column to prevent injection
        $allowedSortColumns = [
            'name', 'email', 'phone', 'position', 'created_at', 'updated_at'
        ];

        if (in_array($sortColumn, $allowedSortColumns)) {
            $query->orderBy($sortColumn, $sortDirection);
        } else {
            $query->orderBy("created_at", "desc");
        }

        if($request->search){
            $query->where(function($query) use($request){
                $query->where("name", "like", "%$request->search%")
                    ->orWhere("email", "like", "%$request->search%")
                    ->orWhere("phone", "like", "%$request->search%")
                    ->orWhere("position", "like", "%$request->search%");
            });
        }

        $query->when($request->name, function($query, $search){
            $query->where("name", "like", "%{$search}%");
        })->when($request->email, function($query, $search){
            $query->where("email", "like", "%{$search}%");
        })->when($request->phone, function($query, $search){
            $query->where("phone", "like", "%{$search}%");
        })->when($request->position, function($query, $search){
            $query->where("position", "like", "%{$search}%");
        });

        return $query->with(['branches', 'roles']);
    }

    public function getDatatable(DatatableRequest $request, $loggedUser, $additionalData = []){
        $limit = $request->limit ?? 20;

        $records = $this->getStartedQuery($request, $loggedUser);
        $records = $records->paginate($limit);

        return $records;
    }

    public function printPdf(DatatableRequest $request, $loggedUser, $additionalData = []){
        $records = $this->getStartedQuery($request, $loggedUser)->get();
        return Pdf::loadView("reports.employees", [
            'records' => $records
        ])->setPaper("A4", "landscape")->output();
    }

    public function printExcel(DatatableRequest $request, $loggedUser, $additionalData = []){
        $records = $this->getStartedQuery($request, $loggedUser)->get();

        $spreadsheet = new Spreadsheet();
        $worksheet = $spreadsheet->getActiveSheet();

        $columnindex = 'A';
        foreach([
            "No",
            "Nama",
            "Email",
            "Telepon",
            "Alamat",
            "Jabatan",
            "Cabang",
        ] as $columnName){
            $worksheet->setCellValue($columnindex . '1', $columnName);
            $worksheet->getColumnDimension($columnindex)->setAutoSize(true);
            $worksheet->getStyle($columnindex . '1')->getAlignment()->setHorizontal('center')->setVertical('center');
            $columnindex++;
        }

        foreach($records as $index => $record){
            $numCell = ($index + 2);

            $worksheet->setCellValue("A" . $numCell, $index + 1);
            $worksheet->setCellValue("B" . $numCell, $record->name);
            $worksheet->setCellValue("C" . $numCell, $record->email);
            $worksheet->setCellValue("D" . $numCell, $record->phone);
            $worksheet->setCellValue("E" . $numCell, $record->address);
            $worksheet->setCellValue("F" . $numCell, $record->position);
            $branchNames = $record->branches->pluck('name')->implode(', ');
            $worksheet->setCellValue("G" . $numCell, $branchNames ?: '-');

            foreach(["A"] as $letter){
                $worksheet->getStyle($letter . $numCell)
                    ->getAlignment()
                    ->setHorizontal('center')
                    ->setVertical('center');
            }
        }

        $date = date("d F Y");
        $fileName = "Laporan Data Karyawan Per $date.xlsx";

        $writer = new Xlsx($spreadsheet);
        $writer->save(storage_path("app/public/$fileName"));

        return Response::download(
            storage_path("app/public/$fileName")
        )->deleteFileAfterSend(true);
    }
}