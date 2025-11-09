<?php

use App\Models\Category;
use App\Repositories\Category\CategoryRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithCategory;

uses(RefreshDatabase::class);
uses(InteractsWithCategory::class);

it('stores a category record', function () {
    $repository = app(CategoryRepository::class);

    $category = $repository->store([
        'name' => 'Repository Category',
        'icon' => 'fa-box',
    ]);

    expect($category)->toBeInstanceOf(Category::class)
        ->and($category->exists)->toBeTrue();
});

it('updates a category record', function () {
    $repository = app(CategoryRepository::class);
    $category = $this->createCategory(['name' => 'Before']);

    $updated = $repository->update($category->id, [
        'name' => 'After',
        'icon' => 'fa-star',
    ]);

    expect($updated->name)->toBe('After')
        ->and($updated->icon)->toBe('fa-star');
});

it('deletes a category record', function () {
    $repository = app(CategoryRepository::class);
    $category = $this->createCategory();

    $result = $repository->delete($category->id);

    expect($result)->toBeTrue();
    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});

it('retrieves categories by owner id', function () {
    $repository = app(CategoryRepository::class);
    $user = $this->createBusinessUser();
    $branch = $this->createBranch(['owner_id' => $user->id]);

    $this->createCategory(branchIds: [$branch->id]);
    $this->createCategory(branchIds: [$branch->id]);

    $categories = $repository->getByOwnerId($user->id);

    expect($categories)->toHaveCount(2);
});

it('retrieves categories by branch id', function () {
    $repository = app(CategoryRepository::class);
    $branch = $this->createBranch();

    $this->createCategory(branchIds: [$branch->id]);
    $this->createCategory(branchIds: [$branch->id]);

    $categories = $repository->getByBranchId($branch->id);

    expect($categories)->toHaveCount(2);
});

it('retrieves categories by business id', function () {
    $repository = app(CategoryRepository::class);
    $branch = $this->createBranch();

    $this->createCategory(branchIds: [$branch->id]);
    $this->createCategory(branchIds: [$branch->id]);

    $categories = $repository->getByBusinessId($branch->business_id);

    expect($categories)->toHaveCount(2);
});

