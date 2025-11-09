<?php

use App\DataTransferObjects\BranchDTO;
use App\Models\Branch;
use App\Services\BranchService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithBranch;

uses(RefreshDatabase::class);
uses(InteractsWithBranch::class);

beforeEach(function () {
    $this->service = app(BranchService::class);
});

it('stores a branch through the real repository stack', function () {
    $user = $this->createBusinessUser();
    $business = $this->createBusiness(['owner_id' => $user->id]);

    $dto = new BranchDTO(
        businessId: $business->id,
        userId: $user->id,
        name: 'Integration Branch',
        address: 'Integration Address',
        openingTime: '08:00',
        closingTime: '17:00',
    );

    $branch = $this->service->store($dto);

    expect($branch)->toBeInstanceOf(Branch::class)
        ->and($branch->business_id)->toBe($business->id)
        ->and($branch->owner_id)->toBe($user->id);
});

it('updates and deletes a branch end-to-end', function () {
    $user = $this->createBusinessUser();
    $business = $this->createBusiness(['owner_id' => $user->id]);
    $branch = $this->createBranch([
        'business_id' => $business->id,
        'owner_id' => $user->id,
        'name' => 'Old Branch',
        'address' => 'Old Address',
    ]);

    $dto = new BranchDTO(
        businessId: $business->id,
        userId: $user->id,
        name: 'Updated Branch',
        address: 'New Address',
        openingTime: '09:00',
        closingTime: '18:00',
    );

    $updated = $this->service->update($branch->id, $dto);

    expect($updated->name)->toBe('Updated Branch')
        ->and($updated->address)->toBe('New Address');

    $deleteResult = $this->service->delete($branch->id);

    expect($deleteResult)->toBeTrue();
    $this->assertDatabaseMissing('branches', ['id' => $branch->id]);
});

