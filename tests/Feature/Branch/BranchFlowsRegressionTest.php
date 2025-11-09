<?php

use App\Models\Branch;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithBranch;
use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);
uses(InteractsWithBranch::class);

it('performs a full branch CRUD regression flow', function () {
    $user = $this->createBusinessUser();
    $business = $this->createBusiness(['owner_id' => $user->id]);

    $createPayload = [
        'business_id' => $business->id,
        'name' => 'Regression Branch',
        'address' => 'Regression Address',
        'opening_time' => '08:00',
        'closing_time' => '17:00',
    ];

    actingAs($user)
        ->post(route('branches.store'), $createPayload)
        ->assertRedirect(route('branches.index'))
        ->assertSessionHas('success');

    $branch = Branch::where('name', 'Regression Branch')->first();
    expect($branch)->not->toBeNull();

    $updatePayload = [
        'business_id' => $business->id,
        'name' => 'Regression Branch Updated',
        'address' => 'Updated Regression Address',
        'opening_time' => '09:00',
        'closing_time' => '18:00',
    ];

    actingAs($user)
        ->put(route('branches.update', $branch), $updatePayload)
        ->assertRedirect(route('branches.index'))
        ->assertSessionHas('success');

    $branch->refresh();
    expect($branch->name)->toBe('Regression Branch Updated')
        ->and($branch->address)->toBe('Updated Regression Address');

    actingAs($user)
        ->delete(route('branches.destroy', $branch))
        ->assertRedirect(route('branches.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('branches', ['id' => $branch->id]);
});

