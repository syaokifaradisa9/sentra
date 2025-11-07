<?php

namespace App\Services;

use App\DataTransferObjects\PromoDTO;
use App\Models\Promo;
use App\Repositories\Product\ProductRepository;
use App\Repositories\Promo\PromoRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

class PromoService
{
    public function __construct(
        private PromoRepository $promoRepository,
        private ProductRepository $productRepository,
    ) {}

    public function listForUser(int $userId): Collection
    {
        return $this->promoRepository->getForUser($userId);
    }

    public function store(PromoDTO $dto, int $userId): Promo
    {
        $this->ensureProductOwnedByUser($dto->productId, $userId);

        return $this->promoRepository->store($dto->toArray());
    }

    public function findForUser(int $promoId, int $userId): ?Promo
    {
        return $this->promoRepository->findForUser($promoId, $userId);
    }

    public function update(int $promoId, PromoDTO $dto, int $userId): ?Promo
    {
        $promo = $this->promoRepository->findForUser($promoId, $userId);

        if (! $promo) {
            return null;
        }

        if ($promo->product_id !== $dto->productId) {
            $this->ensureProductOwnedByUser($dto->productId, $userId);
        }

        return $this->promoRepository->update($promoId, $dto->toArray());
    }

    public function delete(int $promoId, int $userId): bool
    {
        $promo = $this->promoRepository->findForUser($promoId, $userId);

        if (! $promo) {
            return false;
        }

        return $this->promoRepository->delete($promoId);
    }

    private function ensureProductOwnedByUser(int $productId, int $userId): void
    {
        $product = $this->productRepository->getById($productId);

        if (! $product) {
            throw ValidationException::withMessages([
                'product_id' => 'Produk tidak ditemukan.',
            ]);
        }

        $product->loadMissing('branches');

        $hasAccess = $product->branches
            ->pluck('owner_id')
            ->map(static fn ($id) => (int) $id)
            ->contains((int) $userId);

        if (! $hasAccess) {
            throw ValidationException::withMessages([
                'product_id' => 'Anda tidak memiliki akses ke produk ini.',
            ]);
        }
    }
}
