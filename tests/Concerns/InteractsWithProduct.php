<?php

namespace Tests\Concerns;

use App\Models\Branch;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

trait InteractsWithProduct
{
    use InteractsWithCategory;

    protected function createProduct(array $attributes = [], ?array $branchIds = null): Product
    {
        $categoryAttribute = $attributes['category_id'] ?? null;

        if ($categoryAttribute instanceof Category) {
            $category = $categoryAttribute;
            unset($attributes['category_id']);
        } elseif ($categoryAttribute) {
            $category = Category::find($categoryAttribute) ?? $this->createCategory();
            $attributes['category_id'] = $category->id;
        } else {
            $category = $this->createCategory();
        }

        $branchIds ??= $category->branches->pluck('id')->all() ?: [$this->createBranch()->id];

        $defaults = [
            'category_id' => $category->id,
            'name' => fake()->words(3, true),
            'price' => fake()->randomFloat(2, 10, 100),
            'description' => fake()->sentence(),
            'photo' => null,
        ];

        $product = Product::factory()->create(array_merge($defaults, $attributes));
        $product->branches()->sync($branchIds);

        return $product->load('category.branches', 'branches');
    }

    protected function productPayload(?Category $category = null, ?Branch $branch = null, array $overrides = []): array
    {
        Storage::fake('public');

        $branch ??= $this->createBranch();
        $category ??= $this->createCategory(branchIds: [$branch->id]);

        $payload = [
            'name' => fake()->words(3, true),
            'category_id' => $category->id,
            'price' => fake()->randomFloat(2, 10, 100),
            'description' => fake()->sentence(),
            'branch_ids' => [$branch->id],
            'photo' => UploadedFile::fake()->image('product.jpg'),
        ];

        return array_merge($payload, $overrides);
    }
}

