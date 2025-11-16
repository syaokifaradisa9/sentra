<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithBranch;
use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);
uses(InteractsWithBranch::class);

function employeePayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Employee Demo',
        'email' => 'employee-demo@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'phone' => '08123456789',
        'address' => 'Jl. Contoh No. 123',
        'position' => 'Cashier',
    ], $overrides);
}

it('allows a Businessman to create an employee for a single branch', function () {
    $businessman = $this->createBusinessUser();
    $branch = $this->createBranch(['owner_id' => $businessman->id]);

    $payload = employeePayload([
        'business_id' => $branch->business_id,
        'branch_id' => $branch->id,
    ]);

    actingAs($businessman)
        ->post(route('employees.store'), $payload)
        ->assertRedirect(route('employees.index'))
        ->assertSessionHas('success');

    $employeeId = User::where('email', $payload['email'])->value('id');

    expect($employeeId)->not->toBeNull();

    $this->assertDatabaseHas('branch_employee', [
        'user_id' => $employeeId,
        'branch_id' => $branch->id,
    ]);
});

it('rejects branches outside businessman-owned businesses', function () {
    $businessman = $this->createBusinessUser();
    $ownBranch = $this->createBranch(['owner_id' => $businessman->id]);
    $otherBranch = $this->createBranch();

    $payload = employeePayload([
        'business_id' => $ownBranch->business_id,
        'branch_id' => $otherBranch->id,
    ]);

    actingAs($businessman)
        ->post(route('employees.store'), $payload)
        ->assertSessionHasErrors(['branch_id']);
});

it('forces a SmallBusinessOwner to assign employees to their single branch', function () {
    $smallBusinessOwner = $this->createSmallBusinessOwnerUser();
    $ownedBranch = $this->createBranch(['owner_id' => $smallBusinessOwner->id]);
    $otherBranch = $this->createBranch();

    $payload = employeePayload([
        'branch_id' => $otherBranch->id,
    ]);

    actingAs($smallBusinessOwner)
        ->post(route('employees.store'), $payload)
        ->assertRedirect(route('employees.index'))
        ->assertSessionHas('success');

    $employeeId = User::where('email', $payload['email'])->value('id');

    $this->assertDatabaseHas('branch_employee', [
        'user_id' => $employeeId,
        'branch_id' => $ownedBranch->id,
    ]);
});
