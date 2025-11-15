<?php

use App\DataTransferObjects\BranchDTO;
use App\Http\Requests\BranchRequest;
use Mockery as M;

afterEach(fn () => M::close());

it('creates a DTO from the request data and authenticated user', function () {
    $request = M::mock(BranchRequest::class);
    $request->shouldReceive('validated')->once()->andReturn([
        'business_id' => 11,
        'name' => 'Downtown Branch',
        'address' => '123 Main St',
        'opening_time' => '08:00',
        'closing_time' => '17:00',
    ]);
    $request->shouldReceive('user')->once()->andReturn((object) ['id' => 5]);

    $dto = BranchDTO::fromAppRequest($request);

    expect($dto->businessId)->toBe(11)
        ->and($dto->userId)->toBe(5)
        ->and($dto->name)->toBe('Downtown Branch');
});

it('converts to repository-ready payloads', function () {
    $dto = new BranchDTO(
        businessId: 3,
        userId: 9,
        name: 'Airport Branch',
        address: 'Airport Road',
        openingTime: '09:00',
        closingTime: '18:00'
    );

    expect($dto->toArray())->toBe([
        'business_id' => 3,
        'owner_id' => 9,
        'name' => 'Airport Branch',
        'address' => 'Airport Road',
        'opening_time' => '09:00',
        'closing_time' => '18:00',
    ]);
});

