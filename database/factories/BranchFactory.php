<?php

namespace Database\Factories;

use App\Models\Branch;
use App\Models\Business;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Branch>
 */
class BranchFactory extends Factory
{
    protected $model = Branch::class;

    public function definition(): array
    {
        return [
            'business_id' => Business::factory(),
            'owner_id' => function (array $attributes) {
                $business = Business::find($attributes['business_id']);

                if ($business) {
                    return $business->owner_id;
                }

                return Business::factory()->create()->owner_id;
            },
            'name' => fake()->company() . ' Branch',
            'address' => fake()->address(),
            'opening_time' => '08:00',
            'closing_time' => '17:00',
        ];
    }
}

