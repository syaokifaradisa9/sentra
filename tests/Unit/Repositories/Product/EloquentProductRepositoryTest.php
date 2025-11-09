<?php

use App\Models\Product;
use App\Repositories\Product\ProductRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithProduct;

uses(RefreshDatabase::class);
uses(InteractsWithProduct::class);

it('stores a product record', function () {
    $repository = app(ProductRepository::class);
    $category = $this->createCategory();

    $product = $repository->store([
        'name' => 'Repository Product',
        'category_id' => $category->id,
        'price' => 10000,
        'description' => 'From repository test',
        'photo' => null,
    ]);

    expect($product)->toBeInstanceOf(Product::class)
        ->and($product->exists)->toBeTrue();
});

it('updates a product record', function () {
    $repository = app(ProductRepository::class);
    $category = $this->createCategory();
    $product = Product::factory()->create([
        'category_id' => $category->id,
        'name' => 'Before',
    ]);

    $updated = $repository->update($product->id, [
        'name' => 'After',
        'category_id' => $category->id,
        'price' => 20000,
        'description' => 'Updated',
    ]);

    expect($updated->name)->toBe('After')
        ->and($updated->description)->toBe('Updated');
});

it('deletes a product record', function () {
    $repository = app(ProductRepository::class);
    $product = $this->createProduct();

    $result = $repository->delete($product->id);

    expect($result)->toBeTrue();
    $this->assertDatabaseMissing('products', ['id' => $product->id]);
});

it('retrieves products by branch, business, and category', function () {
    $repository = app(ProductRepository::class);
    $branch = $this->createBranch();
    $category = $this->createCategory(branchIds: [$branch->id]);

    $this->createProduct(['category_id' => $category->id], [$branch->id]);
    $this->createProduct(['category_id' => $category->id], [$branch->id]);

    expect($repository->getByBranchId($branch->id))->toHaveCount(2);
    expect($repository->getByBusinessId($branch->business_id))->toHaveCount(2);
    expect($repository->getByCategoryId($category->id))->toHaveCount(2);
});

it('filters products for a user', function () {
    $repository = app(ProductRepository::class);
    $user = $this->createBusinessUser();
    $branch = $this->createBranch(['owner_id' => $user->id]);
    $category = $this->createCategory(branchIds: [$branch->id]);

    $product = $this->createProduct(['category_id' => $category->id, 'name' => 'Special Coffee'], [$branch->id]);
    $this->createProduct(); // other user

    $collection = $repository->getForUser($user->id, ['search' => 'Special']);

    expect($collection)->toHaveCount(1)
        ->and($collection->first()->id)->toBe($product->id);
});

