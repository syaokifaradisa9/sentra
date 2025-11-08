<?php

use App\Models\Business;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\Concerns\InteractsWithBusiness;
use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);
uses(InteractsWithBusiness::class);

beforeEach(function () {
    Route::middleware('business.owner')->get('/middleware-test/business/{business}', function (Business $business) {
        return "ok-{$business->id}";
    });
});

it('allows the owner to proceed', function () {
    $user = $this->createBusinessUser();
    $business = $this->createBusiness(['owner_id' => $user->id]);

    actingAs($user)
        ->get("/middleware-test/business/{$business->id}")
        ->assertOk()
        ->assertSee("ok-{$business->id}");
});

it('blocks access when the user is not the owner', function () {
    $owner = $this->createBusinessUser();
    $otherUser = $this->createBusinessUser();
    $business = $this->createBusiness(['owner_id' => $owner->id]);

    actingAs($otherUser)
        ->get("/middleware-test/business/{$business->id}")
        ->assertForbidden();
});
