<?php

use App\Models\Category;
use App\Models\CategoryBranch;
use App\Repositories\CategoryBranch\CategoryBranchRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithCategory;

uses(RefreshDatabase::class);
uses(InteractsWithCategory::class);

it('batch inserts category branch relations', function () {
    $repository = app(CategoryBranchRepository::class);
    $category = $this->createCategory();
    $branch = $this->createBranch();

    $repository->batchInsert([
        ['category_id' => $category->id, 'branch_id' => $branch->id],
    ]);

    $this->assertDatabaseHas('category_branches', [
        'category_id' => $category->id,
        'branch_id' => $branch->id,
    ]);
});

it('deletes relations by category id', function () {
    $repository = app(CategoryBranchRepository::class);
    $category = $this->createCategory();
    $branch = $this->createBranch();

    CategoryBranch::create([
        'category_id' => $category->id,
        'branch_id' => $branch->id,
    ]);

    $result = $repository->deleteByCategoryId($category->id);

    expect($result)->toBeTrue();
    $this->assertDatabaseMissing('category_branches', [
        'category_id' => $category->id,
    ]);
});

it('retrieves relations by category id', function () {
    $repository = app(CategoryBranchRepository::class);
    $category = Category::factory()->create();
    $branchA = $this->createBranch();
    $branchB = $this->createBranch();

    CategoryBranch::insert([
        ['category_id' => $category->id, 'branch_id' => $branchA->id],
        ['category_id' => $category->id, 'branch_id' => $branchB->id],
    ]);

    $relations = $repository->getByCategoryId($category->id);

    expect($relations)->toHaveCount(2);
});
