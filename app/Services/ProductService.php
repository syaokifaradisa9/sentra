<?php

namespace App\Services;

use App\DataTransferObjects\ProductDTO;
use App\Models\Product;
use App\Repositories\Branch\BranchRepository;
use App\Repositories\Category\CategoryRepository;
use App\Repositories\Product\ProductRepository;
use App\Repositories\ProductBranch\ProductBranchRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProductService
{
    public function __construct(
        private ProductRepository $productRepository,
        private ProductBranchRepository $productBranchRepository,
        private CategoryRepository $categoryRepository,
        private BranchRepository $branchRepository,
    ) {}

    public function paginateForUser(array $filters, int $userId): LengthAwarePaginator
    {
        return $this->productRepository->paginateForUser($userId, $filters);
    }

    public function getForUser(int $id, int $userId): ?Product
    {
        $product = $this->productRepository->getById($id);

        if (! $product) {
            return null;
        }

        $product->load(['category.branches', 'branches']);

        $userBranchIds = $this->getUserBranchIds($userId);

        $hasAccessibleBranch = $product->branches
            ->pluck('id')
            ->intersect($userBranchIds)
            ->isNotEmpty();

        if (! $hasAccessibleBranch) {
            return null;
        }

        return $product;
    }

    public function store(ProductDTO $dto, int $userId): Product
    {
        return DB::transaction(function () use ($dto, $userId) {
            $validBranchIds = $this->validatedBranchIds($dto->categoryId, $dto->branchIds, $userId);

            if (empty($validBranchIds)) {
                throw ValidationException::withMessages([
                    'branch_ids' => 'Cabang yang dipilih tidak valid untuk kategori ini.',
                ]);
            }

            $photoPath = $this->storePhoto($dto->photo);

            $product = $this->productRepository->store(
                $dto->toArray($photoPath)
            );

            $this->syncProductBranches($product->id, $validBranchIds);

            return $product->load(['category.branches', 'branches']);
        });
    }

    public function update(int $id, ProductDTO $dto, int $userId): ?Product
    {
        return DB::transaction(function () use ($id, $dto, $userId) {
            $product = $this->productRepository->getById($id);

            if (! $product) {
                return null;
            }

            $product->load('branches');

            $userBranchIds = $this->getUserBranchIds($userId);

            $hasAccessibleBranch = $product->branches
                ->pluck('id')
                ->intersect($userBranchIds)
                ->isNotEmpty();

            if (! $hasAccessibleBranch) {
                return null;
            }

            $validBranchIds = $this->validatedBranchIds($dto->categoryId, $dto->branchIds, $userId);

            if (empty($validBranchIds)) {
                throw ValidationException::withMessages([
                    'branch_ids' => 'Cabang yang dipilih tidak valid untuk kategori ini.',
                ]);
            }

            $photoPath = $product->photo;
            if ($dto->photo instanceof UploadedFile) {
                $this->deletePhoto($product->photo);
                $photoPath = $this->storePhoto($dto->photo);
            }

            $updated = $this->productRepository->update(
                $id,
                $dto->toArray($photoPath)
            );

            if (! $updated) {
                return null;
            }

            $this->syncProductBranches($id, $validBranchIds);

            return $updated->load(['category.branches', 'branches']);
        });
    }

    public function delete(int $id, int $userId): bool
    {
        return DB::transaction(function () use ($id, $userId) {
            $product = $this->productRepository->getById($id);

            if (! $product) {
                return false;
            }

            $product->load('branches');

            $userBranchIds = $this->getUserBranchIds($userId);
            $hasAccessibleBranch = $product->branches
                ->pluck('id')
                ->intersect($userBranchIds)
                ->isNotEmpty();

            if (! $hasAccessibleBranch) {
                return false;
            }

            $this->productBranchRepository->deleteByProductId($id);

            $deleted = $this->productRepository->delete($id);

            if ($deleted) {
                $this->deletePhoto($product->photo);
            }

            return $deleted;
        });
    }

    public function getCategoriesForUser(int $userId): Collection
    {
        $userBranchIds = $this->getUserBranchIds($userId);

        $categories = $this->categoryRepository->all()->load('branches');

        return $categories
            ->map(function ($category) use ($userBranchIds) {
                $category->filtered_branches = $category->branches
                    ->filter(fn ($branch) => $userBranchIds->contains($branch->id))
                    ->values();
                return $category;
            })
            ->filter(fn ($category) => $category->filtered_branches->isNotEmpty())
            ->values();
    }

    public function getForExport(array $filters, int $userId): Collection
    {
        return $this->productRepository->getForUser($userId, $filters);
    }

    private function syncProductBranches(int $productId, array $branchIds): void
    {
        $this->productBranchRepository->deleteByProductId($productId);

        $timestamp = now();

        $payload = array_map(static function (int $branchId) use ($productId, $timestamp) {
            return [
                'product_id' => $productId,
                'branch_id' => $branchId,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ];
        }, array_values(array_unique($branchIds)));

        if (! empty($payload)) {
            $this->productBranchRepository->batchInsert($payload);
        }
    }

    private function validatedBranchIds(int $categoryId, array $branchIds, int $userId): array
    {
        $branchIds = array_map('intval', $branchIds);

        $category = $this->categoryRepository->getById($categoryId);

        if (! $category) {
            throw ValidationException::withMessages([
                'category_id' => 'Kategori tidak ditemukan.',
            ]);
        }

        $category->load('branches');

        $categoryBranchIds = $category->branches->pluck('id')->toArray();
        $userBranchIds = $this->getUserBranchIds($userId)->toArray();

        return array_values(array_intersect($branchIds, $categoryBranchIds, $userBranchIds));
    }

    private function storePhoto(?UploadedFile $photo): ?string
    {
        if (! $photo) {
            return null;
        }

        return $photo->store('products', 'public');
    }

    private function deletePhoto(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    private function getUserBranchIds(int $userId)
    {
        return $this->branchRepository
            ->getByUserId($userId)
            ->pluck('id');
    }
}
