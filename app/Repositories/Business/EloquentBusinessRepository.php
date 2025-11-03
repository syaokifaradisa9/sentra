<?php

namespace App\Repositories\Business;

use App\Models\Business;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class EloquentBusinessRepository implements BusinessRepository
{
    protected Business $model;

    public function __construct(Business $business)
    {
        $this->model = $business;
    }

    public function getById(int $id): ?Business
    {
        return $this->model->find($id);
    }

    public function store(array $data): Business
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data): ?Business
    {
        $business = $this->model->find($id);
        
        if ($business) {
            $business->update($data);
            return $business->fresh();
        }
        
        return null;
    }

    public function delete(int $id): bool
    {
        $business = $this->model->find($id);
        
        if ($business) {
            return $business->delete();
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

    public function existsForUser(int $businessId, int $userId): bool
    {
        return $this->model
            ->where('id', $businessId)
            ->where('user_id', $userId)
            ->exists();
    }

    public function paginateForUser(array $filters, int $userId): LengthAwarePaginator
    {
        $query = $this->model->newQuery()->where('user_id', $userId);

        $search = $filters['search'] ?? null;
        if ($search) {
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['name'])) {
            $query->where('name', 'like', "%{$filters['name']}%");
        }

        if (! empty($filters['description'])) {
            $query->where('description', 'like', "%{$filters['description']}%");
        }

        $allowedSortColumns = ['name', 'description', 'created_at', 'updated_at'];
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
