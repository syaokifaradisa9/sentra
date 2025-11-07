<?php

namespace App\Http\Controllers;

use App\Datatables\ProductDatatableService;
use App\DataTransferObjects\ProductDTO;
use App\Http\Requests\Common\DatatableRequest;
use App\Http\Requests\ProductRequest;
use App\Models\Product;
use App\Services\ProductService;
use App\Services\CategoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Throwable;

class ProductController extends Controller
{
    private $loggedUser;

    public function __construct(
        private ProductService $productService,
        private ProductDatatableService $productDatatable,
        private CategoryService $categoryService,
    ) {
        $this->loggedUser = Auth::user();
    }

    public function index(): InertiaResponse
    {
        return Inertia::render('product/Index');
    }

    public function datatable(DatatableRequest $request)
    {
        return $this->productDatatable->getDatatable($request, $this->loggedUser);
    }

    public function create(): InertiaResponse
    {
        return Inertia::render('product/Create', [
            'categories' => $this->categoriesPayload(),
            'categoryOptions' => $this->categoryService->getOptionsByOwnerId($this->loggedUser->id),
        ]);
    }

    public function store(ProductRequest $request): RedirectResponse
    {
        try {
            $this->productService->store(
                ProductDTO::fromAppRequest($request),
                $this->loggedUser->id
            );

            return to_route('products.index')->with('success', 'Produk berhasil dibuat');
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            report($exception);

            return back()->withInput()->with('error', 'Gagal membuat produk');
        }
    }

    public function edit(Product $product): InertiaResponse
    {
        $product->load('branches');

        return Inertia::render('product/Edit', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'category_id' => $product->category_id,
                'price' => (float) $product->price,
                'description' => $product->description,
                'branch_ids' => $product->branches->pluck('id'),
                'photo_url' => $product->photo ? asset('storage/' . $product->photo) : null,
            ],
            'categories' => $this->categoriesPayload(),
            'categoryOptions' => $this->categoryService->getOptionsByOwnerId($this->loggedUser->id),
        ]);
    }

    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        try {
            $updated = $this->productService->update(
                $product->id,
                ProductDTO::fromAppRequest($request),
                $this->loggedUser->id
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
            $deleted = $this->productService->delete($product, $this->loggedUser->id);

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
        $pdfContent = $this->productDatatable->printPdf($request, $this->loggedUser);
        $fileName = 'laporan-produk-' . now()->format('Ymd_His') . '.pdf';

        return response()->make($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$fileName.'"',
        ]);
    }

    public function printExcel(DatatableRequest $request)
    {
        return $this->productDatatable->printExcel($request, $this->loggedUser);
    }

    private function categoriesPayload()
    {
        return $this->categoryService
            ->getByOwnerId($this->loggedUser->id)
            ->map(static fn ($category) => [
                'id' => $category->id,
                'name' => $category->name,
                'branches' => $category->branches
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
