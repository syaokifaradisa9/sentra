<?php

namespace App\Services;

use App\DataTransferObjects\CategoryDTO;
use App\Models\Category;
use App\Repositories\Branch\BranchRepository;
use App\Repositories\Category\CategoryRepository;
use App\Repositories\CategoryBranch\CategoryBranchRepository;
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

    public function store(CategoryDTO $dto): Category
    {
        return DB::transaction(function () use ($dto) {
            $category = $this->categoryRepository->store($dto->toArray());
            $this->syncCategoryBranches($category->id, $dto->branchIds);

            return $category->load('branches');
        });
    }

    public function update(int $id, CategoryDTO $dto): ?Category
    {
        return DB::transaction(function () use ($id, $dto) {
            $this->categoryRepository->update($id, [
                'name' => $dto->name
            ]);
            
            $this->syncCategoryBranches($id, $dto->branchIds);

            return $this->categoryRepository->getById($id)?->load('branches');
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $this->categoryBranchRepository->deleteByCategoryId($id);

            return $this->categoryRepository->delete($id);
        });
    }

    private function syncCategoryBranches(int $categoryId, array $branchIds): void
    {
        $this->categoryBranchRepository->deleteByCategoryId($categoryId);

        $payload = array_map(static function (int $branchId) use ($categoryId) {
            return [
                'category_id' => $categoryId,
                'branch_id' => $branchId,
            ];
        }, $branchIds);

        $this->categoryBranchRepository->batchInsert($payload);
    }

    public function getByOwnerId(int $ownerId): Collection
    {
        return $this->categoryRepository->getByOwnerId($ownerId);
    }

    public function getOptionsByOwnerId(int $userId): array
    {
        $categories = $this->categoryRepository->getByOwnerId($userId);
        
        return $categories->map(function ($category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
            ];
        })->toArray();
    }
}
