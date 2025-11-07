<?php

namespace App\DataTransferObjects;

use App\Http\Requests\PromoRequest;

class PromoDTO
{
    public function __construct(
        public string $scopeType,
        public ?int $scopeId,
        public string $startDate,
        public string $endDate,
        public ?float $percentDiscount = null,
        public ?float $priceDiscount = null,
        public ?int $usageLimit = null,
    ) {}

    public static function fromAppRequest(PromoRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            scopeType: $validated['scope_type'],
            scopeId: $validated['scope_id'] ?? null,
            startDate: $validated['start_date'],
            endDate: $validated['end_date'],
            percentDiscount: array_key_exists('percent_discount', $validated)
                ? (float) $validated['percent_discount']
                : null,
            priceDiscount: array_key_exists('price_discount', $validated)
                ? (float) $validated['price_discount']
                : null,
            usageLimit: $validated['usage_limit'] ?? null,
        );
    }

    public function toArray(): array
    {
        $resolvedScopeId = $this->scopeId !== null && $this->scopeId !== ''
            ? (int) $this->scopeId
            : null;

        return [
            'product_id' => null,
            'scope_type' => $this->scopeType,
            'scope_id' => $resolvedScopeId,
            'start_date' => $this->startDate,
            'end_date' => $this->endDate,
            'percent_discount' => $this->percentDiscount,
            'price_discount' => $this->priceDiscount,
            'usage_limit' => $this->usageLimit,
        ];
    }
}
