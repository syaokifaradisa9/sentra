<?php

use App\DataTransferObjects\BusinessDTO;
use App\Models\Business;
use App\Services\BusinessService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithBusiness;

uses(RefreshDatabase::class);
uses(InteractsWithBusiness::class);

beforeEach(function () {
    $this->service = app(BusinessService::class);
});

it('stores a business through the real repository stack', function () {
    $user = $this->createBusinessUser();

    $dto = new BusinessDTO(
        userId: $user->id,
        name: 'Integration Bistro',
        description: 'End-to-end creation'
    );

    $business = $this->service->store($dto);

    expect($business)->toBeInstanceOf(Business::class)
        ->and($business->owner_id)->toBe($user->id)
        ->and($business->name)->toBe('Integration Bistro');
});

it('updates and deletes a business end-to-end', function () {
    $user = $this->createBusinessUser();
    $business = $this->createBusiness([
        'owner_id' => $user->id,
        'name' => 'Old Name',
        'description' => 'Old description',
    ]);

    $dto = new BusinessDTO(
        userId: $user->id,
        name: 'New Name',
        description: 'Updated via integration test'
    );

    $updated = $this->service->update($business->id, $dto);

    expect($updated->name)->toBe('New Name')
        ->and($updated->description)->toBe('Updated via integration test');

    $deleteResult = $this->service->delete($business->id, $user->id);

    expect($deleteResult)->toBeTrue();
    $this->assertDatabaseMissing('businesses', ['id' => $business->id]);
});

