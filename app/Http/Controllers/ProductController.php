<?php

namespace App\Http\Controllers;

use App\DataTransferObjects\ProductDTO;
use App\Http\Requests\ProductRequest;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ProductController extends Controller
{
    public function __construct(
        private ProductService $productService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('product/Index');
    }

    public function datatable(Request $request): JsonResponse
    {
        $paginator = $this->productService->paginateForUser($request->all(), auth()->id());

        return response()->json($paginator);
    }

    public function create(): Response
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

    public function edit(int $product): Response
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
                'photo_url' => $productModel->photo ? asset('storage/'.$productModel->photo) : null,
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

