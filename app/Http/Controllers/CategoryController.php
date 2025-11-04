<?php

namespace App\Http\Controllers;

use App\DataTransferObjects\CategoryDTO;
use App\Http\Requests\CategoryRequest;
use App\Http\Requests\Common\DatatableRequest;
use App\Models\Category;
use App\Services\CategoryService;
use Barryvdh\DomPDF\Facade\Pdf;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class CategoryController extends Controller
{
    public function __construct(
        private CategoryService $categoryService,
    ) {}

    public function index(): InertiaResponse
    {
        return Inertia::render('category/Index');
    }

    public function create(): InertiaResponse
    {
        return Inertia::render('category/Create', [
            'branches' => $this->mappedBranchesForUser(),
        ]);
    }

    public function store(CategoryRequest $request): RedirectResponse
    {
        try {
            $this->categoryService->store(
                CategoryDTO::fromAppRequest($request),
                auth()->id()
            );

            return to_route('categories.index')->with('success', 'Kategori berhasil dibuat');
        } catch (Exception $exception) {
            report($exception);

            return back()->withInput()->with('error', 'Gagal membuat kategori');
        }
    }

    public function edit(Category $category): InertiaResponse
    {
        $category = $this->categoryService->getById($category->id);

        if (! $category) {
            abort(404);
        }

        return Inertia::render('category/Edit', [
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'icon' => $category->icon,
                'branch_ids' => $category->branches->pluck('id')->values(),
            ],
            'branches' => $this->mappedBranchesForUser(),
        ]);
    }

    public function update(CategoryRequest $request, Category $category): RedirectResponse
    {
        try {
            $updatedCategory = $this->categoryService->update(
                $category->id,
                CategoryDTO::fromAppRequest($request),
                auth()->id()
            );

            if (! $updatedCategory) {
                return back()->withInput()->with('error', 'Kategori tidak ditemukan');
            }

            return to_route('categories.index')->with('success', 'Kategori berhasil diperbarui');
        } catch (Exception $exception) {
            report($exception);

            return back()->withInput()->with('error', 'Gagal memperbarui kategori');
        }
    }

    public function destroy(Category $category): RedirectResponse
    {
        try {
            $deleted = $this->categoryService->delete($category->id);

            if (! $deleted) {
                return back()->with('error', 'Gagal menghapus kategori');
            }

            return to_route('categories.index')->with('success', 'Kategori berhasil dihapus');
        } catch (Exception $exception) {
            report($exception);

            return back()->with('error', 'Gagal menghapus kategori');
        }
    }

    public function datatable(Request $request): JsonResponse
    {
        $paginator = $this->categoryService->paginateForUser($request->all(), auth()->id());

        return response()->json($paginator);
    }

    public function printPdf(DatatableRequest $request)
    {
        $records = $this->categoryService->getForExport($request->validated(), auth()->id());

        $pdf = Pdf::loadView('reports.categories', [
            'records' => $records,
        ])->setPaper('A4', 'landscape');

        $fileName = 'laporan-kategori-' . now()->format('Ymd_His') . '.pdf';

        return $pdf->stream($fileName);
    }

    public function printExcel(DatatableRequest $request)
    {
        $records = $this->categoryService->getForExport($request->validated(), auth()->id());

        $spreadsheet = new Spreadsheet();
        $worksheet = $spreadsheet->getActiveSheet();

        $headers = ['No', 'Nama Kategori', 'Cabang'];
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
            $branchNames = $record->branches->pluck('name')->implode(', ');
            $worksheet->setCellValue("C{$rowNumber}", $branchNames ?: '-');
            $worksheet->getStyle("A{$rowNumber}")
                ->getAlignment()
                ->setHorizontal('center')
                ->setVertical('center');
        }

        $fileName = 'Laporan Data Kategori Per ' . now()->format('d F Y') . '.xlsx';
        $filePath = storage_path('app/public/' . $fileName);

        $writer = new Xlsx($spreadsheet);
        $writer->save($filePath);

        return Response::download($filePath)->deleteFileAfterSend(true);
    }

    private function mappedBranchesForUser(): Collection
    {
        return $this->categoryService
            ->getBranchesForUser(auth()->id())
            ->map(static fn ($branch) => [
                'id' => $branch->id,
                'name' => $branch->name,
            ])
            ->values();
    }
}

