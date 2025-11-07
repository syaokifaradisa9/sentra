<?php

namespace App\Services;

use App\DataTransferObjects\PromoDTO;
use App\Models\Promo;
use App\Repositories\Branch\BranchRepository;
use App\Repositories\Business\BusinessRepository;
use App\Repositories\Product\ProductRepository;
use App\Repositories\Promo\PromoRepository;
use App\Repositories\PromoPriceHistory\PromoPriceHistoryRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PromoService
{
    public function __construct(
        private PromoRepository $promoRepository,
        private ProductRepository $productRepository,
        private PromoPriceHistoryRepository $priceHistoryRepository,
        private BusinessRepository $businessRepository,
        private BranchRepository $branchRepository,
    ) {}

    public function listForUser(int $userId): Collection
    {
        return $this->promoRepository->getForUser($userId);
    }

    public function store(PromoDTO $dto, int $userId): Promo
    {
        return DB::transaction(function () use ($dto, $userId) {
            $productIds = $this->resolveProductIds($dto, $userId);

            if (empty($productIds)) {
                throw ValidationException::withMessages([
                    'scope_id' => 'Tidak ada produk yang cocok dengan cakupan promo.',
                ]);
            }

            $data = $dto->toArray();
            $data['impacted_products'] = count($productIds);

            $promo = $this->promoRepository->store($data);

            $this->recordPriceHistories($promo, $productIds, $dto);

            return $promo->fresh(['product']);
        });
    }

    public function findForUser(int $promoId, int $userId): ?Promo
    {
        return $this->promoRepository->findForUser($promoId, $userId);
    }

    public function update(int $promoId, PromoDTO $dto, int $userId): ?Promo
    {
        return DB::transaction(function () use ($promoId, $dto, $userId) {
            $promo = $this->promoRepository->findForUser($promoId, $userId);

            if (! $promo) {
                return null;
            }

            $productIds = $this->resolveProductIds($dto, $userId);

            if (empty($productIds)) {
                throw ValidationException::withMessages([
                    'scope_id' => 'Produk tidak valid untuk cakupan ini.',
                ]);
            }

            $data = $dto->toArray();
            $data['impacted_products'] = count($productIds);

            $updated = $this->promoRepository->update($promoId, $data);

            if (! $updated) {
                return null;
            }

            $this->recordPriceHistories($updated, $productIds, $dto);

            return $updated->fresh(['product']);
        });
    }

    public function delete(int $promoId, int $userId): bool
    {
        $promo = $this->promoRepository->findForUser($promoId, $userId);

        if (! $promo) {
            return false;
        }

        $this->priceHistoryRepository->deleteByPromoId($promoId);

        return $this->promoRepository->delete($promoId);
    }

    public function getAnalyticsSummary(int $userId): array
    {
        $promos = $this->promoRepository->getForUser($userId);
        $promoIds = $promos->pluck('id')->all();

        return [
            'total_promos' => $promos->count(),
            'active_promos' => $promos->filter(fn (Promo $promo) => $this->isPromoActive($promo))->count(),
            'total_usage' => $promos->sum('used_count'),
            'total_products' => $this->priceHistoryRepository->countDistinctProductsByPromoIds($promoIds),
        ];
    }

    public function getRecentPriceHistories(int $userId, int $limit = 5): Collection
    {
        return $this->priceHistoryRepository->getRecentByUser($userId, $limit);
    }

    private function resolveProductIds(PromoDTO $dto, int $userId): array
    {
        $product = $this->productRepository->getById($dto->productId);

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

        if ($dto->scopeType === 'business') {
            if (! $dto->scopeId) {
                throw ValidationException::withMessages([
                    'scope_id' => 'Pilih bisnis untuk promo ini.',
                ]);
            }

            $business = $this->businessRepository->getById($dto->scopeId);
            if (! $business || $business->owner_id !== $userId) {
                throw ValidationException::withMessages([
                    'scope_id' => 'Bisnis tidak valid atau tidak dimiliki.',
                ]);
            }

            $inBusiness = $product->branches
                ->pluck('business_id')
                ->contains((int) $dto->scopeId);

            if (! $inBusiness) {
                throw ValidationException::withMessages([
                    'scope_id' => 'Produk tidak tersedia pada bisnis ini.',
                ]);
            }
        }

        if ($dto->scopeType === 'branch') {
            if (! $dto->scopeId) {
                throw ValidationException::withMessages([
                    'scope_id' => 'Pilih cabang untuk promo ini.',
                ]);
            }

            $branch = $this->branchRepository->getById($dto->scopeId);
            if (! $branch || $branch->owner_id !== $userId) {
                throw ValidationException::withMessages([
                    'scope_id' => 'Cabang tidak valid atau tidak dimiliki.',
                ]);
            }

            $inBranch = $product->branches
                ->pluck('id')
                ->contains((int) $dto->scopeId);

            if (! $inBranch) {
                throw ValidationException::withMessages([
                    'scope_id' => 'Produk tidak tersedia pada cabang ini.',
                ]);
            }
        }

        return [$product->id];
    }

    private function recordPriceHistories(Promo $promo, array $productIds, PromoDTO $dto): void
    {
        $this->priceHistoryRepository->deleteByPromoId($promo->id);

        $products = $this->productRepository->getByIds($productIds);

        $timestamp = Carbon::now();
        $payload = [];

        foreach ($products as $product) {
            $promoPrice = $this->calculatePromoPrice((float) $product->price, $dto);

            $payload[] = [
                'promo_id' => $promo->id,
                'product_id' => $product->id,
                'base_price' => $product->price,
                'promo_price' => $promoPrice,
                'recorded_at' => $timestamp,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ];
        }

        if (empty($payload)) {
            $this->promoRepository->update($promo->id, [
                'impacted_products' => 0,
            ]);

            return;
        }

        $this->priceHistoryRepository->insert($payload);

        if (count($payload) !== (int) $promo->impacted_products) {
            $this->promoRepository->update($promo->id, [
                'impacted_products' => count($payload),
            ]);
        }
    }

    private function calculatePromoPrice(float $basePrice, PromoDTO $dto): float
    {
        $result = $basePrice;

        if (! is_null($dto->percentDiscount)) {
            $result -= $result * ($dto->percentDiscount / 100);
        }

        if (! is_null($dto->priceDiscount)) {
            $result -= $dto->priceDiscount;
        }

        return max($result, 0);
    }

    private function isPromoActive(Promo $promo): bool
    {
        $start = $promo->start_date ? Carbon::parse($promo->start_date)->startOfDay() : null;
        $end = $promo->end_date ? Carbon::parse($promo->end_date)->endOfDay() : null;

        if (! $start || ! $end) {
            return false;
        }

        $now = now();

        return $now->between($start, $end);
    }
}
