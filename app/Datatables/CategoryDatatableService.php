<?php

namespace App\Datatables;

use App\Models\Category;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use App\Http\Requests\Common\DatatableRequest;

class CategoryDatatableService {

    private function getStartedQuery(DatatableRequest $request, $loggedUser){
        $query = Category::query();

        if ($loggedUser->hasAnyRole(['Businessman', 'BusinessOwner', 'SmallBusinessOwner'])) {
            $query->whereHas('branches', function ($q) use ($loggedUser) {
                $q->where('owner_id', $loggedUser->id);
            });
        } else {
            $managedBranchIds = $loggedUser->branchAssignments
                ->pluck('branch_id')
                ->map(static fn ($id) => (int) $id)
                ->all();

            if (empty($managedBranchIds)) {
                return Category::query()->whereRaw('1 = 0');
            }

            $query->whereHas('branches', function ($builder) use ($managedBranchIds) {
                $builder->whereIn('branches.id', $managedBranchIds);
            });
        }

        // Handle sorting
        $sortColumn = $request->input('sort_by', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');

        // Validate sort column to prevent injection
        $allowedSortColumns = [
            'name'
        ];

        if (in_array($sortColumn, $allowedSortColumns)) {
            $query->orderBy($sortColumn, $sortDirection);
        } else {
            $query->orderBy("name", "asc");
        }

        if($request->search){
            $query->where(function($query) use($request){
                $query->where("name", "like", "%$request->search%");
            });
        }

        $query->when($request->name, function($query, $search){
            $query->where("name", "like", "%{$search}%");
        });

        return $query->with('branches');
    }

    public function getDatatable(DatatableRequest $request, $loggedUser, $additionalData = []){
        $limit = $request->limit ?? 20;

        $records = $this->getStartedQuery($request, $loggedUser);
        $records = $records->paginate($limit);

        return $records;
    }

    public function printPdf(DatatableRequest $request, $loggedUser, $additionalData = []){
        $records = $this->getStartedQuery($request, $loggedUser)->get();
        return Pdf::loadView("reports.categories", [
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
            "Nama Kategori",
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
            $branchNames = $record->branches->pluck('name')->implode(', ');
            $worksheet->setCellValue("C" . $numCell, $branchNames ?: '-');

            foreach(["A"] as $letter){
                $worksheet->getStyle($letter . $numCell)
                    ->getAlignment()
                    ->setHorizontal('center')
                    ->setVertical('center');
            }
        }

        $date = date("d F Y");
        $fileName = "Laporan Data Master Kategori Per $date.xlsx";

        $writer = new Xlsx($spreadsheet);
        $writer->save(storage_path("app/public/$fileName"));

        return Response::download(
            storage_path("app/public/$fileName")
        )->deleteFileAfterSend(true);
    }
}
