<?php

use App\Http\Middleware\EnsureBusinessOwner;
use App\Models\Business;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

it('allows the business owner to pass through the middleware', function () {
    $user = User::factory()->create();
    $business = Business::factory()->create(['owner_id' => $user->id]);

    Route::middleware(['web', EnsureBusinessOwner::class])
        ->get('/middleware-test/business-owner/{business}', fn () => response()->json(['ok' => true]));

    actingAs($user)
        ->get("/middleware-test/business-owner/{$business->id}")
        ->assertOk()
        ->assertJson(['ok' => true]);
});

it('forbids users who do not own the business', function () {
    $owner = User::factory()->create();
    $business = Business::factory()->create(['owner_id' => $owner->id]);
    $otherUser = User::factory()->create();

    Route::middleware(['web', EnsureBusinessOwner::class])
        ->get('/middleware-test/business-non-owner/{business}', fn () => response()->json(['ok' => true]));

    actingAs($otherUser)
        ->get("/middleware-test/business-non-owner/{$business->id}")
        ->assertForbidden();
});

