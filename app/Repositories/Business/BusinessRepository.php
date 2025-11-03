<?php

namespace App\Repositories\Business;

use App\Models\Business;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface BusinessRepository
{
    public function getById(int $id): ?Business;
    public function store(array $data): Business;
    public function update(int $id, array $data): ?Business;
    public function delete(int $id): bool;
    public function all(): Collection;
    public function getByUserId(int $userId): Collection;
    public function existsForUser(int $businessId, int $userId): bool;
    public function paginateForUser(array $filters, int $userId): LengthAwarePaginator;
    public function getForExport(array $filters, int $userId): Collection;
}

