<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class BusinessOwnerUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the BusinessOwner role
        $businessOwnerRole = Role::firstOrCreate(['name' => 'BusinessOwner'], ['name' => 'BusinessOwner', 'guard_name' => 'web']);

        // Create a new user with the BusinessOwner role
        $businessOwnerUser = User::create([
            'name' => 'Business Owner User',
            'email' => 'businessowner@example.com',
            'password' => Hash::make('password'),
            'phone' => '081234567891',
            'address' => 'Jl. Usaha Besar No. 456, Jakarta',
            'position' => 'Business Owner',
        ]);

        // Assign the BusinessOwner role to the user
        $businessOwnerUser->assignRole($businessOwnerRole);

        // Create a business owned by this business owner
        $business = Business::create([
            'owner_id' => $businessOwnerUser->id,
            'name' => 'Business Owner\'s Business',
            'description' => 'Large business owned and managed by the business owner.',
        ]);

        echo "Created BusinessOwner user with email: businessowner@example.com\n";
        echo "Password: password\n";
    }
}