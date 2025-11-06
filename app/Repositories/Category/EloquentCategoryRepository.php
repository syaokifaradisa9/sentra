<?php

namespace App\Repositories\Category;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;

class EloquentCategoryRepository implements CategoryRepository
{
    protected Category $model;

    public function __construct(Category $category)
    {
        $this->model = $category;
    }

    public function getById(int $id): ?Category
    {
        return $this->model->find($id);
    }

    public function store(array $data): Category
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data): ?Category
    {
        $category = $this->model->find($id);

        if ($category) {
            $category->update($data);
            return $category->fresh();
        }

        return null;
    }

    public function delete(int $id): bool
    {
        $category = $this->model->find($id);

        if ($category) {
            return $category->delete();
        }

        return false;
    }

    public function all(): Collection
    {
        return $this->model->all();
    }

    public function getByBranchId(int $branchId): Collection
    {
        return $this->model->whereHas('branches', function ($query) use ($branchId) {
            $query->where('branches.id', $branchId);
        })->get();
    }

    public function getByBusinessId(int $businessId): Collection
    {
        return $this->model->whereHas('branches', function ($query) use ($businessId) {
            $query->where('branches.business_id', $businessId);
        })->get();
    }

    public function getByOwnerId(int $ownerId): Collection
    {
        return $this->model
            ->whereHas('branches', function ($query) use ($ownerId) {
                $query->where('owner_id', $ownerId);
            })
            ->with(['branches' => function ($query) use ($ownerId) {
                $query->where('owner_id', $ownerId);
            }])
            ->get();
    }
}
