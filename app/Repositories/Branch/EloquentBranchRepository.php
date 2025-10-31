<?php

namespace App\Repositories\Branch;

use App\Models\Branch;
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
}