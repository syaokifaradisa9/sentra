<?php

namespace App\Repositories\Category;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;

interface CategoryRepository
{
    public function getById(int $id): ?Category;
    public function store(array $data): Category;
    public function update(int $id, array $data): ?Category;
    public function delete(int $id): bool;
    public function all(): Collection;
    public function getByBranchId(int $branchId): Collection;
    public function getByBusinessId(int $businessId): Collection;
    public function getByOwnerId(int $ownerId): Collection;
}
