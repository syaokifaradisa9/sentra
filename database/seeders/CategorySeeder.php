<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $branchIds = Branch::query()->pluck('id')->all();

        if (empty($branchIds)) {
            return;
        }

        $iconOptions = [
            'UtensilsCrossed',
            'Utensils',
            'ForkKnifeCrossed',
            'ForkKnife',
            'CookingPot',
            'ChefHat',
            'GlassWater',
            'CupSoda',
            'Briefcase',
            'NotebookPen',
            'ClipboardCheck',
            'StickyNote',
            'PenLine',
            'CalendarDays',
            'Presentation',
            'ChartPie',
            'Laptop',
            'Monitor',
            'Wallet',
            'Banknote',
        ];

        $faker = fake();

        // Generate 20 categories with unique names
        foreach (range(1, 20) as $index) {
            $name = $faker->unique()->sentence(2);
            $icon = Arr::random($iconOptions);

            $category = Category::create([
                'name' => $name,
                'icon' => $icon,
            ]);

            $randomCount = min(count($branchIds), rand(1, min(3, count($branchIds))));
            $randomBranches = collect($branchIds)->random($randomCount);
            $assignedBranchIds = $randomBranches instanceof \Illuminate\Support\Collection
                ? $randomBranches->all()
                : \Illuminate\Support\Arr::wrap($randomBranches);

            $category->branches()->sync($assignedBranchIds);
        }

        $faker->unique(true);
    }
}
