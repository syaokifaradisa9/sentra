<?php

namespace Tests\Concerns;

use App\Models\Branch;
use App\Models\Business;

trait InteractsWithBranch
{
    use InteractsWithBusiness;

    protected function createBranch(array $attributes = []): Branch
    {
        $businessAttribute = $attributes['business_id'] ?? null;

        if ($businessAttribute instanceof Business) {
            $business = $businessAttribute;
            unset($attributes['business_id']);
        } elseif ($businessAttribute) {
            $business = Business::find($businessAttribute) ?? $this->createBusiness();
            $attributes['business_id'] = $business->id;
        } else {
            $business = $this->createBusiness();
        }

        $businessId = $business->id;
        $defaultOwner = $business->owner_id;

        $ownerId = $attributes['owner_id'] ?? $defaultOwner ?? $this->createBusinessUser()->id;

        $defaults = [
            'business_id' => $businessId,
            'owner_id' => $ownerId,
            'name' => fake()->company() . ' Branch',
            'address' => fake()->address(),
            'opening_time' => '08:00',
            'closing_time' => '17:00',
        ];

        return Branch::factory()->create(array_merge($defaults, $attributes));
    }

    protected function branchPayload(?Business $business = null, array $overrides = []): array
    {
        $business ??= $this->createBusiness();

        $payload = [
            'business_id' => $business->id,
            'name' => fake()->company() . ' Branch',
            'address' => fake()->address(),
            'opening_time' => '08:00',
            'closing_time' => '17:00',
        ];

        return array_merge($payload, $overrides);
    }
}
