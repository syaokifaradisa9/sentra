<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class SmallBusinessOwnerUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the SmallBusinessOwner role
        $smallBusinessOwnerRole = Role::firstOrCreate(['name' => 'SmallBusinessOwner'], ['name' => 'SmallBusinessOwner', 'guard_name' => 'web']);

        // Create a new user with the SmallBusinessOwner role
        $smallBusinessOwnerUser = User::create([
            'name' => 'Small Business Owner User',
            'email' => 'smallbusinessowner@example.com',
            'password' => Hash::make('password'),
            'phone' => '081234567892',
            'address' => 'Jl. Usaha Kecil No. 789, Jakarta',
            'position' => 'Small Business Owner',
        ]);

        // Assign the SmallBusinessOwner role to the user
        $smallBusinessOwnerUser->assignRole($smallBusinessOwnerRole);

        // Create a business owned by this small business owner
        $business = Business::create([
            'owner_id' => $smallBusinessOwnerUser->id,
            'name' => 'Small Business Owner\'s Business',
            'description' => 'Small business owned and managed by the small business owner.',
        ]);

        echo "Created SmallBusinessOwner user with email: smallbusinessowner@example.com\n";
        echo "Password: password\n";
    }
}