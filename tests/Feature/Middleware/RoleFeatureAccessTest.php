<?php

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

it('Businessman dapat mengakses semua modul', function () {
    $user = createUserWithRole('Businessman');
    assertAllowed($user, ['dashboard', 'cashier', 'business', 'branches', 'categories', 'products', 'promos', 'employees']);
});

it('BusinessOwner tidak boleh membuka menu business', function () {
    $user = createUserWithRole('BusinessOwner');
    assertAllowed($user, ['dashboard', 'cashier', 'branches', 'categories', 'products', 'promos', 'employees']);
    assertForbidden($user, ['business']);
});

it('SmallBusinessOwner dilarang pada bisnis dan cabang', function () {
    $user = createUserWithRole('SmallBusinessOwner');
    assertAllowed($user, ['dashboard', 'cashier', 'categories', 'products', 'promos', 'employees']);
    assertForbidden($user, ['business', 'branches']);
});

it('Manager dilarang pada bisnis dan cabang', function () {
    $user = createUserWithRole('Manager');
    assertAllowed($user, ['dashboard', 'cashier', 'categories', 'products', 'promos']);
    assertForbidden($user, ['business', 'branches']);
});

it('Kasir hanya boleh dashboard, kasir, kategori, produk, promo', function () {
    $user = createUserWithRole('Cashier');
    assertAllowed($user, ['dashboard', 'cashier', 'categories', 'products', 'promos']);
    assertForbidden($user, ['business', 'branches']);
});

function featureRoutes(): array
{
    return [
        'dashboard' => route('dashboard'),
        'cashier' => route('cashier'),
        'business' => route('business.index'),
        'branches' => route('branches.index'),
        'categories' => route('categories.index'),
        'products' => route('products.index'),
        'promos' => route('promos.index'),
        'employees' => route('employees.index'),
    ];
}

function createUserWithRole(string $role): User
{
    Role::firstOrCreate(['name' => $role], ['guard_name' => 'web']);

    $user = User::factory()->create([
        'position' => $role,
    ]);

    $user->syncRoles([$role]);

    return $user;
}

function assertAllowed(User $user, array $routeKeys): void
{
    $routes = featureRoutes();

    foreach ($routeKeys as $key) {
        actingAs($user)
            ->get($routes[$key])
            ->assertStatus(200);
    }
}

function assertForbidden(User $user, array $routeKeys): void
{
    $routes = featureRoutes();

    foreach ($routeKeys as $key) {
        actingAs($user)
            ->get($routes[$key])
            ->assertStatus(403);
    }
}
