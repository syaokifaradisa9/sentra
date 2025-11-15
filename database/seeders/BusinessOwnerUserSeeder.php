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

class BusinessOwnerUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $role = Role::firstOrCreate(
            ['name' => 'BusinessOwner'],
            ['name' => 'BusinessOwner', 'guard_name' => 'web']
        );

        $owner = User::firstOrCreate(
            ['email' => 'businessowner@example.com'],
            [
                'name' => 'Business Owner Demo',
                'password' => Hash::make('password'),
                'phone' => '081234567891',
                'address' => 'Jl. Usaha Besar No. 456, Jakarta',
                'position' => 'Business Owner',
            ]
        );
        $owner->assignRole($role);

        $business = Business::updateOrCreate(
            [
                'owner_id' => $owner->id,
                'name' => 'Cita Rasa Catering Group',
            ],
            [
                'description' => 'Bisnis katering modern dengan fokus menu harian dan paket acara.',
            ]
        );

        $branchMap = [];
        $branchBlueprints = [
            [
                'name' => 'Cita Rasa - Jakarta Barat',
                'address' => 'Jl. Puri Indah No. 33, Jakarta Barat',
                'opening_time' => '06:00',
                'closing_time' => '20:00',
            ],
            [
                'name' => 'Cita Rasa - Depok',
                'address' => 'Jl. Margonda Raya No. 129, Depok',
                'opening_time' => '06:30',
                'closing_time' => '19:30',
            ],
            [
                'name' => 'Cita Rasa - Karawang',
                'address' => 'Jl. Ahmad Yani No. 5, Karawang',
                'opening_time' => '07:00',
                'closing_time' => '21:00',
            ],
        ];

        foreach ($branchBlueprints as $data) {
            $branch = Branch::updateOrCreate(
                [
                    'business_id' => $business->id,
                    'name' => $data['name'],
                ],
                [
                    'owner_id' => $owner->id,
                    'address' => $data['address'],
                    'opening_time' => $data['opening_time'],
                    'closing_time' => $data['closing_time'],
                ]
            );

            $branchMap[$data['name']] = $branch;

            $this->seedBranchStaff($branch, 'Manager');
            $this->seedBranchStaff($branch, 'Cashier');
        }

        $categories = [
            [
                'name' => 'CR - Paket Prasmanan',
                'icon' => 'ChefHat',
                'branches' => 'all',
                'products' => [
                    [
                        'name' => 'Paket Prasmanan Deluxe',
                        'price' => 55000,
                        'description' => 'Menu lengkap nasi, lauk, sayur, sup dan dessert.',
                        'branches' => 'all',
                    ],
                    [
                        'name' => 'Paket Prasmanan Nusantara',
                        'price' => 48000,
                        'description' => 'Rendang, ayam goreng serundeng dan aneka sambal.',
                        'branches' => [
                            'Cita Rasa - Jakarta Barat',
                            'Cita Rasa - Depok',
                        ],
                    ],
                ],
            ],
            [
                'name' => 'CR - Coffee Break',
                'icon' => 'CupSoda',
                'branches' => [
                    'Cita Rasa - Jakarta Barat',
                    'Cita Rasa - Karawang',
                ],
                'products' => [
                    [
                        'name' => 'Coffee Break Premium',
                        'price' => 38000,
                        'description' => 'Kombinasi pastry, kopi susu, dan teh premium.',
                        'branches' => 'all',
                    ],
                    [
                        'name' => 'Snack Box Nusantara',
                        'price' => 28000,
                        'description' => 'Jajanan pasar berisi lemper, pastel, kue lapis dan teh tarik.',
                        'branches' => [
                            'Cita Rasa - Depok',
                            'Cita Rasa - Karawang',
                        ],
                    ],
                ],
            ],
            [
                'name' => 'CR - Catering Harian',
                'icon' => 'Utensils',
                'branches' => [
                    'Cita Rasa - Depok',
                    'Cita Rasa - Karawang',
                ],
                'products' => [
                    [
                        'name' => 'Menu Diet Mayo',
                        'price' => 42000,
                        'description' => 'Paket 3 hari makan sehat rendah garam.',
                        'branches' => ['Cita Rasa - Jakarta Barat'],
                    ],
                    [
                        'name' => 'Menu Rumahan Spesial',
                        'price' => 32000,
                        'description' => 'Nasi, lauk, sayur, buah segar untuk kantor.',
                        'branches' => 'all',
                    ],
                ],
            ],
        ];

        foreach ($categories as $blueprint) {
            $category = Category::updateOrCreate(
                ['name' => $blueprint['name']],
                ['icon' => $blueprint['icon']]
            );

            $categoryBranchIds = $this->resolveBranchTargets($branchMap, $blueprint['branches'] ?? 'all');
            $category->branches()->syncWithoutDetaching($categoryBranchIds);

            foreach ($blueprint['products'] as $productData) {
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

                $productBranchIds = $this->resolveBranchTargets($branchMap, $productData['branches'] ?? $blueprint['branches'] ?? 'all');
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

        $email = Str::slug("bo {$branch->name} {$roleName}") . '@example.com';

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
