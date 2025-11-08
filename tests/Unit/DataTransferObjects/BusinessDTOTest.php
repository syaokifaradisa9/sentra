<?php

use App\DataTransferObjects\BusinessDTO;
use App\Http\Requests\BusinessRequest;
use Mockery as M;

afterEach(fn () => M::close());

it('creates a DTO from the request data and user id', function () {
    $request = M::mock(BusinessRequest::class);
    $request->shouldReceive('validated')->once()->andReturn([
        'name' => 'Demo Bistro',
        'description' => 'Delicious meals',
    ]);

    $dto = BusinessDTO::fromAppRequest($request, 42);

    expect($dto->userId)->toBe(42)
        ->and($dto->name)->toBe('Demo Bistro')
        ->and($dto->description)->toBe('Delicious meals');
});

it('converts to the array expected by the repository', function () {
    $dto = new BusinessDTO(userId: 7, name: 'Coffee Hub', description: null);

    expect($dto->toArray())->toBe([
        'owner_id' => 7,
        'name' => 'Coffee Hub',
        'description' => null,
    ]);
});
