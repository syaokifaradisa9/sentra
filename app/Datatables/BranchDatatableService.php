<?php

namespace App\Datatables;

use App\Models\Branch;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use App\Http\Requests\Common\DatatableRequest;

class BranchDatatableService {
    private function getStartedQuery(DatatableRequest $request, $loggedUser){
        $query = Branch::whereOwnerId($loggedUser->id);

        // Handle sorting
        $sortColumn = $request->input('sort_by', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');

        // Validate sort column to prevent injection
        $allowedSortColumns = [
            'name', 'address', 'opening_time', 'closing_time'
        ];

        if (in_array($sortColumn, $allowedSortColumns)) {
            $query->orderBy($sortColumn, $sortDirection);
        } else {
            $query->orderBy("name", "asc");
        }

        if($request->search){
            $query->where(function($query) use($request){
                $query->where("name", "like", "%$request->search%")
                    ->orWhere("address", "like", "%$request->search%")
                    ->orWhere("opening_time", "like", "%$request->search%")
                    ->orWhere("closing_time", "like", "%$request->search%");
            });
        }

        $query->when($request->name, function($query, $search){
            $query->where("name", "like", "%{$search}%");
        })->when($request->address, function($query, $search){
            $query->where("address", "like", "%{$search}%");
        });

        return $query;
    }

    public function getDatatable(DatatableRequest $request, $loggedUser, $additionalData = []){
        $limit = $request->limit ?? 20;

        $records = $this->getStartedQuery($request, $loggedUser);
        $records = $records->paginate($limit);

        return $records;
    }

    public function printPdf(DatatableRequest $request, $loggedUser, $additionalData = []){
        $records = $this->getStartedQuery($request, $loggedUser)->with('business')->get();
        return Pdf::loadView("reports.branches", [
            'records' => $records
        ])->setPaper("A4", "landscape")->output();
    }

    public function printExcel(DatatableRequest $request, $loggedUser, $additionalData = []){
        $records = $this->getStartedQuery($request, $loggedUser)->with('business')->get();

        $spreadsheet = new Spreadsheet();
        $worksheet = $spreadsheet->getActiveSheet();

        $columnindex = 'A';
        foreach([
            "No",
            "Nama Cabang",
            "Bisnis",
            "Alamat",
            "Jam Buka",
            "Jam Tutup",
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
            $worksheet->setCellValue("C" . $numCell, $record->business->name ?? '-');
            $worksheet->setCellValue("D" . $numCell, $record->address);
            $worksheet->setCellValue("E" . $numCell, $record->opening_time);
            $worksheet->setCellValue("F" . $numCell, $record->closing_time);

            foreach(["A"] as $letter){
                $worksheet->getStyle($letter . $numCell)
                    ->getAlignment()
                    ->setHorizontal('center')
                    ->setVertical('center');
            }
        }

        $date = date("d F Y");
        $fileName = "Laporan Data Master Cabang Per $date.xlsx";

        $writer = new Xlsx($spreadsheet);
        $writer->save(storage_path("app/public/$fileName"));

        return Response::download(
            storage_path("app/public/$fileName")
        )->deleteFileAfterSend(true);
    }
}