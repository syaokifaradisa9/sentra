<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\User;
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
        $businessmanUser = User::create([
            'name' => 'Businessman User',
            'email' => 'businessman@example.com',
            'password' => Hash::make('password'),
            'phone' => '081234567890',
            'address' => 'Jl. Usaha No. 123, Jakarta',
            'position' => 'Businessman',
        ]);

        // Assign the Businessman role to the user
        $businessmanUser->assignRole("Businessman");

        // Create a business owned by this businessman
        $business = Business::create([
            'owner_id' => $businessmanUser->id,
            'name' => 'Businessman\'s Business',
            'description' => 'Business owned and managed by the businessman.',
        ]);

        echo "Created Businessman user with email: businessman@example.com\n";
        echo "Password: password\n";
    }
}
