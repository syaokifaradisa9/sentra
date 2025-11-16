<?php

namespace App\Http\Controllers;

use App\Datatables\ProductDatatableService;
use App\DataTransferObjects\ProductDTO;
use App\Http\Requests\Common\DatatableRequest;
use App\Http\Requests\ProductRequest;
use App\Models\Product;
use App\Services\ProductService;
use App\Services\CategoryService;
use App\Services\BranchService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use App\Models\User;
use Throwable;

class ProductController extends Controller
{
    public function __construct(
        private ProductService $productService,
        private ProductDatatableService $productDatatable,
        private CategoryService $categoryService,
        private BranchService $branchService,
    ) {}

    public function index(): InertiaResponse
    {
        return Inertia::render('product/Index');
    }

    public function datatable(DatatableRequest $request)
    {
        return $this->productDatatable->getDatatable($request, $this->currentUser());
    }

    public function create(): InertiaResponse
    {
        $currentUser = $this->currentUser();
        $currentRole = $currentUser->getRoleNames()->first();

        return Inertia::render('product/Create', [
            'categories' => $this->categoriesPayload(),
            'categoryOptions' => $this->categoryService->getOptionsByOwnerId($currentUser->id),
            'currentRole' => $currentRole,
            'defaultBranchIds' => $this->resolveSmallBusinessOwnerBranchIds($currentUser),
        ]);
    }

    public function store(ProductRequest $request): RedirectResponse
    {
        $currentUser = $this->currentUser();
        $productDTO = ProductDTO::fromAppRequest($request);
        $forcedBranchIds = $this->resolveSmallBusinessOwnerBranchIds($currentUser);

        if (! empty($forcedBranchIds)) {
            $productDTO = new ProductDTO(
                name: $productDTO->name,
                categoryId: $productDTO->categoryId,
                price: $productDTO->price,
                description: $productDTO->description,
                branchIds: $forcedBranchIds,
                photo: $productDTO->photo,
            );
        }

        try {
            $this->productService->store(
                $productDTO,
                $currentUser->id
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
        $currentUser = $this->currentUser();
        $currentRole = $currentUser->getRoleNames()->first();

        return Inertia::render('product/Edit', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'category_id' => $product->category_id,
                'price' => (float) $product->price,
                'description' => $product->description,
                'branch_ids' => $product->branches->pluck('id'),
                'branch_names' => $product->branches->pluck('name')->values(),
                'photo_url' => $product->photo ? asset('storage/' . $product->photo) : null,
            ],
            'categories' => $this->categoriesPayload(),
            'categoryOptions' => $this->categoryService->getOptionsByOwnerId($currentUser->id),
            'currentRole' => $currentRole,
            'defaultBranchIds' => $this->resolveSmallBusinessOwnerBranchIds($currentUser),
        ]);
    }

    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        $currentUser = $this->currentUser();
        $productDTO = ProductDTO::fromAppRequest($request);
        $forcedBranchIds = $this->resolveSmallBusinessOwnerBranchIds($currentUser);

        if (! empty($forcedBranchIds)) {
            $productDTO = new ProductDTO(
                name: $productDTO->name,
                categoryId: $productDTO->categoryId,
                price: $productDTO->price,
                description: $productDTO->description,
                branchIds: $forcedBranchIds,
                photo: $productDTO->photo,
            );
        }

        try {
            $updated = $this->productService->update(
                $product->id,
                $productDTO,
                $currentUser->id
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
            $deleted = $this->productService->delete($product, $this->currentUserId());

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
        $pdfContent = $this->productDatatable->printPdf($request, $this->currentUser());
        $fileName = 'laporan-produk-' . now()->format('Ymd_His') . '.pdf';

        return response()->make($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$fileName.'"',
        ]);
    }

    public function printExcel(DatatableRequest $request)
    {
        return $this->productDatatable->printExcel($request, $this->currentUser());
    }

    private function categoriesPayload()
    {
        return $this->categoryService
            ->getByOwnerId($this->currentUserId())
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

    private function currentUser(): User
    {
        /** @var User */
        return auth()->user();
    }

    private function currentUserId(): int
    {
        return (int) $this->currentUser()->id;
    }

    private function resolveSmallBusinessOwnerBranchIds(User $user): array
    {
        if (! $user->hasRole('SmallBusinessOwner')) {
            return [];
        }

        $branchIds = $this->branchService->getBranchIdsForUser($user->id);

        return array_slice($branchIds, 0, 1);
    }
}
