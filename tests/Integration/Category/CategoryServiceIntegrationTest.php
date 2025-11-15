<?php

use App\DataTransferObjects\CategoryDTO;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithCategory;

uses(RefreshDatabase::class);
uses(InteractsWithCategory::class);

beforeEach(function () {
    $this->service = app(CategoryService::class);
});

it('stores a category with branches through the real stack', function () {
    $branch = $this->createBranch();

    $dto = new CategoryDTO(
        name: 'Integration Category',
        branchIds: [$branch->id],
        icon: 'fa-box'
    );

    $category = $this->service->store($dto);

    expect($category)->toBeInstanceOf(Category::class)
        ->and($category->name)->toBe('Integration Category')
        ->and($category->branches)->toHaveCount(1);
});

it('updates and deletes a category end-to-end', function () {
    $branch = $this->createBranch();
    $category = $this->createCategory(branchIds: [$branch->id]);

    $dto = new CategoryDTO(
        name: 'Updated Category',
        branchIds: [$branch->id],
        icon: 'fa-star'
    );

    $updated = $this->service->update($category->id, $dto);

    expect($updated->name)->toBe('Updated Category');

    $deleteResult = $this->service->delete($category->id);

    expect($deleteResult)->toBeTrue();
    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});

