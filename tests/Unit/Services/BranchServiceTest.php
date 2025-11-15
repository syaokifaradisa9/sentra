<?php

use App\DataTransferObjects\BranchDTO;
use App\Models\Branch;
use App\Repositories\Branch\BranchRepository;
use App\Repositories\Business\BusinessRepository;
use App\Services\BranchService;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Mockery as M;

beforeEach(function () {
    $this->branchRepository = M::mock(BranchRepository::class);
    $this->businessRepository = M::mock(BusinessRepository::class);
    $this->service = new BranchService($this->branchRepository, $this->businessRepository);
});

afterEach(fn () => M::close());

it('stores a branch and loads the business relation', function () {
    $dto = new BranchDTO(
        businessId: 10,
        userId: 4,
        name: 'Central Branch',
        address: 'Central Street',
        openingTime: '08:00',
        closingTime: '17:00',
    );

    $branch = M::mock(Branch::class);
    $branch->shouldReceive('load')->with('business')->andReturnSelf();

    $this->branchRepository
        ->shouldReceive('store')
        ->once()
        ->with($dto->toArray())
        ->andReturn($branch);

    $result = $this->service->store($dto);

    expect($result)->toBe($branch);
});

it('updates a branch and reloads its business relation', function () {
    $dto = new BranchDTO(
        businessId: 10,
        userId: 4,
        name: 'Updated Branch',
        address: 'Central Street',
        openingTime: '08:00',
        closingTime: '17:00',
    );

    $branch = M::mock(Branch::class);
    $branch->shouldReceive('load')->with('business')->andReturnSelf();

    $this->branchRepository
        ->shouldReceive('update')
        ->once()
        ->with(5, $dto->toArray())
        ->andReturn($branch);

    $result = $this->service->update(5, $dto);

    expect($result)->toBe($branch);
});

it('deletes a branch via the repository', function () {
    $this->branchRepository
        ->shouldReceive('delete')
        ->once()
        ->with(2)
        ->andReturnTrue();

    expect($this->service->delete(2))->toBeTrue();
});

it('returns option data for the owner', function () {
    $branches = new EloquentCollection([
        (object) ['id' => 1, 'name' => 'North'],
        (object) ['id' => 2, 'name' => 'South'],
    ]);

    $this->branchRepository
        ->shouldReceive('getByOwnerId')
        ->with(7)
        ->andReturn($branches);

    expect($this->service->getOptionsDataByOwnerId(7))->toBe([
        ['id' => 1, 'name' => 'North'],
        ['id' => 2, 'name' => 'South'],
    ]);
});
