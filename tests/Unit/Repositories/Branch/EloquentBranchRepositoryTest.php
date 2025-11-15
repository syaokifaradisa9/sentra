<?php

use App\Models\Branch;
use App\Repositories\Branch\BranchRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithBranch;

uses(RefreshDatabase::class);
uses(InteractsWithBranch::class);

it('stores a branch and returns the model instance', function () {
    $repository = app(BranchRepository::class);
    $business = $this->createBusiness();

    $branch = $repository->store([
        'business_id' => $business->id,
        'owner_id' => $business->owner_id,
        'name' => 'Repository Branch',
        'address' => '123 Repo Street',
        'opening_time' => '08:00',
        'closing_time' => '17:00',
    ]);

    expect($branch)->toBeInstanceOf(Branch::class)
        ->and($branch->exists)->toBeTrue();
});

it('updates a stored branch', function () {
    $repository = app(BranchRepository::class);
    $branch = $this->createBranch(['name' => 'Before']);

    $updated = $repository->update($branch->id, [
        'business_id' => $branch->business_id,
        'owner_id' => $branch->owner_id,
        'name' => 'After',
        'address' => 'Updated Address',
        'opening_time' => '09:00',
        'closing_time' => '18:00',
    ]);

    expect($updated->name)->toBe('After')
        ->and($updated->address)->toBe('Updated Address');
});

it('deletes a branch record', function () {
    $repository = app(BranchRepository::class);
    $branch = $this->createBranch();

    $result = $repository->delete($branch->id);

    expect($result)->toBeTrue();
    $this->assertDatabaseMissing('branches', ['id' => $branch->id]);
});

it('retrieves branches by owner id', function () {
    $repository = app(BranchRepository::class);
    $business = $this->createBusiness();
    $this->createBranch(['business_id' => $business->id, 'owner_id' => $business->owner_id]);
    $this->createBranch(['business_id' => $business->id, 'owner_id' => $business->owner_id]);

    $branches = $repository->getByOwnerId($business->owner_id);

    expect($branches)->toHaveCount(2);
});

it('retrieves branches by business id', function () {
    $repository = app(BranchRepository::class);
    $business = $this->createBusiness();
    $this->createBranch(['business_id' => $business->id]);
    $this->createBranch(['business_id' => $business->id]);

    $branches = $repository->getByBusinessId($business->id);

    expect($branches)->toHaveCount(2);
});

it('retrieves branches assigned to a user', function () {
    $repository = app(BranchRepository::class);
    $user = $this->createBusinessUser();
    $business = $this->createBusiness(['owner_id' => $user->id]);
    $branch = $this->createBranch(['business_id' => $business->id, 'owner_id' => $user->id]);

    $branch->users()->attach($user);

    $branches = $repository->getByUserId($user->id);

    expect($branches)->toHaveCount(1)
        ->and($branches->first()->id)->toBe($branch->id);
});

