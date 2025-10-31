<?php

namespace App\Repositories\Branch;

use App\Models\Branch;
use Illuminate\Database\Eloquent\Collection;

interface BranchRepository
{
    public function getById(int $id): ?Branch;
    public function store(array $data): Branch;
    public function update(int $id, array $data): ?Branch;
    public function delete(int $id): bool;
    public function all(): Collection;
}