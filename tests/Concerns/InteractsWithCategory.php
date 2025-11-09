<?php

namespace Tests\Concerns;

use App\Models\Branch;
use App\Models\Category;

trait InteractsWithCategory
{
    use InteractsWithBranch;

    protected function createCategory(array $attributes = [], ?array $branchIds = null): Category
    {
        $category = Category::factory()->create($attributes);

        $branchIds ??= [$this->createBranch()->id];

        $category->branches()->sync($branchIds);

        return $category->load('branches');
    }

    protected function categoryPayload(?Branch $branch = null, array $overrides = []): array
    {
        $branch ??= $this->createBranch();

        $payload = [
            'name' => fake()->unique()->words(2, true),
            'icon' => 'fa-' . fake()->word(),
            'branch_ids' => [$branch->id],
        ];

        return array_merge($payload, $overrides);
    }
}

