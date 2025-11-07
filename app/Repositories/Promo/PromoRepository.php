<?php

namespace App\Repositories\Promo;

use App\Models\Promo;
use Illuminate\Database\Eloquent\Collection;

interface PromoRepository
{
    public function getById(int $id): ?Promo;
    public function store(array $data): Promo;
    public function update(int $id, array $data): ?Promo;
    public function delete(int $id): bool;
    public function getForUser(int $userId): Collection;
    public function findForUser(int $promoId, int $userId): ?Promo;
}
