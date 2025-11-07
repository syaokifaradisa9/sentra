<?php

namespace App\Datatables;

use App\Http\Requests\Common\DatatableRequest;
use App\Models\Promo;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class PromoDatatableService
{
    private function baseQuery(DatatableRequest $request, $loggedUser)
    {
        $query = Promo::query()
            ->with(['product.category'])
            ->whereHas('product.branches', function ($builder) use ($loggedUser) {
                $builder->where('branches.owner_id', $loggedUser->id);
            });

        $search = $request->input('search');
        if ($search) {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->whereHas('product', function ($productQuery) use ($search) {
                        $productQuery->where('name', 'like', "%{$search}%");
                    })
                    ->orWhere('percent_discount', 'like', "%{$search}%")
                    ->orWhere('price_discount', 'like', "%{$search}%");
            });
        }

        if ($request->filled('product')) {
            $query->whereHas('product', function ($productQuery) use ($request) {
                $productQuery->where('name', 'like', "%{$request->product}%");
            });
        }

        $allowedSortColumns = [
            'start_date',
            'end_date',
            'percent_discount',
            'price_discount',
            'created_at',
        ];

        $sortBy = $request->input('sort_by', 'start_date');
        $sortDirection = strtolower($request->input('sort_direction', 'desc')) === 'asc' ? 'asc' : 'desc';
        if (! in_array($sortBy, $allowedSortColumns, true)) {
            $sortBy = 'start_date';
        }

        return $query->orderBy($sortBy, $sortDirection);
    }

    public function getDatatable(DatatableRequest $request, $loggedUser)
    {
        $limit = (int) ($request->limit ?? 20);
        $limit = $limit > 0 ? $limit : 20;

        return $this->baseQuery($request, $loggedUser)
            ->paginate($limit)
            ->withQueryString();
    }

    public function printPdf(DatatableRequest $request, $loggedUser)
    {
        $records = $this->baseQuery($request, $loggedUser)->get();

        return Pdf::loadView('reports.promos', [
            'records' => $records,
        ])
            ->setPaper('A4', 'landscape')
            ->output();
    }

    public function printExcel(DatatableRequest $request, $loggedUser)
    {
        $records = $this->baseQuery($request, $loggedUser)->get();

        $spreadsheet = new Spreadsheet();
        $worksheet = $spreadsheet->getActiveSheet();

        $headers = [
            'No',
            'Produk',
            'Kategori',
            'Periode',
            'Diskon',
            'Harga Awal',
            'Harga Promo',
        ];

        $columnIndex = 'A';
        foreach ($headers as $header) {
            $worksheet->setCellValue($columnIndex . '1', $header);
            $worksheet->getColumnDimension($columnIndex)->setAutoSize(true);
            $worksheet->getStyle($columnIndex . '1')
                ->getAlignment()
                ->setHorizontal('center')
                ->setVertical('center');
            $columnIndex++;
        }

        foreach ($records as $index => $record) {
            $row = $index + 2;
            $basePrice = (float) $record->product?->price;

            $discountLabel = [];
            if (! is_null($record->percent_discount)) {
                $discountLabel[] = rtrim(rtrim(number_format($record->percent_discount, 2, '.', ''), '0'), '.') . '%';
            }
            if (! is_null($record->price_discount)) {
                $discountLabel[] = 'Rp ' . number_format((float) $record->price_discount, 0, ',', '.');
            }

            $promoPrice = $basePrice;
            if (! is_null($record->percent_discount)) {
                $promoPrice -= $promoPrice * ((float) $record->percent_discount / 100);
            }
            if (! is_null($record->price_discount)) {
                $promoPrice -= (float) $record->price_discount;
            }

            $worksheet->setCellValue("A{$row}", $index + 1);
            $worksheet->setCellValue("B{$row}", $record->product?->name ?? '-');
            $worksheet->setCellValue("C{$row}", $record->product?->category?->name ?? '-');
            $worksheet->setCellValue("D{$row}", sprintf(
                '%s s/d %s',
                optional($record->start_date)?->format('d M Y'),
                optional($record->end_date)?->format('d M Y')
            ));
            $worksheet->setCellValue("E{$row}", implode(' + ', $discountLabel) ?: '-');
            $worksheet->setCellValue("F{$row}", 'Rp ' . number_format($basePrice, 0, ',', '.'));
            $worksheet->setCellValue("G{$row}", 'Rp ' . number_format(max($promoPrice, 0), 0, ',', '.'));
        }

        $fileName = 'Laporan Promo ' . now()->format('d F Y') . '.xlsx';
        $path = storage_path("app/public/{$fileName}");

        (new Xlsx($spreadsheet))->save($path);

        return Response::download($path)->deleteFileAfterSend(true);
    }
}
