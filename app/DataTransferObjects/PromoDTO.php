<?php

namespace App\DataTransferObjects;

use App\Http\Requests\PromoRequest;

class PromoDTO
{
    public function __construct(
        public int $productId,
        public string $startDate,
        public string $endDate,
        public ?float $percentDiscount = null,
        public ?float $priceDiscount = null,
    ) {}

    public static function fromAppRequest(PromoRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            productId: (int) $validated['product_id'],
            startDate: $validated['start_date'],
            endDate: $validated['end_date'],
            percentDiscount: array_key_exists('percent_discount', $validated)
                ? (float) $validated['percent_discount']
                : null,
            priceDiscount: array_key_exists('price_discount', $validated)
                ? (float) $validated['price_discount']
                : null,
        );
    }

    public function toArray(): array
    {
        return [
            'product_id' => $this->productId,
            'start_date' => $this->startDate,
            'end_date' => $this->endDate,
            'percent_discount' => $this->percentDiscount,
            'price_discount' => $this->priceDiscount,
        ];
    }
}
