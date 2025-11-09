<?php

namespace App\Http\Controllers;

use App\Datatables\CategoryDatatableService;
use App\DataTransferObjects\CategoryDTO;
use App\Http\Requests\CategoryRequest;
use App\Http\Requests\Common\DatatableRequest;
use App\Models\Category;
use App\Services\BranchService;
use App\Services\BusinessService;
use App\Services\CategoryService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use App\Models\User;

class CategoryController extends Controller
{
    public function __construct(
        private CategoryService $categoryService,
        private CategoryDatatableService $categoryDatatable,
        private BranchService $branchService,
        private BusinessService $businessService
    ) {}

    public function index(): InertiaResponse
    {
        return Inertia::render('category/Index');
    }

    public function create(): InertiaResponse
    {
        return Inertia::render('category/Create', [
            'branches' => $this->branchService->getOptionsDataByOwnerId($this->currentUserId()),
        ]);
    }

    public function store(CategoryRequest $request): RedirectResponse
    {
        try {
            $this->categoryService->store(
                CategoryDTO::fromAppRequest($request)
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
            'category' => $category,
            'branches' => $this->branchService->getOptionsDataByOwnerId($this->currentUserId()),
        ]);
    }

    public function update(CategoryRequest $request, Category $category): RedirectResponse
    {
        try {
            $updatedCategory = $this->categoryService->update(
                $category->id,
                CategoryDTO::fromAppRequest($request)
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

            if (!$deleted) {
                return back()->with('error', 'Gagal menghapus kategori');
            }

            return to_route('categories.index')->with('success', 'Kategori berhasil dihapus');
        } catch (Exception $exception) {
            report($exception);

            return back()->with('error', 'Gagal menghapus kategori');
        }
    }

    public function datatable(DatatableRequest $request)
    {
        return $this->categoryDatatable->getDatatable($request, $this->currentUser());
    }

    public function printPdf(DatatableRequest $request)
    {
        $pdfContent =  $this->categoryDatatable->printPdf($request, $this->currentUser());
        $fileName = 'Laporan Kategori Per ' . date("d F Y") . '.pdf';

        return response()->make($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$fileName.'"',
        ]);
    }

    public function printExcel(DatatableRequest $request)
    {
        return $this->categoryDatatable->printExcel($request, $this->currentUser());
    }

    private function currentUser(): User
    {
        /** @var User */
        return auth()->user();
    }

    private function currentUserId(): int
    {
        return (int) $this->currentUser()->id;
    }

}
