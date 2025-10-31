<?php

namespace App\Repositories\Business;

use App\Models\Business;
use Illuminate\Database\Eloquent\Collection;

interface BusinessRepository
{
    public function getById(int $id): ?Business;
    public function store(array $data): Business;
    public function update(int $id, array $data): ?Business;
    public function delete(int $id): bool;
    public function all(): Collection;
}