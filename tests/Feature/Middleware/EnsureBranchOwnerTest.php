<?php

use App\Http\Middleware\EnsureBranchOwner;
use App\Models\Branch;
use App\Models\Business;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

it('allows the branch owner to pass through the middleware', function () {
    $user = User::factory()->create();
    $business = Business::factory()->create(['owner_id' => $user->id]);
    $branch = Branch::factory()
        ->for($business)
        ->create(['owner_id' => $user->id]);

    Route::middleware(['web', EnsureBranchOwner::class])
        ->get('/middleware-test/branch-owner/{branch}', fn () => response()->json(['ok' => true]));

    actingAs($user)
        ->get("/middleware-test/branch-owner/{$branch->id}")
        ->assertOk()
        ->assertJson(['ok' => true]);
});

it('forbids users who do not own the branch', function () {
    $branchOwner = User::factory()->create();
    $business = Business::factory()->create(['owner_id' => $branchOwner->id]);
    $branch = Branch::factory()
        ->for($business)
        ->create(['owner_id' => $branchOwner->id]);
    $otherUser = User::factory()->create();

    Route::middleware(['web', EnsureBranchOwner::class])
        ->get('/middleware-test/branch-non-owner/{branch}', fn () => response()->json(['ok' => true]));

    actingAs($otherUser)
        ->get("/middleware-test/branch-non-owner/{$branch->id}")
        ->assertForbidden();
});

