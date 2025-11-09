<?php

use App\DataTransferObjects\ProductDTO;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\InteractsWithProduct;

uses(RefreshDatabase::class);
uses(InteractsWithProduct::class);

beforeEach(function () {
    Storage::fake('public');
    $this->service = app(ProductService::class);
});

it('stores a product through the real stack', function () {
    $user = $this->createBusinessUser();
    $branch = $this->createBranch(['owner_id' => $user->id]);
    $category = $this->createCategory(branchIds: [$branch->id]);

    $dto = new ProductDTO(
        name: 'Integration Product',
        categoryId: $category->id,
        price: 15000,
        description: 'Integration description',
        branchIds: [$branch->id],
        photo: UploadedFile::fake()->image('integration.jpg')
    );

    $product = $this->service->store($dto, $user->id);

    expect($product)->toBeInstanceOf(Product::class)
        ->and($product->branches)->toHaveCount(1);
});

it('updates and deletes a product end-to-end', function () {
    $user = $this->createBusinessUser();
    $branch = $this->createBranch(['owner_id' => $user->id]);
    $category = $this->createCategory(branchIds: [$branch->id]);
    $product = $this->createProduct(['category_id' => $category->id], [$branch->id]);

    $dto = new ProductDTO(
        name: 'Updated Integration Product',
        categoryId: $category->id,
        price: 25000,
        description: 'Updated description',
        branchIds: [$branch->id],
        photo: null
    );

    $updated = $this->service->update($product->id, $dto, $user->id);

    expect($updated->name)->toBe('Updated Integration Product');

    $deleteResult = $this->service->delete($product->id, $user->id);

    expect($deleteResult)->toBeTrue();
    $this->assertDatabaseMissing('products', ['id' => $product->id]);
});

