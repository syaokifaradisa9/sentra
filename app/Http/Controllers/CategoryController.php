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
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class CategoryController extends Controller
{
    private $loggedUser;
    public function __construct(
        private CategoryService $categoryService,
        private CategoryDatatableService $categoryDatatable,
        private BranchService $branchService,
        private BusinessService $businessService
    ) {
        $this->loggedUser = Auth::user();
    }

    public function index(): InertiaResponse
    {
        return Inertia::render('category/Index');
    }

    public function create(): InertiaResponse
    {
        return Inertia::render('category/Create', [
            'branches' => $this->branchService->getOptionsDataByOwnerId($this->loggedUser->id),
            'businesses' => $this->businessService->getOptionsDataByOwnerId($this->loggedUser->id),
        ]);
    }

    public function store(CategoryRequest $request): RedirectResponse
    {
        try {
            $this->categoryService->store(
                CategoryDTO::fromAppRequest($request),
                $this->loggedUser->id
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
            'branches' => $this->branchService->getOptionsDataByOwnerId($this->loggedUser->id),
        ]);
    }

    public function update(CategoryRequest $request, Category $category): RedirectResponse
    {
        try {
            $updatedCategory = $this->categoryService->update(
                $category->id,
                CategoryDTO::fromAppRequest($request),
                $this->loggedUser->id
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

    public function datatable(DatatableRequest $request): JsonResponse
    {
        return $this->categoryDatatable->getDatatable($request, $this->loggedUser);
    }

    public function printPdf(DatatableRequest $request)
    {
        return $this->categoryDatatable->printPdf($request, $this->loggedUser);
    }

    public function printExcel(DatatableRequest $request)
    {
        return $this->categoryDatatable->printExcel($request, $this->loggedUser);
    }

}

