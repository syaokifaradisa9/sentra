<?php

use App\DataTransferObjects\CategoryDTO;
use App\Http\Requests\CategoryRequest;
use Mockery as M;

afterEach(fn () => M::close());

it('creates a DTO from the request data', function () {
    $request = M::mock(CategoryRequest::class);
    $request->shouldReceive('validated')->once()->andReturn([
        'name' => 'Beverages',
        'branch_ids' => [1, 2],
        'icon' => 'fa-mug',
    ]);

    $dto = CategoryDTO::fromAppRequest($request);

    expect($dto->name)->toBe('Beverages')
        ->and($dto->branchIds)->toBe([1, 2])
        ->and($dto->icon)->toBe('fa-mug');
});

it('converts to repository payloads', function () {
    $dto = new CategoryDTO(
        name: 'Snacks',
        branchIds: [5],
        icon: 'fa-cookie'
    );

    expect($dto->toArray())->toBe([
        'name' => 'Snacks',
        'icon' => 'fa-cookie',
    ]);
});

