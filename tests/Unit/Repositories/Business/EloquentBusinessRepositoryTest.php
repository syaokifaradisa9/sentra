<?php

use App\Models\Business;
use App\Repositories\Business\BusinessRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithBusiness;

uses(RefreshDatabase::class);
uses(InteractsWithBusiness::class);

it('stores a business and returns the model instance', function () {
    $user = $this->createBusinessUser();
    $repository = app(BusinessRepository::class);

    $business = $repository->store([
        'owner_id' => $user->id,
        'name' => 'Repository Cafe',
        'description' => 'From repository test',
    ]);

    expect($business)->toBeInstanceOf(Business::class)
        ->and($business->exists)->toBeTrue();
});

it('updates a business record', function () {
    $repository = app(BusinessRepository::class);
    $business = $this->createBusiness(['name' => 'Before']);

    $updated = $repository->update($business->id, [
        'owner_id' => $business->owner_id,
        'name' => 'After',
        'description' => 'Updated',
    ]);

    expect($updated->name)->toBe('After')
        ->and($updated->description)->toBe('Updated');
});

it('deletes a business record', function () {
    $repository = app(BusinessRepository::class);
    $business = $this->createBusiness();

    $result = $repository->delete($business->id);

    expect($result)->toBeTrue();
    $this->assertDatabaseMissing('businesses', ['id' => $business->id]);
});

it('retrieves businesses by owner id', function () {
    $repository = app(BusinessRepository::class);
    $user = $this->createBusinessUser();
    $this->createBusiness(['owner_id' => $user->id]);
    $this->createBusiness(['owner_id' => $user->id]);

    $businesses = $repository->getByOwnerId($user->id);

    expect($businesses)->toHaveCount(2);
});

