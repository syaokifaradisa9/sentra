<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoryBusinessmanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the businessman user
        $businessmanUser = User::where('email', 'businessman@example.com')->first();
        
        if (!$businessmanUser) {
            $this->command->error('Businessman user not found. Please run BusinessmanUserSeeder first.');
            return;
        }

        // Get all branches owned by the businessman
        $branches = Branch::where('owner_id', $businessmanUser->id)->get();
        
        if ($branches->count() === 0) {
            $this->command->error('No branches found for businessman user. Please run BusinessmanUserSeeder first.');
            return;
        }

        // Create categories for the businessman
        $categories = [
            [
                'name' => 'Electronics',
                'branch_ids' => $branches->pluck('id')->toArray(),
            ],
            [
                'name' => 'Clothing',
                'branch_ids' => $branches->pluck('id')->toArray(),
            ],
            [
                'name' => 'Food & Beverages',
                'branch_ids' => $branches->pluck('id')->toArray(),
            ],
            [
                'name' => 'Home & Living',
                'branch_ids' => [$branches->first()->id], // Only assign to first branch
            ],
            [
                'name' => 'Sports & Outdoors',
                'branch_ids' => [$branches->skip(1)->first()->id ?? $branches->first()->id], // Assign to second branch if exists, else first
            ],
        ];

        foreach ($categories as $categoryData) {
            $category = Category::create([
                'name' => $categoryData['name'],
            ]);

            // Create category-branch associations
            foreach ($categoryData['branch_ids'] as $branchId) {
                DB::table('category_branches')->insert([
                    'category_id' => $category->id,
                    'branch_id' => $branchId,
                ]);
            }
        }

        $this->command->info('Businessman categories created successfully.');
    }
}