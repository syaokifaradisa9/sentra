<?php

namespace App\Repositories\PromoPriceHistory;

use App\Models\PromoPriceHistory;
use Illuminate\Support\Collection;

class EloquentPromoPriceHistoryRepository implements PromoPriceHistoryRepository
{
    public function __construct(
        private PromoPriceHistory $model,
    ) {}

    public function insert(array $payload): void
    {
        if (empty($payload)) {
            return;
        }

        $this->model->newQuery()->insert($payload);
    }

    public function deleteByPromoId(int $promoId): void
    {
        $this->model->newQuery()->where('promo_id', $promoId)->delete();
    }

    public function countDistinctProductsByPromoIds(array $promoIds): int
    {
        if (empty($promoIds)) {
            return 0;
        }

        return $this->model->newQuery()
            ->whereIn('promo_id', $promoIds)
            ->distinct('product_id')
            ->count('product_id');
    }

    public function getRecentByUser(int $userId, int $limit = 5): Collection
    {
        return $this->model->newQuery()
            ->with(['promo', 'product'])
            ->whereHas('promo', function ($query) use ($userId) {
                $query->where('owner_id', $userId);
            })
            ->latest('recorded_at')
            ->latest()
            ->limit($limit)
            ->get();
    }
}
