<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Business;
use App\Models\User;
use Illuminate\Database\Seeder;

class BusinessSeeder extends Seeder
{
    /**
     * Seed 3 businesses with a total of 8 branches (>=2 per business).
     */
    public function run(): void
    {
        $testUser = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        $testUser->assignRole('Businessman');

        $businessBlueprints = [
            [
                'name' => 'Rasa Nusantara Group',
                'description' => 'Menghadirkan sajian kuliner nusantara dengan sentuhan modern.',
                'branches' => [
                    [
                        'name' => 'Rasa Nusantara - Jakarta Pusat',
                        'address' => 'Jl. Medan Merdeka No. 8, Jakarta Pusat',
                        'opening_time' => '08:00',
                        'closing_time' => '22:00',
                    ],
                    [
                        'name' => 'Rasa Nusantara - Bandung',
                        'address' => 'Jl. Braga No. 55, Bandung',
                        'opening_time' => '09:00',
                        'closing_time' => '21:00',
                    ],
                    [
                        'name' => 'Rasa Nusantara - Surabaya',
                        'address' => 'Jl. Basuki Rahmat No. 20, Surabaya',
                        'opening_time' => '10:00',
                        'closing_time' => '22:30',
                    ],
                ],
            ],
            [
                'name' => 'Sejuk Coffee Collective',
                'description' => 'Spesialis kopi susu premium dengan suasana santai di tiap cabang.',
                'branches' => [
                    [
                        'name' => 'Sejuk Coffee - Kemang',
                        'address' => 'Jl. Kemang Raya No. 17, Jakarta Selatan',
                        'opening_time' => '07:00',
                        'closing_time' => '23:00',
                    ],
                    [
                        'name' => 'Sejuk Coffee - Yogyakarta',
                        'address' => 'Jl. Malioboro No. 101, Yogyakarta',
                        'opening_time' => '08:00',
                        'closing_time' => '22:00',
                    ],
                    [
                        'name' => 'Sejuk Coffee - Makassar',
                        'address' => 'Jl. Penghibur No. 9, Makassar',
                        'opening_time' => '07:30',
                        'closing_time' => '23:30',
                    ],
                ],
            ],
            [
                'name' => 'Dapur Urban Kitchen',
                'description' => 'Konsep dapur modern yang menyediakan menu rumahan praktis.',
                'branches' => [
                    [
                        'name' => 'Dapur Urban - Bintaro',
                        'address' => 'Jl. Bintaro Utama 3A No. 5, Tangerang Selatan',
                        'opening_time' => '09:00',
                        'closing_time' => '21:30',
                    ],
                    [
                        'name' => 'Dapur Urban - Bekasi',
                        'address' => 'Jl. Ahmad Yani No. 45, Bekasi',
                        'opening_time' => '10:00',
                        'closing_time' => '22:00',
                    ],
                ],
            ],
        ];

        foreach ($businessBlueprints as $blueprint) {
            $business = Business::firstOrCreate(
                [
                    'owner_id' => $testUser->id,
                    'name' => $blueprint['name'],
                ],
                [
                    'description' => $blueprint['description'],
                ]
            );

            foreach ($blueprint['branches'] as $branchData) {
                Branch::firstOrCreate(
                    [
                        'business_id' => $business->id,
                        'name' => $branchData['name'],
                    ],
                    [
                        'owner_id' => $testUser->id,
                        'address' => $branchData['address'],
                        'opening_time' => $branchData['opening_time'],
                        'closing_time' => $branchData['closing_time'],
                    ]
                );
            }
        }
    }
}
