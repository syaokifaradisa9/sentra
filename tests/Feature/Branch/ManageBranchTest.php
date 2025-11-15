<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithBranch;
use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);
uses(InteractsWithBranch::class);

it('allows a Businessman to create a branch', function () {
    $user = $this->createBusinessUser();
    $business = $this->createBusiness(['owner_id' => $user->id]);
    $payload = $this->branchPayload($business);

    actingAs($user)
        ->post(route('branches.store'), $payload)
        ->assertRedirect(route('branches.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('branches', [
        'business_id' => $business->id,
        'name' => $payload['name'],
    ]);
});

it('validates mandatory fields when creating a branch', function () {
    $user = $this->createBusinessUser();

    actingAs($user)
        ->post(route('branches.store'), [])
        ->assertSessionHasErrors(['name', 'address', 'business_id']);
});

it('updates an existing branch', function () {
    $user = $this->createBusinessUser();
    $business = $this->createBusiness(['owner_id' => $user->id]);
    $branch = $this->createBranch([
        'business_id' => $business->id,
        'owner_id' => $user->id,
        'name' => 'Old Branch',
    ]);

    $payload = [
        'business_id' => $business->id,
        'name' => 'New Branch Name',
        'address' => 'Updated Address',
        'opening_time' => '09:00',
        'closing_time' => '18:00',
    ];

    actingAs($user)
        ->put(route('branches.update', $branch), $payload)
        ->assertRedirect(route('branches.index'))
        ->assertSessionHas('success');

    $branch->refresh();

    expect($branch->name)->toBe('New Branch Name')
        ->and($branch->address)->toBe('Updated Address');
});

it('deletes a branch', function () {
    $user = $this->createBusinessUser();
    $business = $this->createBusiness(['owner_id' => $user->id]);
    $branch = $this->createBranch([
        'business_id' => $business->id,
        'owner_id' => $user->id,
    ]);

    actingAs($user)
        ->delete(route('branches.destroy', $branch))
        ->assertRedirect(route('branches.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('branches', ['id' => $branch->id]);
});

