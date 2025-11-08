<?php

namespace Database\Seeders;

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

        $this->call([
            RoleSeeder::class,
        ]);

        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        $user->assignRole("Businessman");

        $this->call([
            BusinessSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            BusinessmanUserSeeder::class,
            CategoryBusinessmanSeeder::class,
            BusinessOwnerUserSeeder::class,
            SmallBusinessOwnerUserSeeder::class,
        ]);
    }
}
