<?php

use App\DataTransferObjects\ProductDTO;
use App\Http\Requests\ProductRequest;
use Illuminate\Http\UploadedFile;
use Mockery as M;

afterEach(fn () => M::close());

it('creates a DTO from the request data', function () {
    $request = M::mock(ProductRequest::class);
    $request->shouldReceive('validated')->once()->andReturn([
        'name' => 'Espresso',
        'category_id' => 3,
        'price' => 25_000,
        'description' => 'Strong coffee',
        'branch_ids' => [1, 2],
    ]);

    $file = UploadedFile::fake()->image('photo.jpg');
    $request->shouldReceive('file')->with('photo')->andReturn($file);

    $dto = ProductDTO::fromAppRequest($request);

    expect($dto->name)->toBe('Espresso')
        ->and($dto->categoryId)->toBe(3)
        ->and($dto->price)->toBe(25000.0)
        ->and($dto->branchIds)->toBe([1, 2])
        ->and($dto->photo)->toBe($file);
});

it('converts to repository payloads', function () {
    $dto = new ProductDTO(
        name: 'Latte',
        categoryId: 5,
        price: 45_000,
        description: 'Milky coffee',
        branchIds: [9],
        photo: null
    );

    expect($dto->toArray('products/latte.jpg'))->toBe([
        'name' => 'Latte',
        'category_id' => 5,
        'price' => 45000.0,
        'description' => 'Milky coffee',
        'photo' => 'products/latte.jpg',
    ]);
});

