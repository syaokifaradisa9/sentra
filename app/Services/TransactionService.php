<?php

namespace App\Services;

use App\DataTransferObjects\TransactionDTO;
use App\Models\Transaction;
use App\Repositories\ProductTransaction\ProductTransactionRepository;
use App\Repositories\Transaction\TransactionRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TransactionService
{
    public function __construct(
        private TransactionRepository $transactionRepository,
        private ProductTransactionRepository $productTransactionRepository,
    ) {}

    public function create(TransactionDTO $dto): array
    {
        return DB::transaction(function () use ($dto) {
            $subtotal = $this->calculateSubtotal($dto);
            $total = $this->applyDiscount($subtotal, $dto->discountType, $dto->discountValue);

            if ($dto->paymentAmount < $total) {
                throw ValidationException::withMessages([
                    'payment_amount' => 'Jumlah pembayaran tidak mencukupi.',
                ]);
            }

            $change = $dto->paymentAmount - $total;
            $transactionNumber = $this->generateTransactionNumber();

            $transaction = $this->transactionRepository->store([
                'transaction_number' => $transactionNumber,
                'customer_name' => $dto->customerName,
                'customer_phone' => $dto->customerPhone,
                'branch_id' => $dto->branchId,
                'user_id' => $dto->userId,
                'discount_type' => $dto->discountType,
                'discount_value' => $dto->discountValue,
                'subtotal' => $subtotal,
                'total_amount' => $total,
            ]);

            $this->productTransactionRepository->createMany(
                $this->mapProductTransactions($dto, $transaction)
            );

            return [
                'transaction' => $transaction,
                'change_amount' => round($change, 2),
            ];
        });
    }

    private function calculateSubtotal(TransactionDTO $dto): float
    {
        return collect($dto->items)->reduce(function ($carry, $item) {
            $line = (float) ($item['price'] ?? 0) * (int) ($item['quantity'] ?? 0);
            return $carry + $line;
        }, 0.0);
    }

    private function applyDiscount(float $subtotal, ?string $type, ?float $value): float
    {
        if ($subtotal <= 0) {
            return 0.0;
        }

        if (! $type || $value === null) {
            return round($subtotal, 2);
        }

        if ($type === 'amount') {
            $result = max($subtotal - $value, 0);
        } elseif ($type === 'percent') {
            $percentage = min(max($value, 0), 100);
            $result = $subtotal - ($subtotal * ($percentage / 100));
        } else {
            $result = $subtotal;
        }

        return round($result, 2);
    }

    private function generateTransactionNumber(): string
    {
        $prefix = now()->format('ymd');
        $dailyCount = $this->transactionRepository->countByPrefix($prefix) + 1;
        $sequence = str_pad((string) $dailyCount, 4, '0', STR_PAD_LEFT);

        return $prefix . $sequence;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function mapProductTransactions(TransactionDTO $dto, Transaction $transaction): array
    {
        $timestamp = now();

        return collect($dto->items)->map(function ($item) use ($transaction, $timestamp) {
            $price = (float) ($item['price'] ?? 0);
            $quantity = (int) ($item['quantity'] ?? 0);

            return [
                'transaction_id' => $transaction->id,
                'product_id' => $item['product_id'],
                'product_name' => $item['product_name'] ?? '',
                'category_name' => $item['category_name'] ?? null,
                'price' => $price,
                'quantity' => $quantity,
                'promo_id' => $item['promo_id'] ?? null,
                'discount_percent' => $item['discount_percent'] ?? null,
                'discount_price' => $item['discount_price'] ?? null,
                'line_total' => round($price * $quantity, 2),
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ];
        })->all();
    }
}
