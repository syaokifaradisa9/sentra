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
                $this->applyPromoOwnerScope($query, $userId);
            })
            ->latest('recorded_at')
            ->latest()
            ->limit($limit)
            ->get();
    }

    private function applyPromoOwnerScope($query, int $userId): void
    {
        $query->where(function ($builder) use ($userId) {
            $builder
                ->orWhere(function ($scope) use ($userId) {
                    $scope->where(function ($productScope) {
                        $productScope
                            ->whereNull('scope_type')
                            ->orWhere('scope_type', 'product');
                    })
                        ->whereHas('product.branches', function ($branchQuery) use ($userId) {
                            $branchQuery->where('branches.owner_id', $userId);
                        });
                })
                ->orWhere(function ($scope) use ($userId) {
                    $scope->where('scope_type', 'business')
                        ->whereHas('scopedBusiness', function ($businessQuery) use ($userId) {
                            $businessQuery->where('owner_id', $userId);
                        });
                })
                ->orWhere(function ($scope) use ($userId) {
                    $scope->where('scope_type', 'branch')
                        ->whereHas('scopedBranch', function ($branchQuery) use ($userId) {
                            $branchQuery->where('owner_id', $userId);
                        });
                });
        });
    }
}
