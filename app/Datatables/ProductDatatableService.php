<?php

namespace App\Datatables;

use App\Models\Product;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use App\Http\Requests\Common\DatatableRequest;

class ProductDatatableService {

    private function getStartedQuery(DatatableRequest $request, $loggedUser){
        $query = Product::whereHas('branches', function ($q) use ($loggedUser) {
            $q->where('owner_id', $loggedUser->id);
        });

        // Handle sorting
        $sortColumn = $request->input('sort_by', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');

        // Validate sort column to prevent injection
        $allowedSortColumns = [
            'name', 'price', 'description'
        ];

        if (in_array($sortColumn, $allowedSortColumns)) {
            $query->orderBy($sortColumn, $sortDirection);
        } else {
            $query->orderBy("name", "asc");
        }

        if($request->search){
            $query->where(function($query) use($request){
                $query->where("name", "like", "%$request->search%")
                    ->orWhere("description", "like", "%$request->search%")
                    ->orWhere("price", "like", "%$request->search%");
            });
        }

        $query->when($request->name, function($query, $search){
            $query->where("name", "like", "%{$search}%");
        })->when($request->description, function($query, $search){
            $query->where("description", "like", "%{$search}%");
        });

        return $query->with('category', 'branches');
    }

    public function getDatatable(DatatableRequest $request, $loggedUser, $additionalData = []){
        $limit = $request->limit ?? 20;

        $records = $this->getStartedQuery($request, $loggedUser);
        $records = $records->paginate($limit);

        return $records;
    }

    public function printPdf(DatatableRequest $request, $loggedUser, $additionalData = []){
        $records = $this->getStartedQuery($request, $loggedUser)->get();
        return Pdf::loadView("reports.products", [
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
            "Nama Produk",
            "Kategori",
            "Cabang",
            "Harga",
            "Deskripsi",
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
            $worksheet->setCellValue("C" . $numCell, $record->category->name ?? '-');
            $branchNames = $record->branches->pluck('name')->implode(', ');
            $worksheet->setCellValue("D" . $numCell, $branchNames ?: '-');
            $worksheet->setCellValue("E" . $numCell, "Rp " . number_format($record->price, 2, ',', '.'));
            $worksheet->setCellValue("F" . $numCell, $record->description);

            foreach(["A"] as $letter){
                $worksheet->getStyle($letter . $numCell)
                    ->getAlignment()
                    ->setHorizontal('center')
                    ->setVertical('center');
            }
        }

        $date = date("d F Y");
        $fileName = "Laporan Data Master Produk Per $date.xlsx";

        $writer = new Xlsx($spreadsheet);
        $writer->save(storage_path("app/public/$fileName"));

        return Response::download(
            storage_path("app/public/$fileName")
        )->deleteFileAfterSend(true);
    }
}