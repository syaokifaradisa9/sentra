<?php

use App\DataTransferObjects\BusinessDTO;
use App\Models\Business;
use App\Repositories\Business\BusinessRepository;
use App\Services\BusinessService;
use Mockery as M;

beforeEach(function () {
    $this->repository = M::mock(BusinessRepository::class);
    $this->service = new BusinessService($this->repository);
});

afterEach(fn () => M::close());

it('stores a business via the repository', function () {
    $dto = new BusinessDTO(userId: 10, name: 'Cafe Mock', description: 'Cozy place');
    $expectedPayload = [
        'owner_id' => 10,
        'name' => 'Cafe Mock',
        'description' => 'Cozy place',
    ];

    $this->repository
        ->shouldReceive('store')
        ->once()
        ->with($expectedPayload)
        ->andReturn(Business::factory()->make($expectedPayload));

    $result = $this->service->store($dto);

    expect($result->name)->toBe('Cafe Mock');
});

it('updates a business when the owner matches', function () {
    $dto = new BusinessDTO(userId: 5, name: 'Updated', description: 'Updated desc');
    $business = Business::factory()->make(['id' => 1, 'owner_id' => 5]);

    $this->repository
        ->shouldReceive('getById')
        ->with(1)
        ->andReturn($business);

    $this->repository
        ->shouldReceive('update')
        ->with(1, $dto->toArray())
        ->andReturn($business);

    $result = $this->service->update(1, $dto);

    expect($result)->toBeInstanceOf(Business::class);
});

it('returns null when updating a business not owned by the user', function () {
    $dto = new BusinessDTO(userId: 2, name: 'Other', description: null);
    $business = Business::factory()->make(['id' => 1, 'owner_id' => 9]);

    $this->repository
        ->shouldReceive('getById')
        ->with(1)
        ->andReturn($business);

    $result = $this->service->update(1, $dto);

    expect($result)->toBeNull();
});

it('deletes a business for the owner', function () {
    $business = Business::factory()->make(['id' => 3, 'owner_id' => 4]);

    $this->repository
        ->shouldReceive('getById')
        ->with(3)
        ->andReturn($business);

    $this->repository
        ->shouldReceive('delete')
        ->with(3)
        ->andReturnTrue();

    expect($this->service->delete(3, 4))->toBeTrue();
});

it('fails to delete when user is not the owner', function () {
    $business = Business::factory()->make(['id' => 3, 'owner_id' => 99]);

    $this->repository
        ->shouldReceive('getById')
        ->with(3)
        ->andReturn($business);

    expect($this->service->delete(3, 4))->toBeFalse();
});
