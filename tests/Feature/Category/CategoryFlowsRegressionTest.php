<?php

use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithCategory;
use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);
uses(InteractsWithCategory::class);

it('performs a full category CRUD regression flow', function () {
    $user = $this->createBusinessUser();
    $branch = $this->createBranch(['owner_id' => $user->id]);

    $createPayload = [
        'name' => 'Regression Category',
        'icon' => 'fa-box',
        'branch_ids' => [$branch->id],
    ];

    actingAs($user)
        ->post(route('categories.store'), $createPayload)
        ->assertRedirect(route('categories.index'))
        ->assertSessionHas('success');

    $category = Category::where('name', 'Regression Category')->first();
    expect($category)->not->toBeNull();

    $updatePayload = [
        'name' => 'Regression Category Updated',
        'icon' => 'fa-star',
        'branch_ids' => [$branch->id],
    ];

    actingAs($user)
        ->put(route('categories.update', $category), $updatePayload)
        ->assertRedirect(route('categories.index'))
        ->assertSessionHas('success');

    $category->refresh();
    expect($category->name)->toBe('Regression Category Updated')
        ->and($category->icon)->toBe('fa-star');

    actingAs($user)
        ->delete(route('categories.destroy', $category))
        ->assertRedirect(route('categories.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});

