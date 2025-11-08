<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithBusiness;
use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);
uses(InteractsWithBusiness::class);

it('allows a Businessman to create a business', function () {
    $user = $this->createBusinessUser();

    $payload = [
        'name' => 'Test Bistro',
        'description' => 'Delicious food for everyone.',
    ];

    actingAs($user)
        ->post(route('business.store'), $payload)
        ->assertRedirect(route('business.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('businesses', [
        'owner_id' => $user->id,
        'name' => 'Test Bistro',
    ]);
});

it('validates mandatory fields when creating a business', function () {
    $user = $this->createBusinessUser();

    actingAs($user)
        ->post(route('business.store'), [])
        ->assertSessionHasErrors(['name']);
});

it('updates an owned business', function () {
    $user = $this->createBusinessUser();
    $business = $this->createBusiness(['owner_id' => $user->id, 'name' => 'Old Name']);

    $payload = [
        'name' => 'New Name',
        'description' => 'Updated description',
    ];

    actingAs($user)
        ->put(route('business.update', $business), $payload)
        ->assertRedirect(route('business.index'))
        ->assertSessionHas('success');

    $business->refresh();

    expect($business->name)->toBe('New Name')
        ->and($business->description)->toBe('Updated description');
});

it('prevents updating a business owned by someone else', function () {
    $owner = $this->createBusinessUser();
    $otherUser = $this->createBusinessUser();
    $business = $this->createBusiness(['owner_id' => $owner->id]);

    actingAs($otherUser)
        ->put(route('business.update', $business), [
            'name' => 'Should Fail',
        ])
        ->assertForbidden();
});

it('deletes an owned business', function () {
    $user = $this->createBusinessUser();
    $business = $this->createBusiness(['owner_id' => $user->id]);

    actingAs($user)
        ->delete(route('business.delete', $business))
        ->assertRedirect(route('business.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('businesses', [
        'id' => $business->id,
    ]);
});

it('prevents deleting a business owned by someone else', function () {
    $owner = $this->createBusinessUser();
    $otherUser = $this->createBusinessUser();
    $business = $this->createBusiness(['owner_id' => $owner->id]);

    actingAs($otherUser)
        ->delete(route('business.delete', $business))
        ->assertForbidden();

    $this->assertDatabaseHas('businesses', [
        'id' => $business->id,
    ]);
});
