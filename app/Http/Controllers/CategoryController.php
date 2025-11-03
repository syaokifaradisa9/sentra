<?php

namespace App\Http\Controllers;

use App\DataTransferObjects\CategoryDTO;
use App\Http\Requests\CategoryRequest;
use App\Models\Category;
use App\Services\CategoryService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function __construct(
        private CategoryService $categoryService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('category/Index');
    }

    public function create(): Response
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

    public function edit(Category $category): Response
    {
        $category = $this->categoryService->getById($category->id);

        if (! $category) {
            abort(404);
        }

        return Inertia::render('category/Edit', [
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
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
