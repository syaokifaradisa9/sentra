<?php

namespace Tests\Concerns;

use App\Models\Business;
use App\Models\User;
use Spatie\Permission\Models\Role;

trait InteractsWithBusiness
{
    protected function createBusinessUser(array $attributes = []): User
    {
        /** @var User $user */
        $user = User::factory()->create($attributes);
        $this->ensureBusinessmanRoleExists();
        $user->assignRole('Businessman');

        return $user;
    }

    protected function createBusiness(array $attributes = []): Business
    {
        $owner = $attributes['owner_id'] ?? $this->createBusinessUser()->id;

        if ($owner instanceof User) {
            $owner = $owner->id;
        }

        return Business::factory()->create(array_merge([
            'owner_id' => $owner,
            'name' => fake()->company(),
            'description' => fake()->sentence(),
        ], $attributes));
    }

    protected function ensureBusinessmanRoleExists(): void
    {
        Role::findOrCreate('Businessman', 'web');
    }
}

