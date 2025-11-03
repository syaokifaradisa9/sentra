<?php

namespace App\Services;

use App\DataTransferObjects\CategoryDTO;
use App\Models\Category;
use App\Repositories\Branch\BranchRepository;
use App\Repositories\Category\CategoryRepository;
use App\Repositories\CategoryBranch\CategoryBranchRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class CategoryService
{
    public function __construct(
        private CategoryRepository $categoryRepository,
        private CategoryBranchRepository $categoryBranchRepository,
        private BranchRepository $branchRepository,
    ) {}

    public function all(): Collection
    {
        return $this->categoryRepository->all()->load('branches');
    }

    public function getById(int $id): ?Category
    {
        $category = $this->categoryRepository->getById($id);

        return $category?->load('branches');
    }

    public function store(CategoryDTO $dto, int $userId): Category
    {
        return DB::transaction(function () use ($dto, $userId) {
            $category = $this->categoryRepository->store($dto->toArray());

            $this->syncCategoryBranches($category->id, $dto->branchIds, $userId);

            return $category->load('branches');
        });
    }

    public function update(int $id, CategoryDTO $dto, int $userId): ?Category
    {
        return DB::transaction(function () use ($id, $dto, $userId) {
            $category = $this->categoryRepository->update($id, $dto->toArray());

            if (! $category) {
                return null;
            }

            $this->syncCategoryBranches($id, $dto->branchIds, $userId);

            return $category->load('branches');
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $this->categoryBranchRepository->deleteByCategoryId($id);

            return $this->categoryRepository->delete($id);
        });
    }

    public function getBranchesForUser(int $userId): Collection
    {
        return $this->branchRepository->getByUserId($userId);
    }

    public function paginateForUser(array $filters, int $userId): LengthAwarePaginator
    {
        $branchIds = $this->branchRepository
            ->getByUserId($userId)
            ->pluck('id')
            ->toArray();

        return $this->categoryRepository->paginateForBranchIds($branchIds, $filters);
    }

    public function getForExport(array $filters, int $userId): Collection
    {
        $branchIds = $this->branchRepository
            ->getByUserId($userId)
            ->pluck('id')
            ->toArray();

        return $this->categoryRepository->getForBranchIds($branchIds, $filters);
    }

    private function syncCategoryBranches(int $categoryId, array $branchIds, int $userId): void
    {
        $branchIds = array_unique(array_map('intval', $branchIds));

        $userBranchIds = $this->branchRepository
            ->getByUserId($userId)
            ->pluck('id')
            ->toArray();

        $validBranchIds = array_values(array_intersect($userBranchIds, $branchIds));

        $this->categoryBranchRepository->deleteByCategoryId($categoryId);

        if (empty($validBranchIds)) {
            return;
        }

        $timestamp = now();
        $payload = array_map(static function (int $branchId) use ($categoryId, $timestamp) {
            return [
                'category_id' => $categoryId,
                'branch_id' => $branchId,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ];
        }, $validBranchIds);

        $this->categoryBranchRepository->batchInsert($payload);
    }
}
