<?php

namespace App\Repositories\Business;

use App\Models\Business;
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
}