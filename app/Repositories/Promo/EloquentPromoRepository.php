<?php

namespace App\Repositories\Promo;

use App\Models\Promo;
use Illuminate\Database\Eloquent\Collection;

class EloquentPromoRepository implements PromoRepository
{
    public function __construct(
        private Promo $model,
    ) {}

    public function getById(int $id): ?Promo
    {
        return $this->model->find($id);
    }

    public function store(array $data): Promo
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data): ?Promo
    {
        $promo = $this->model->find($id);

        if ($promo) {
            $promo->update($data);
            return $promo->fresh();
        }

        return null;
    }

    public function delete(int $id): bool
    {
        $promo = $this->model->find($id);

        if ($promo) {
            return $promo->delete();
        }

        return false;
    }

    public function getForUser(int $userId): Collection
    {
        return $this->model
            ->newQuery()
            ->with(['product.category', 'scopedBusiness', 'scopedBranch'])
            ->where(function ($query) use ($userId) {
                $this->restrictToOwner($query, $userId);
            })
            ->orderByDesc('start_date')
            ->orderByDesc('created_at')
            ->get();
    }

    public function findForUser(int $promoId, int $userId): ?Promo
    {
        return $this->model
            ->newQuery()
            ->with(['product.branches', 'product.category', 'scopedBusiness', 'scopedBranch'])
            ->where('id', $promoId)
            ->where(function ($query) use ($userId) {
                $this->restrictToOwner($query, $userId);
            })
            ->first();
    }

    private function restrictToOwner($query, int $userId): void
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
