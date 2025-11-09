<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\InteractsWithProduct;
use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);
uses(InteractsWithProduct::class);

beforeEach(function () {
    Storage::fake('public');
});

it('allows a Businessman to create a product', function () {
    $user = $this->createBusinessUser();
    $branch = $this->createBranch(['owner_id' => $user->id]);
    $category = $this->createCategory(branchIds: [$branch->id]);
    $payload = $this->productPayload($category, $branch);

    actingAs($user)
        ->post(route('products.store'), $payload)
        ->assertRedirect(route('products.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('products', [
        'name' => $payload['name'],
        'category_id' => $category->id,
    ]);
});

it('validates mandatory fields when creating a product', function () {
    $user = $this->createBusinessUser();

    actingAs($user)
        ->post(route('products.store'), [])
        ->assertSessionHasErrors(['name', 'category_id', 'price', 'branch_ids', 'photo']);
});

it('updates an existing product', function () {
    $user = $this->createBusinessUser();
    $branch = $this->createBranch(['owner_id' => $user->id]);
    $category = $this->createCategory(branchIds: [$branch->id]);
    $product = $this->createProduct(['category_id' => $category->id, 'name' => 'Old Product'], [$branch->id]);

    $payload = [
        'name' => 'Updated Product',
        'category_id' => $category->id,
        'price' => 45000,
        'description' => 'Updated description',
        'branch_ids' => [$branch->id],
    ];

    actingAs($user)
        ->post(route('products.update', $product), $payload)
        ->assertRedirect(route('products.index'))
        ->assertSessionHas('success');

    $product->refresh();

    expect($product->name)->toBe('Updated Product')
        ->and($product->price)->toBe(45000.0);
});

it('deletes a product', function () {
    $user = $this->createBusinessUser();
    $branch = $this->createBranch(['owner_id' => $user->id]);
    $category = $this->createCategory(branchIds: [$branch->id]);
    $product = $this->createProduct(['category_id' => $category->id], [$branch->id]);

    actingAs($user)
        ->delete(route('products.destroy', $product->id))
        ->assertRedirect(route('products.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('products', ['id' => $product->id]);
});

