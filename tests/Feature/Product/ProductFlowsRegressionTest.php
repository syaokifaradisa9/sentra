<?php

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\InteractsWithProduct;
use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);
uses(InteractsWithProduct::class);

beforeEach(function () {
    Storage::fake('public');
});

it('performs a full product CRUD regression flow', function () {
    $user = $this->createBusinessUser();
    $branch = $this->createBranch(['owner_id' => $user->id]);
    $category = $this->createCategory(branchIds: [$branch->id]);

    $createPayload = $this->productPayload($category, $branch, [
        'name' => 'Regression Product',
    ]);

    actingAs($user)
        ->post(route('products.store'), $createPayload)
        ->assertRedirect(route('products.index'))
        ->assertSessionHas('success');

    $product = Product::where('name', 'Regression Product')->first();
    expect($product)->not->toBeNull();

    $updatePayload = [
        'name' => 'Regression Product Updated',
        'category_id' => $category->id,
        'price' => 60000,
        'description' => 'Updated desc',
        'branch_ids' => [$branch->id],
    ];

    actingAs($user)
        ->post(route('products.update', $product), $updatePayload)
        ->assertRedirect(route('products.index'))
        ->assertSessionHas('success');

    $product->refresh();
    expect($product->name)->toBe('Regression Product Updated')
        ->and($product->price)->toBe(60000.0);

    actingAs($user)
        ->delete(route('products.destroy', $product->id))
        ->assertRedirect(route('products.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('products', ['id' => $product->id]);
});

