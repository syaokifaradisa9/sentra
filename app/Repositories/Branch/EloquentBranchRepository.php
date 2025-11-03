<?php

namespace App\Repositories\Branch;

use App\Models\Branch;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class EloquentBranchRepository implements BranchRepository
{
    protected Branch $model;

    public function __construct(Branch $branch)
    {
        $this->model = $branch;
    }

    public function getById(int $id): ?Branch
    {
        return $this->model->find($id);
    }

    public function store(array $data): Branch
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data): ?Branch
    {
        $branch = $this->model->find($id);
        
        if ($branch) {
            $branch->update($data);
            return $branch->fresh();
        }
        
        return null;
    }

    public function delete(int $id): bool
    {
        $branch = $this->model->find($id);
        
        if ($branch) {
            return $branch->delete();
        }
        
        return false;
    }

    public function all(): Collection
    {
        return $this->model->all();
    }

    public function getByUserId(int $userId): Collection
    {
        return $this->model->where('user_id', $userId)->get();
    }

    public function paginateForUser(array $filters, int $userId): LengthAwarePaginator
    {
        $query = $this->buildQueryForUser($filters, $userId);

        $limit = (int) ($filters['limit'] ?? 20);

        return $query
            ->paginate($limit > 0 ? $limit : 20)
            ->withQueryString();
    }

    public function getForExport(array $filters, int $userId): Collection
    {
        return $this->buildQueryForUser($filters, $userId)->get();
    }

    private function buildQueryForUser(array $filters, int $userId): Builder
    {
        $query = $this->model->newQuery()
            ->where('user_id', $userId)
            ->with('business');

        $search = $filters['search'] ?? null;
        if ($search) {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('opening_time', 'like', "%{$search}%")
                    ->orWhere('closing_time', 'like', "%{$search}%")
                    ->orWhereHas('business', function ($businessQuery) use ($search) {
                        $businessQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if (! empty($filters['name'])) {
            $query->where('name', 'like', "%{$filters['name']}%");
        }

        if (! empty($filters['address'])) {
            $query->where('address', 'like', "%{$filters['address']}%");
        }

        if (! empty($filters['business'])) {
            $query->whereHas('business', function ($businessQuery) use ($filters) {
                $businessQuery->where('name', 'like', "%{$filters['business']}%");
            });
        }

        $allowedSortColumns = [
            'name',
            'address',
            'opening_time',
            'closing_time',
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
