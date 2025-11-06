<?php

namespace App\Repositories\Product;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Builder;

class EloquentProductRepository implements ProductRepository
{
    protected Product $model;

    public function __construct(Product $product)
    {
        $this->model = $product;
    }

    public function getById(int $id): ?Product
    {
        return $this->model->find($id);
    }

    public function store(array $data): Product
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data): ?Product
    {
        $product = $this->model->find($id);
        
        if ($product) {
            $product->update($data);
            return $product->fresh();
        }
        
        return null;
    }

    public function delete(int $id): bool
    {
        $product = $this->model->find($id);
        
        if ($product) {
            return $product->delete();
        }
        
        return false;
    }

    public function all(): Collection
    {
        return $this->model->all();
    }

    public function getByBranchId(int $branchId): Collection
    {
        return $this->model->whereHas('category.branches', function ($query) use ($branchId) {
            $query->where('branches.id', $branchId);
        })->get();
    }

    public function getByBusinessId(int $businessId): Collection
    {
        return $this->model->whereHas('category.branches', function ($query) use ($businessId) {
            $query->where('branches.business_id', $businessId);
        })->get();
    }

    public function getByCategoryId(int $categoryId): Collection
    {
        return $this->model->where('category_id', $categoryId)->get();
    }

    public function paginateForUser(int $userId, array $filters): LengthAwarePaginator
    {
        $query = $this->buildQueryForUser($userId, $filters);

        $limit = (int) ($filters['limit'] ?? 20);

        return $query
            ->paginate($limit > 0 ? $limit : 20)
            ->withQueryString();
    }

    public function getForUser(int $userId, array $filters): Collection
    {
        return $this->buildQueryForUser($userId, $filters)->get();
    }

    private function buildQueryForUser(int $userId, array $filters): Builder
    {
        $query = $this->model
            ->newQuery()
            ->with(['category.branches', 'branches']);

        $query->whereHas('branches', function ($builder) use ($userId) {
            $builder->where('branches.owner_id', $userId);
        });

        $search = $filters['search'] ?? null;
        if ($search) {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('category', function ($categoryQuery) use ($search) {
                        $categoryQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if (! empty($filters['name'])) {
            $query->where('name', 'like', "%{$filters['name']}%");
        }

        if (! empty($filters['description'])) {
            $query->where('description', 'like', "%{$filters['description']}%");
        }

        if (! empty($filters['category'])) {
            $query->whereHas('category', function ($builder) use ($filters) {
                $builder->where('name', 'like', "%{$filters['category']}%");
            });
        }

        if (! empty($filters['branch'])) {
            $query->whereHas('branches', function ($builder) use ($filters) {
                $builder->where('name', 'like', "%{$filters['branch']}%");
            });
        }

        $allowedSortColumns = [
            'name',
            'price',
            'created_at',
            'updated_at',
        ];

        $sortBy = $filters['sort_by'] ?? 'created_at';
        if (! in_array($sortBy, $allowedSortColumns, true)) {
            $sortBy = 'created_at';
        }

        $sortDirection = strtolower($filters['sort_direction'] ?? 'desc');
        $sortDirection = $sortDirection === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortBy, $sortDirection);
    }
}
