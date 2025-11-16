<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\Concerns\InteractsWithProduct;
use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);
uses(InteractsWithProduct::class);

dataset('cashierOwnerRoles', ['Businessman', 'BusinessOwner']);
dataset('cashierStaffRoles', ['Manager', 'Cashier']);

it('filters cashier data by selected branch for owner roles', function (string $role) {
    $user = $role === 'Businessman'
        ? $this->createBusinessUser()
        : $this->createBusinessOwnerUser();

    $branchOne = $this->createBranch(['owner_id' => $user->id, 'name' => 'Branch Alpha']);
    $branchTwo = $this->createBranch(['owner_id' => $user->id, 'name' => 'Branch Beta']);

    $categoryOne = $this->createCategory(['name' => 'Category Alpha'], [$branchOne->id]);
    $productOne = $this->createProduct(
        ['name' => 'Product Alpha', 'category_id' => $categoryOne->id],
        [$branchOne->id]
    );

    $categoryTwo = $this->createCategory(['name' => 'Category Beta'], [$branchTwo->id]);
    $this->createProduct(
        ['name' => 'Product Beta', 'category_id' => $categoryTwo->id],
        [$branchTwo->id]
    );

    actingAs($user)
        ->get(route('cashier', ['branch_id' => $branchOne->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('cashier/Index')
            ->where('selectedBranchId', $branchOne->id)
            ->where('canSelectBranch', true)
            ->has('branchOptions', 2)
            ->has('categories', 1)
            ->where('categories.0.id', $categoryOne->id)
            ->where('categories.0.name', 'Category Alpha')
            ->has('products', 1)
            ->where('products.0.id', $productOne->id)
            ->where('products.0.name', 'Product Alpha')
        );
})->with('cashierOwnerRoles');

it('automatically filters data for SmallBusinessOwner branch', function () {
    $owner = $this->createSmallBusinessOwnerUser();

    $ownedBranch = $this->createBranch(['owner_id' => $owner->id, 'name' => 'Owner Branch']);
    $otherBranch = $this->createBranch(['name' => 'Other Branch']);

    $categoryOwned = $this->createCategory(['name' => 'Owner Category'], [$ownedBranch->id]);
    $productOwned = $this->createProduct(
        ['name' => 'Owner Product', 'category_id' => $categoryOwned->id],
        [$ownedBranch->id]
    );

    $categoryOther = $this->createCategory(['name' => 'Other Category'], [$otherBranch->id]);
    $this->createProduct(
        ['name' => 'Other Product', 'category_id' => $categoryOther->id],
        [$otherBranch->id]
    );

    actingAs($owner)
        ->get(route('cashier'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('cashier/Index')
            ->where('selectedBranchId', $ownedBranch->id)
            ->where('canSelectBranch', false)
            ->where('activeBranch.id', $ownedBranch->id)
            ->has('categories', 1)
            ->where('categories.0.id', $categoryOwned->id)
            ->where('categories.0.name', 'Owner Category')
            ->has('products', 1)
            ->where('products.0.id', $productOwned->id)
            ->where('products.0.name', 'Owner Product')
        );
});

it('filters cashier data based on assigned branch for staff roles', function (string $role) {
    $businessOwner = $this->createBusinessUser();
    $branch = $this->createBranch(['owner_id' => $businessOwner->id, 'name' => 'Managed Branch']);
    $otherBranch = $this->createBranch(['owner_id' => $businessOwner->id, 'name' => 'Hidden Branch']);

    $staff = createUserWithRoleForCashier($role);
    $branch->users()->attach($staff->id);

    $categoryVisible = $this->createCategory(['name' => 'Visible Category'], [$branch->id]);
    $productVisible = $this->createProduct(
        ['name' => 'Visible Product', 'category_id' => $categoryVisible->id],
        [$branch->id]
    );

    $categoryHidden = $this->createCategory(['name' => 'Hidden Category'], [$otherBranch->id]);
    $this->createProduct(
        ['name' => 'Hidden Product', 'category_id' => $categoryHidden->id],
        [$otherBranch->id]
    );

    actingAs($staff)
        ->get(route('cashier'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('cashier/Index')
            ->where('selectedBranchId', $branch->id)
            ->where('canSelectBranch', false)
            ->where('activeBranch.id', $branch->id)
            ->has('categories', 1)
            ->where('categories.0.id', $categoryVisible->id)
            ->where('categories.0.name', 'Visible Category')
            ->has('products', 1)
            ->where('products.0.id', $productVisible->id)
            ->where('products.0.name', 'Visible Product')
        );
})->with('cashierStaffRoles');

function createUserWithRoleForCashier(string $role): User
{
    $roleModel = Role::findOrCreate($role, 'web');

    /** @var User $user */
    $user = User::factory()->create([
        'position' => $role,
    ]);

    $user->assignRole($roleModel);

    return $user;
}
