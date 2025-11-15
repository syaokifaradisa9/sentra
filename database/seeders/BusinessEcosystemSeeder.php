<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Business;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class BusinessEcosystemSeeder extends Seeder
{
    public function run(): void
    {
        $businessman = User::firstOrCreate(
            ['email' => 'businessman@example.com'],
            [
                'name' => 'Businessman Demo',
                'password' => Hash::make('password'),
                'phone' => '081200000001',
                'address' => 'Jl. Usaha No. 1, Jakarta',
                'position' => 'Businessman',
            ]
        );

        $businessman->assignRole('Businessman');

        Role::firstOrCreate(['name' => 'Manager'], ['guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'Cashier'], ['guard_name' => 'web']);

        $businessBlueprints = [
            [
                'name' => 'Selera Nusantara Group',
                'description' => 'Jaringan rumah makan dengan menu nusantara modern.',
                'branches' => [
                    [
                        'name' => 'Selera Nusantara - Jakarta',
                        'address' => 'Jl. Sabang No. 18, Jakarta Pusat',
                        'opening_time' => '08:00',
                        'closing_time' => '22:00',
                    ],
                    [
                        'name' => 'Selera Nusantara - Bandung',
                        'address' => 'Jl. Braga No. 88, Bandung',
                        'opening_time' => '09:00',
                        'closing_time' => '21:30',
                    ],
                    [
                        'name' => 'Selera Nusantara - Surabaya',
                        'address' => 'Jl. Darmo No. 15, Surabaya',
                        'opening_time' => '09:00',
                        'closing_time' => '22:30',
                    ],
                ],
                'categories' => [
                    [
                        'name' => 'SN - Menu Andalan',
                        'icon' => 'ChefHat',
                        'products' => [
                            [
                                'name' => 'Nasi Rendang Premium',
                                'price' => 48000,
                                'description' => 'Rendang sapi dengan santan kental dan rempah segar.',
                                'branches' => 'all',
                            ],
                            [
                                'name' => 'Ayam Bakar Madu Wijen',
                                'price' => 43000,
                                'description' => 'Ayam panggang dengan glaze madu dan wijen sangrai.',
                                'branches' => [
                                    'Selera Nusantara - Jakarta',
                                    'Selera Nusantara - Bandung',
                                ],
                            ],
                            [
                                'name' => 'Gurame Sambal Kecombrang',
                                'price' => 68000,
                                'description' => 'Menu khas cabang Surabaya dengan sambal kecombrang.',
                                'branches' => ['Selera Nusantara - Surabaya'],
                            ],
                        ],
                    ],
                    [
                        'name' => 'SN - Menu Sarapan',
                        'icon' => 'UtensilsCrossed',
                        'products' => [
                            [
                                'name' => 'Lontong Sayur Padang',
                                'price' => 32000,
                                'description' => 'Lontong sayur santan dengan kerupuk merah.',
                                'branches' => 'all',
                            ],
                            [
                                'name' => 'Soto Betawi Signature',
                                'price' => 36000,
                                'description' => 'Soto Betawi creamy hanya tersedia di Jakarta.',
                                'branches' => ['Selera Nusantara - Jakarta'],
                            ],
                            [
                                'name' => 'Nasi Tutug Oncom',
                                'price' => 30000,
                                'description' => 'Sarapan khas Bandung dengan sambal hijau.',
                                'branches' => ['Selera Nusantara - Bandung'],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'Sejuk Brew Society',
                'description' => 'Spesialis minuman dingin kopi, matcha, dan coklat.',
                'branches' => [
                    [
                        'name' => 'Sejuk Brew - Kemang',
                        'address' => 'Jl. Kemang Raya No. 21, Jakarta Selatan',
                        'opening_time' => '07:00',
                        'closing_time' => '23:00',
                    ],
                    [
                        'name' => 'Sejuk Brew - Yogyakarta',
                        'address' => 'Jl. Tirtodipuran No. 3, Yogyakarta',
                        'opening_time' => '08:00',
                        'closing_time' => '22:00',
                    ],
                    [
                        'name' => 'Sejuk Brew - Makassar',
                        'address' => 'Jl. Penghibur No. 2, Makassar',
                        'opening_time' => '07:30',
                        'closing_time' => '23:30',
                    ],
                ],
                'categories' => [
                    [
                        'name' => 'SB - Signature Coffee',
                        'icon' => 'CupSoda',
                        'products' => [
                            [
                                'name' => 'Es Kopi Sejuk Aren',
                                'price' => 32000,
                                'description' => 'Kopi susu dingin dengan gula aren organik.',
                                'branches' => 'all',
                            ],
                            [
                                'name' => 'Cold Brew Citrus',
                                'price' => 36000,
                                'description' => 'Cold brew dengan jeruk kalamansi, hanya di Kemang dan Makassar.',
                                'branches' => [
                                    'Sejuk Brew - Kemang',
                                    'Sejuk Brew - Makassar',
                                ],
                            ],
                            [
                                'name' => 'Tiramisu Affogato',
                                'price' => 45000,
                                'description' => 'Menu dessert coffee spesial cabang Yogyakarta.',
                                'branches' => ['Sejuk Brew - Yogyakarta'],
                            ],
                        ],
                    ],
                    [
                        'name' => 'SB - Matcha & Chocolate',
                        'icon' => 'GlassWater',
                        'products' => [
                            [
                                'name' => 'Iced Matcha Latte',
                                'price' => 34000,
                                'description' => 'Matcha Uji dengan oat milk.',
                                'branches' => 'all',
                            ],
                            [
                                'name' => 'Sea Salt Chocolate',
                                'price' => 33000,
                                'description' => 'Coklat belgian dengan garam laut, hits di Kemang.',
                                'branches' => [
                                    'Sejuk Brew - Kemang',
                                ],
                            ],
                            [
                                'name' => 'Avocado Coffee Float',
                                'price' => 39000,
                                'description' => 'Perpaduan alpukat dingin dan espresso, favorit Makassar.',
                                'branches' => ['Sejuk Brew - Makassar'],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'Gelato Bahagia',
                'description' => 'Gerai gelato dan es krim artisan dengan resep Italia.',
                'branches' => [
                    [
                        'name' => 'Gelato Bahagia - Senopati',
                        'address' => 'Jl. Senopati No. 45, Jakarta',
                        'opening_time' => '10:00',
                        'closing_time' => '23:00',
                    ],
                    [
                        'name' => 'Gelato Bahagia - Bali',
                        'address' => 'Jl. Oberoi No. 7, Bali',
                        'opening_time' => '10:00',
                        'closing_time' => '23:30',
                    ],
                    [
                        'name' => 'Gelato Bahagia - Medan',
                        'address' => 'Jl. Zainul Arifin No. 12, Medan',
                        'opening_time' => '11:00',
                        'closing_time' => '22:30',
                    ],
                ],
                'categories' => [
                    [
                        'name' => 'GB - Gelato Premium',
                        'icon' => 'GlassWater',
                        'products' => [
                            [
                                'name' => 'Pistachio Sicilia',
                                'price' => 42000,
                                'description' => 'Gelato pistachio import dari Sicilia.',
                                'branches' => 'all',
                            ],
                            [
                                'name' => 'Brownie Fudge Gelato',
                                'price' => 40000,
                                'description' => 'Gelato coklat dengan potongan brownie, khusus Senopati & Medan.',
                                'branches' => [
                                    'Gelato Bahagia - Senopati',
                                    'Gelato Bahagia - Medan',
                                ],
                            ],
                            [
                                'name' => 'Gelato Mangga Bali',
                                'price' => 38000,
                                'description' => 'Rasa mangga harum manis khas cabang Bali.',
                                'branches' => ['Gelato Bahagia - Bali'],
                            ],
                        ],
                    ],
                    [
                        'name' => 'GB - Dessert Dingin',
                        'icon' => 'CupSoda',
                        'products' => [
                            [
                                'name' => 'Affogato Italiano',
                                'price' => 45000,
                                'description' => 'Gelato vanila dengan espresso panas.',
                                'branches' => 'all',
                            ],
                            [
                                'name' => 'Gelato Sandwich S’mores',
                                'price' => 39000,
                                'description' => 'Sandwich marshmallow panggang tersedia di Senopati.',
                                'branches' => ['Gelato Bahagia - Senopati'],
                            ],
                            [
                                'name' => 'Es Krim Klepon',
                                'price' => 36000,
                                'description' => 'Perpaduan klepon dan kelapa untuk cabang Medan.',
                                'branches' => ['Gelato Bahagia - Medan'],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        foreach ($businessBlueprints as $blueprint) {
            $business = Business::updateOrCreate(
                [
                    'owner_id' => $businessman->id,
                    'name' => $blueprint['name'],
                ],
                [
                    'description' => $blueprint['description'],
                ]
            );

            $branchMap = [];
            foreach ($blueprint['branches'] as $branchData) {
                $branch = Branch::updateOrCreate(
                    [
                        'business_id' => $business->id,
                        'name' => $branchData['name'],
                    ],
                    [
                        'owner_id' => $businessman->id,
                        'address' => $branchData['address'],
                        'opening_time' => $branchData['opening_time'],
                        'closing_time' => $branchData['closing_time'],
                    ]
                );

                $branchMap[$branchData['name']] = $branch;

                $this->seedBranchStaff($branch, 'Manager');
                $this->seedBranchStaff($branch, 'Cashier');
            }

            $branchIds = collect($branchMap)->map->id->values()->all();

            foreach ($blueprint['categories'] as $categoryData) {
                $category = Category::updateOrCreate(
                    ['name' => $categoryData['name']],
                    ['icon' => $categoryData['icon']]
                );

                $category->branches()->syncWithoutDetaching($branchIds);

                foreach ($categoryData['products'] as $productData) {
                    $product = Product::updateOrCreate(
                        [
                            'name' => $productData['name'],
                            'category_id' => $category->id,
                        ],
                        [
                            'price' => $productData['price'],
                            'description' => $productData['description'],
                        ]
                    );

                    $productBranchIds = $this->resolveBranchTargets($branchMap, $productData['branches'] ?? 'all');
                    $product->branches()->syncWithoutDetaching($productBranchIds);
                }
            }
        }
    }

    /**
     * @param  array<string, \App\Models\Branch>  $branchMap
     */
    private function resolveBranchTargets(array $branchMap, $requested): array
    {
        if ($requested === 'all' || $requested === null) {
            return collect($branchMap)->map->id->values()->all();
        }

        $names = is_array($requested) ? $requested : [$requested];

        return collect($names)
            ->map(fn ($name) => $branchMap[$name]->id ?? null)
            ->filter()
            ->values()
            ->all();
    }

    private function seedBranchStaff(Branch $branch, string $roleName): void
    {
        $email = Str::slug($branch->name . '-' . strtolower($roleName)) . '@example.com';

        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => "{$roleName} {$branch->name}",
                'password' => Hash::make('password'),
                'phone' => '08' . rand(1000000000, 9999999999),
                'address' => $branch->address,
                'position' => $roleName,
            ]
        );

        $user->assignRole($roleName);
        $branch->users()->syncWithoutDetaching([$user->id]);
    }
}
