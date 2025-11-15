<?php

namespace Database\Seeders;

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
            BusinessEcosystemSeeder::class,
            BusinessOwnerUserSeeder::class,
            SmallBusinessOwnerUserSeeder::class,
        ]);
    }
}
