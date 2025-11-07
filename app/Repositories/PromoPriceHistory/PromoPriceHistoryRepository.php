<?php

namespace App\Repositories\PromoPriceHistory;

use Illuminate\Support\Collection;

interface PromoPriceHistoryRepository
{
    public function insert(array $payload): void;
    public function deleteByPromoId(int $promoId): void;
    public function countDistinctProductsByPromoIds(array $promoIds): int;
    public function getRecentByUser(int $userId, int $limit = 5): Collection;
}
