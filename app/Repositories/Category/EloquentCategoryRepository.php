<?php

namespace App\Repositories\Category;

use App\Models\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
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

    public function paginateForBranchIds(array $branchIds, array $filters): LengthAwarePaginator
    {
        $query = $this->model->newQuery()->with('branches');

        if (! empty($branchIds)) {
            $query->whereHas('branches', function ($builder) use ($branchIds) {
                $builder->whereIn('branches.id', $branchIds);
            });
        } else {
            $query->whereRaw('1 = 0');
        }

        $search = $filters['search'] ?? null;
        if ($search) {
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhereHas('branches', function ($branchQuery) use ($search) {
                        $branchQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if (! empty($filters['name'])) {
            $query->where('name', 'like', "%{$filters['name']}%");
        }

        if (! empty($filters['branch'])) {
            $query->whereHas('branches', function ($builder) use ($filters) {
                $builder->where('name', 'like', "%{$filters['branch']}%");
            });
        }

        $allowedSortColumns = [
            'name',
            'created_at',
            'updated_at',
        ];

        $sortBy = $filters['sort_by'] ?? 'created_at';
        if (! in_array($sortBy, $allowedSortColumns, true)) {
            $sortBy = 'created_at';
        }

        $sortDirection = strtolower($filters['sort_direction'] ?? 'desc');
        $sortDirection = $sortDirection === 'asc' ? 'asc' : 'desc';

        $limit = (int) ($filters['limit'] ?? 20);

        return $query
            ->orderBy($sortBy, $sortDirection)
            ->paginate($limit > 0 ? $limit : 20)
            ->withQueryString();
    }
}
