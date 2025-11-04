<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $branchIds = Branch::query()->pluck('id')->all();
        $categories = Category::query()->with('branches')->get();

        if ($categories->isEmpty() || empty($branchIds)) {
            return;
        }

        $faker = fake();

        foreach (range(1, 100) as $index) {
            $category = $categories->random();

            $product = Product::create([
                'name' => ucfirst($faker->unique()->words(rand(2, 4), true)),
                'category_id' => $category->id,
                'price' => $faker->numberBetween(5000, 150000),
                'description' => $faker->sentence(),
            ]);

            $availableBranchIds = $category->branches
                ? $category->branches->pluck('id')->all()
                : [];

            if (empty($availableBranchIds)) {
                $randomCount = min(3, count($branchIds));
                $selectedBranches = collect($branchIds)->random($randomCount);
            } else {
                $randomCount = min(count($availableBranchIds), rand(1, count($availableBranchIds)));
                $selectedBranches = collect($availableBranchIds)->random($randomCount);
            }

            $product->branches()->sync(
                $selectedBranches instanceof \Illuminate\Support\Collection
                    ? $selectedBranches->all()
                    : Arr::wrap($selectedBranches)
            );
        }

        $faker->unique(true);
    }
}
