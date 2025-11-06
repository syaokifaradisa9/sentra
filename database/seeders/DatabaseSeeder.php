<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\Branch;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        $business = Business::firstOrCreate(
            [
                'owner_id' => $user->id,
                'name' => 'Sentra Kuliner',
            ],
            [
                'description' => 'Usaha kuliner demo untuk kebutuhan pengujian.',
            ]
        );

        Branch::firstOrCreate(
            [
                'business_id' => $business->id,
                'owner_id' => $user->id,
                'name' => 'Cabang Utama',
            ],
            [
                'address' => 'Jl. Contoh No. 123, Jakarta',
                'opening_time' => '08:00',
                'closing_time' => '22:00',
            ]
        );

        $this->call([
            RoleSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            BusinessmanUserSeeder::class,
            BusinessOwnerUserSeeder::class,
            SmallBusinessOwnerUserSeeder::class,
        ]);
    }
}
