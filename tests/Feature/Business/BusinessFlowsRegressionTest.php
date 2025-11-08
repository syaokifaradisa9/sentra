<?php

use App\Models\Business;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithBusiness;
use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);
uses(InteractsWithBusiness::class);

it('performs a full business CRUD regression flow', function () {
    $user = $this->createBusinessUser();

    $createPayload = [
        'name' => 'Regression Bistro',
        'description' => 'Initial description',
    ];

    actingAs($user)
        ->post(route('business.store'), $createPayload)
        ->assertRedirect(route('business.index'))
        ->assertSessionHas('success');

    $business = Business::where('name', 'Regression Bistro')->first();
    expect($business)->not->toBeNull();

    $updatePayload = [
        'name' => 'Regression Bistro Updated',
        'description' => 'Updated description',
    ];

    actingAs($user)
        ->put(route('business.update', $business), $updatePayload)
        ->assertRedirect(route('business.index'))
        ->assertSessionHas('success');

    $business->refresh();
    expect($business->name)->toBe('Regression Bistro Updated')
        ->and($business->description)->toBe('Updated description');

    actingAs($user)
        ->delete(route('business.delete', $business))
        ->assertRedirect(route('business.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('businesses', ['id' => $business->id]);
});

