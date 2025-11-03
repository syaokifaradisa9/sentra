<?php

namespace App\Http\Controllers;

use App\DataTransferObjects\ProductDTO;
use App\Http\Requests\Common\DatatableRequest;
use App\Http\Requests\ProductRequest;
use App\Services\ProductService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Throwable;

class ProductController extends Controller
{
    public function __construct(
        private ProductService $productService,
    ) {}

    public function index(): InertiaResponse
    {
        return Inertia::render('product/Index');
    }

    public function datatable(Request $request): JsonResponse
    {
        $paginator = $this->productService->paginateForUser($request->all(), auth()->id());

        return response()->json($paginator);
    }

    public function create(): InertiaResponse
    {
        return Inertia::render('product/Create', [
            'categories' => $this->categoriesPayload(),
        ]);
    }

    public function store(ProductRequest $request): RedirectResponse
    {
        try {
            $this->productService->store(
                ProductDTO::fromAppRequest($request),
                auth()->id()
            );

            return to_route('products.index')->with('success', 'Produk berhasil dibuat');
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            report($exception);

            return back()->withInput()->with('error', 'Gagal membuat produk');
        }
    }

    public function edit(int $product): InertiaResponse
    {
        $productModel = $this->productService->getForUser($product, auth()->id());

        abort_if(! $productModel, 404);

        return Inertia::render('product/Edit', [
            'product' => [
                'id' => $productModel->id,
                'name' => $productModel->name,
                'category_id' => $productModel->category_id,
                'price' => (float) $productModel->price,
                'description' => $productModel->description,
                'branch_ids' => $productModel->branches->pluck('id'),
                'photo_url' => $productModel->photo ? asset('storage/' . $productModel->photo) : null,
            ],
            'categories' => $this->categoriesPayload(),
        ]);
    }

    public function update(ProductRequest $request, int $product): RedirectResponse
    {
        try {
            $updated = $this->productService->update(
                $product,
                ProductDTO::fromAppRequest($request),
                auth()->id()
            );

            if (! $updated) {
                return back()->withInput()->with('error', 'Produk tidak ditemukan');
            }

            return to_route('products.index')->with('success', 'Produk berhasil diperbarui');
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            report($exception);

            return back()->withInput()->with('error', 'Gagal memperbarui produk');
        }
    }

    public function destroy(int $product): RedirectResponse
    {
        try {
            $deleted = $this->productService->delete($product, auth()->id());

            if ($deleted) {
                return to_route('products.index')->with('success', 'Produk berhasil dihapus');
            }

            return back()->with('error', 'Gagal menghapus produk');
        } catch (Throwable $exception) {
            report($exception);

            return back()->with('error', 'Gagal menghapus produk');
        }
    }

    public function printPdf(DatatableRequest $request)
    {
        $records = $this->productService->getForExport($request->validated(), auth()->id());

        $pdf = Pdf::loadView('reports.products', [
            'records' => $records,
        ])->setPaper('A4', 'landscape');

        $fileName = 'laporan-produk-' . now()->format('Ymd_His') . '.pdf';

        return $pdf->stream($fileName);
    }

    public function printExcel(DatatableRequest $request)
    {
        $records = $this->productService->getForExport($request->validated(), auth()->id());

        $spreadsheet = new Spreadsheet();
        $worksheet = $spreadsheet->getActiveSheet();

        $headers = ['No', 'Nama Produk', 'Kategori', 'Harga', 'Cabang', 'Deskripsi'];
        foreach ($headers as $index => $header) {
            $columnLetter = chr(65 + $index);
            $worksheet->setCellValue("{$columnLetter}1", $header);
            $worksheet->getStyle("{$columnLetter}1")->getAlignment()->setHorizontal('center')->setVertical('center');
            $worksheet->getColumnDimension($columnLetter)->setAutoSize(true);
        }

        foreach ($records as $rowIndex => $record) {
            $rowNumber = $rowIndex + 2;
            $worksheet->setCellValue("A{$rowNumber}", $rowIndex + 1);
            $worksheet->setCellValue("B{$rowNumber}", $record->name);
            $worksheet->setCellValue("C{$rowNumber}", $record->category->name ?? '-');
            $formattedPrice = 'Rp ' . number_format((float) $record->price, 0, ',', '.');
            $worksheet->setCellValue("D{$rowNumber}", $formattedPrice);
            $branchNames = $record->branches->pluck('name')->implode(', ');
            $worksheet->setCellValue("E{$rowNumber}", $branchNames ?: '-');
            $worksheet->setCellValue("F{$rowNumber}", $record->description ?: '-');
            $worksheet->getStyle("A{$rowNumber}")
                ->getAlignment()
                ->setHorizontal('center')
                ->setVertical('center');
            $worksheet->getStyle("D{$rowNumber}")
                ->getAlignment()
                ->setHorizontal('right')
                ->setVertical('center');
        }

        $fileName = 'Laporan Data Produk Per ' . now()->format('d F Y') . '.xlsx';
        $filePath = storage_path('app/public/' . $fileName);

        $writer = new Xlsx($spreadsheet);
        $writer->save($filePath);

        return Response::download($filePath)->deleteFileAfterSend(true);
    }

    private function categoriesPayload()
    {
        return $this->productService
            ->getCategoriesForUser(auth()->id())
            ->map(static fn ($category) => [
                'id' => $category->id,
                'name' => $category->name,
                'branches' => $category->filtered_branches
                    ->map(static fn ($branch) => [
                        'id' => $branch->id,
                        'name' => $branch->name,
                        'business_id' => $branch->business_id,
                    ])
                    ->values(),
            ])
            ->values();
    }
}


