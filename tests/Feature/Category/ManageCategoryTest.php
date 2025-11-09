<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithCategory;
use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);
uses(InteractsWithCategory::class);

it('allows a Businessman to create a category', function () {
    $user = $this->createBusinessUser();
    $branch = $this->createBranch(['owner_id' => $user->id]);
    $payload = $this->categoryPayload($branch);

    actingAs($user)
        ->post(route('categories.store'), $payload)
        ->assertRedirect(route('categories.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('categories', [
        'name' => $payload['name'],
    ]);
});

it('validates mandatory fields when creating a category', function () {
    $user = $this->createBusinessUser();

    actingAs($user)
        ->post(route('categories.store'), [])
        ->assertSessionHasErrors(['name']);
});

it('updates an existing category', function () {
    $user = $this->createBusinessUser();
    $branch = $this->createBranch(['owner_id' => $user->id]);
    $category = $this->createCategory(['name' => 'Old Category'], [$branch->id]);

    $payload = [
        'name' => 'Updated Category',
        'icon' => 'fa-star',
        'branch_ids' => [$branch->id],
    ];

    actingAs($user)
        ->put(route('categories.update', $category), $payload)
        ->assertRedirect(route('categories.index'))
        ->assertSessionHas('success');

    $category->refresh();

    expect($category->name)->toBe('Updated Category')
        ->and($category->icon)->toBe('fa-star');
});

it('deletes a category', function () {
    $user = $this->createBusinessUser();
    $branch = $this->createBranch(['owner_id' => $user->id]);
    $category = $this->createCategory(branchIds: [$branch->id]);

    actingAs($user)
        ->delete(route('categories.destroy', $category))
        ->assertRedirect(route('categories.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});

