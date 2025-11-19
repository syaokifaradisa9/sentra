<?php

namespace App\DataTransferObjects;

class TransactionDTO
{
    /**
     * @param  array<int, array<string, mixed>>  $items
     */
    public function __construct(
        public readonly ?string $customerName,
        public readonly ?string $customerPhone,
        public readonly int $branchId,
        public readonly int $userId,
        public readonly ?string $discountType,
        public readonly ?float $discountValue,
        public readonly float $paymentAmount,
        public readonly array $items,
    ) {}

    public static function fromArray(array $payload, int $userId): self
    {
        return new self(
            customerName: $payload['customer_name'] ?? null,
            customerPhone: $payload['customer_phone'] ?? null,
            branchId: (int) $payload['branch_id'],
            userId: $userId,
            discountType: $payload['discount_type'] ?? null,
            discountValue: isset($payload['discount_value']) ? (float) $payload['discount_value'] : null,
            paymentAmount: (float) $payload['payment_amount'],
            items: $payload['items'] ?? [],
        );
    }
}
