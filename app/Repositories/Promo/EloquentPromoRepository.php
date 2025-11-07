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
            ->where('owner_id', $userId)
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
            ->where('owner_id', $userId)
            ->first();
    }
}
