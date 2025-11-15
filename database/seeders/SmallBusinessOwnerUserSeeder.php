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

class SmallBusinessOwnerUserSeeder extends Seeder
{
    public function run(): void
    {
        $role = Role::firstOrCreate(
            ['name' => 'SmallBusinessOwner'],
            ['name' => 'SmallBusinessOwner', 'guard_name' => 'web']
        );

        $owner = User::firstOrCreate(
            ['email' => 'smallbusinessowner@example.com'],
            [
                'name' => 'Small Business Owner Demo',
                'password' => Hash::make('password'),
                'phone' => '081234567892',
                'address' => 'Jl. Usaha Kecil No. 789, Jakarta',
                'position' => 'Small Business Owner',
            ]
        );

        $owner->assignRole($role);

        $business = Business::updateOrCreate(
            [
                'owner_id' => $owner->id,
                'name' => 'Warung Hidangan Sehari-hari',
            ],
            [
                'description' => 'Warung modern yang fokus pada menu harian, snack, dan minuman ringan.',
            ]
        );

        $branchMap = [];
        $branches = [
            [
                'name' => 'Warung Harian - Cikini',
                'address' => 'Jl. Cikini Raya No. 5, Jakarta Pusat',
                'opening_time' => '06:00',
                'closing_time' => '20:00',
            ],
            [
                'name' => 'Warung Harian - Ciputat',
                'address' => 'Jl. RE Martadinata No. 40, Ciputat',
                'opening_time' => '06:30',
                'closing_time' => '21:00',
            ],
            [
                'name' => 'Warung Harian - Bogor',
                'address' => 'Jl. Pajajaran No. 22, Bogor',
                'opening_time' => '07:00',
                'closing_time' => '21:30',
            ],
        ];

        foreach ($branches as $branchData) {
            $branch = Branch::updateOrCreate(
                [
                    'business_id' => $business->id,
                    'name' => $branchData['name'],
                ],
                [
                    'owner_id' => $owner->id,
                    'address' => $branchData['address'],
                    'opening_time' => $branchData['opening_time'],
                    'closing_time' => $branchData['closing_time'],
                ]
            );

            $branchMap[$branchData['name']] = $branch;

            $this->seedBranchStaff($branch, 'Manager');
            $this->seedBranchStaff($branch, 'Cashier');
        }

        $categories = [
            [
                'name' => 'WH - Menu Harian',
                'icon' => 'Utensils',
                'branches' => 'all',
                'products' => [
                    [
                        'name' => 'Nasi Ayam Serundeng',
                        'price' => 25000,
                        'description' => 'Paket nasi ayam goreng dengan sambal bawang.',
                        'branches' => 'all',
                    ],
                    [
                        'name' => 'Paket Sayur Asem',
                        'price' => 23000,
                        'description' => 'Sayur asem, pepes ikan, dan tempe bacem.',
                        'branches' => [
                            'Warung Harian - Cikini',
                            'Warung Harian - Bogor',
                        ],
                    ],
                ],
            ],
            [
                'name' => 'WH - Snack & Minuman',
                'icon' => 'CupSoda',
                'branches' => 'all',
                'products' => [
                    [
                        'name' => 'Es Kopi Susu Tetangga',
                        'price' => 18000,
                        'description' => 'Kopi susu gula aren versi warung.',
                        'branches' => 'all',
                    ],
                    [
                        'name' => 'Roti Bakar Pandan',
                        'price' => 15000,
                        'description' => 'Roti bakar homemade isi pandan dan keju.',
                        'branches' => [
                            'Warung Harian - Ciputat',
                            'Warung Harian - Bogor',
                        ],
                    ],
                    [
                        'name' => 'Klepon Lumer',
                        'price' => 12000,
                        'description' => 'Jajanan pasar favorit yang hanya ada di Cikini.',
                        'branches' => ['Warung Harian - Cikini'],
                    ],
                ],
            ],
            [
                'name' => 'WH - Catering Mini',
                'icon' => 'Briefcase',
                'branches' => [
                    'Warung Harian - Ciputat',
                    'Warung Harian - Bogor',
                ],
                'products' => [
                    [
                        'name' => 'Catering Kantoran Hemat',
                        'price' => 26000,
                        'description' => 'Menu harian khusus kantor dan kos-kosan.',
                        'branches' => 'all',
                    ],
                    [
                        'name' => 'Snack Meeting Mini',
                        'price' => 20000,
                        'description' => 'Snack box untuk rapat kecil.',
                        'branches' => [
                            'Warung Harian - Ciputat',
                        ],
                    ],
                ],
            ],
        ];

        foreach ($categories as $categoryData) {
            $category = Category::updateOrCreate(
                ['name' => $categoryData['name']],
                ['icon' => $categoryData['icon']]
            );

            $categoryBranchIds = $this->resolveBranchTargets($branchMap, $categoryData['branches'] ?? 'all');
            $category->branches()->syncWithoutDetaching($categoryBranchIds);

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

                $productBranchIds = $this->resolveBranchTargets($branchMap, $productData['branches'] ?? $categoryData['branches'] ?? 'all');
                $product->branches()->syncWithoutDetaching($productBranchIds);
            }
        }
    }

    /**
     * @param  array<string, Branch>  $branchMap
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
        $role = Role::firstOrCreate(['name' => $roleName], ['guard_name' => 'web']);

        $email = Str::slug("sbo {$branch->name} {$roleName}") . '@example.com';

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

        $user->assignRole($role);
        $branch->users()->syncWithoutDetaching([$user->id]);
    }
}
