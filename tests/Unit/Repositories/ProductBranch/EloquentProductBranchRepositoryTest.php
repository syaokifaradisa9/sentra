<?php

use App\Models\ProductBranch;
use App\Repositories\ProductBranch\ProductBranchRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithProduct;

uses(RefreshDatabase::class);
uses(InteractsWithProduct::class);

it('batch inserts product branch relations', function () {
    $repository = app(ProductBranchRepository::class);
    $product = $this->createProduct();
    $branch = $product->branches->first();
    $product->branches()->detach();

    $repository->batchInsert([
        [
            'product_id' => $product->id,
            'branch_id' => $branch->id,
            'created_at' => now(),
            'updated_at' => now(),
        ],
    ]);

    $this->assertDatabaseHas('product_branches', [
        'product_id' => $product->id,
        'branch_id' => $branch->id,
    ]);
});

it('deletes relations by product id', function () {
    $repository = app(ProductBranchRepository::class);
    $product = $this->createProduct();
    $branch = $product->branches->first();
    $product->branches()->detach();

    ProductBranch::create([
        'product_id' => $product->id,
        'branch_id' => $branch->id,
    ]);

    $result = $repository->deleteByProductId($product->id);

    expect($result)->toBeTrue();
    $this->assertDatabaseMissing('product_branches', [
        'product_id' => $product->id,
    ]);
});

it('retrieves relations by product id', function () {
    $repository = app(ProductBranchRepository::class);
    $product = $this->createProduct();
    $branchA = $product->branches->first();
    $branchB = $this->createBranch();
    $product->branches()->detach();

    ProductBranch::insert([
        ['product_id' => $product->id, 'branch_id' => $branchA->id],
        ['product_id' => $product->id, 'branch_id' => $branchB->id],
    ]);

    $relations = $repository->getByProductId($product->id);

    expect($relations)->toHaveCount(2);
});
