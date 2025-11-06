<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\Branch;
use App\Models\User;
use App\Models\UserBranch;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class BusinessmanUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the Businessman role
        $businessmanRole = Role::firstOrCreate(['name' => 'Businessman'], ['name' => 'Businessman', 'guard_name' => 'web']);

        $businessmanUser = User::create([
            'name' => 'Businessman User',
            'email' => 'businessman@example.com',
            'password' => Hash::make('password'),
            'phone' => '081234567890',
            'address' => 'Jl. Usaha No. 123, Jakarta',
            'position' => 'Businessman',
        ]);

        // Assign the Businessman role to the user
        $businessmanUser->assignRole($businessmanRole);

        // Create a business owned by this businessman
        $business = Business::create([
            'owner_id' => $businessmanUser->id,
            'name' => 'Businessman\'s Business',
            'description' => 'Business owned and managed by the businessman.',
        ]);

        // Create multiple branches for the businessman's business
        $branches = [
            [
                'name' => 'Main Branch',
                'address' => 'Jl. Merdeka No. 10, Jakarta',
                'opening_time' => '08:00',
                'closing_time' => '20:00',
            ],
            [
                'name' => 'East Jakarta Branch',
                'address' => 'Jl. Gatot Subroto No. 25, Jakarta Timur',
                'opening_time' => '08:30',
                'closing_time' => '19:30',
            ],
            [
                'name' => 'South Jakarta Branch',
                'address' => 'Jl. TB Simatupang No. 45, Jakarta Selatan',
                'opening_time' => '09:00',
                'closing_time' => '21:00',
            ]
        ];

        foreach ($branches as $branchData) {
            $branch = Branch::create([
                'business_id' => $business->id,
                'owner_id' => $businessmanUser->id,
                'name' => $branchData['name'],
                'address' => $branchData['address'],
                'opening_time' => $branchData['opening_time'],
                'closing_time' => $branchData['closing_time'],
            ]);

            // Associate the user with the branch
            UserBranch::create([
                'user_id' => $businessmanUser->id,
                'branch_id' => $branch->id,
            ]);
        }

        echo "Created Businessman user with email: businessman@example.com\n";
        echo "Password: password\n";
        echo "Created " . count($branches) . " branches for the businessman's business\n";
    }
}
