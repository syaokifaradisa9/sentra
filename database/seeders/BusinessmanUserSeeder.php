<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\Branch;
use App\Models\Category;
use App\Models\Product;
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
        // Get the Businessman role
        $businessmanRole = Role::firstOrCreate(
            ['name' => 'Businessman'],
            ['name' => 'Businessman', 'guard_name' => 'web']
        );

        $businessmanUser = User::firstOrCreate(
            ['email' => 'businessman@example.com'],
            [
                'name' => 'Businessman User',
                'password' => Hash::make('password'),
                'phone' => '081234567890',
                'address' => 'Jl. Usaha No. 123, Jakarta',
                'position' => 'Businessman',
            ]
        );

        $businessmanUser->assignRole($businessmanRole);

        $businessBlueprints = [
            [
                'name' => 'Nusantara Rasa Group',
                'description' => 'Jaringan restoran nusantara modern milik Businessman User.',
                'branches' => [
                    [
                        'name' => 'Nusantara HQ',
                        'address' => 'Jl. Merdeka No. 10, Jakarta Pusat',
                        'opening_time' => '08:00',
                        'closing_time' => '22:00',
                    ],
                    [
                        'name' => 'Nusantara Bandung',
                        'address' => 'Jl. Braga No. 55, Bandung',
                        'opening_time' => '09:00',
                        'closing_time' => '21:00',
                    ],
                ],
                'categories' => [
                    [
                        'name' => 'Makanan Tradisional',
                        'icon' => null,
                        'products' => [
                            ['name' => 'Ayam Bakar Madu', 'price' => 45000, 'description' => 'Ayam bakar dengan bumbu madu khas Nusantara.'],
                            ['name' => 'Sate Maranggi Spesial', 'price' => 38000, 'description' => 'Sate maranggi dengan sambal oncom.'],
                        ],
                    ],
                    [
                        'name' => 'Minuman Nusantara',
                        'icon' => null,
                        'products' => [
                            ['name' => 'Wedang Jahe Premium', 'price' => 25000, 'description' => 'Wedang jahe hangat dengan gula aren.'],
                            ['name' => 'Es Seruni', 'price' => 22000, 'description' => 'Perpaduan serai, jeruk, dan madu segar.'],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'Kopi Sejuta Rasa',
                'description' => 'Bisnis kopi spesialti dengan banyak cabang.',
                'branches' => [
                    [
                        'name' => 'Kopi Sejuta - Kemang',
                        'address' => 'Jl. Kemang Raya No. 12, Jakarta Selatan',
                        'opening_time' => '07:00',
                        'closing_time' => '23:00',
                    ],
                    [
                        'name' => 'Kopi Sejuta - Surabaya',
                        'address' => 'Jl. Darmo No. 80, Surabaya',
                        'opening_time' => '08:00',
                        'closing_time' => '22:00',
                    ],
                    [
                        'name' => 'Kopi Sejuta - Bali',
                        'address' => 'Jl. Sunset Road No. 101, Bali',
                        'opening_time' => '07:30',
                        'closing_time' => '23:30',
                    ],
                ],
                'categories' => [
                    [
                        'name' => 'Biji Kopi Premium',
                        'icon' => null,
                        'products' => [
                            ['name' => 'Kopi Gayo Gold', 'price' => 75000, 'description' => 'Biji kopi Gayo pilihan dengan profil rasa caramel.'],
                            ['name' => 'Kopi Toraja Sunrise', 'price' => 72000, 'description' => 'Blend Toraja dengan aroma floral dan coklat.'],
                        ],
                    ],
                    [
                        'name' => 'Menu Espresso Based',
                        'icon' => null,
                        'products' => [
                            ['name' => 'Es Kopi Sejuta', 'price' => 32000, 'description' => 'Es kopi susu signature dengan gula aren.'],
                            ['name' => 'Kopi Susu Pandan', 'price' => 34000, 'description' => 'Kopi susu dengan sirup pandan asli.'],
                        ],
                    ],
                ],
            ],
        ];

        foreach ($businessBlueprints as $blueprint) {
            $business = Business::firstOrCreate(
                [
                    'owner_id' => $businessmanUser->id,
                    'name' => $blueprint['name'],
                ],
                [
                    'description' => $blueprint['description'],
                ]
            );

            $branchIds = [];
            foreach ($blueprint['branches'] as $branchData) {
                $branch = Branch::firstOrCreate(
                    [
                        'business_id' => $business->id,
                        'name' => $branchData['name'],
                    ],
                    [
                        'owner_id' => $businessmanUser->id,
                        'address' => $branchData['address'],
                        'opening_time' => $branchData['opening_time'],
                        'closing_time' => $branchData['closing_time'],
                    ]
                );

                $branchIds[] = $branch->id;
            }

            foreach ($blueprint['categories'] as $categoryData) {
                $category = Category::firstOrCreate(
                    ['name' => $categoryData['name']],
                    ['icon' => $categoryData['icon']]
                );

                $category->branches()->syncWithoutDetaching($branchIds);

                foreach ($categoryData['products'] as $productData) {
                    $product = Product::firstOrCreate(
                        [
                            'name' => $productData['name'],
                            'category_id' => $category->id,
                        ],
                        [
                            'price' => $productData['price'],
                            'description' => $productData['description'],
                        ]
                    );

                    $product->branches()->syncWithoutDetaching($branchIds);
                }
            }
        }

        $branchCount = Branch::where('owner_id', $businessmanUser->id)->count();
        $productCount = Product::count();

        echo "Businessman seeder finished. User: businessman@example.com / password\n";
        echo "Total branches for user: {$branchCount}\n";
        echo "Products seeded (all categories): {$productCount}\n";
    }
}
