<?php

use App\DataTransferObjects\CategoryDTO;
use App\Models\Category;
use App\Repositories\Branch\BranchRepository;
use App\Repositories\Category\CategoryRepository;
use App\Repositories\CategoryBranch\CategoryBranchRepository;
use App\Services\CategoryService;
use Illuminate\Support\Facades\DB;
use Mockery as M;

beforeEach(function () {
    $this->categoryRepository = M::mock(CategoryRepository::class);
    $this->categoryBranchRepository = M::mock(CategoryBranchRepository::class);
    $this->branchRepository = M::mock(BranchRepository::class);
    $this->service = new CategoryService(
        $this->categoryRepository,
        $this->categoryBranchRepository,
        $this->branchRepository
    );

    DB::shouldReceive('transaction')
        ->andReturnUsing(fn ($callback) => $callback());
});

afterEach(fn () => M::close());

it('stores a category and syncs branches', function () {
    $dto = new CategoryDTO(name: 'Beverages', branchIds: [3, 4], icon: 'fa-mug');

    $category = M::mock(Category::class);
    $category->shouldReceive('getAttribute')->with('id')->andReturn(10);
    $category->shouldReceive('load')->with('branches')->andReturnSelf();

    $this->categoryRepository
        ->shouldReceive('store')
        ->once()
        ->with($dto->toArray())
        ->andReturn($category);

    $this->categoryBranchRepository
        ->shouldReceive('deleteByCategoryId')
        ->once()
        ->with(10)
        ->andReturnTrue();

    $this->categoryBranchRepository
        ->shouldReceive('batchInsert')
        ->once()
        ->with([
            ['category_id' => 10, 'branch_id' => 3],
            ['category_id' => 10, 'branch_id' => 4],
        ]);

    $result = $this->service->store($dto);

    expect($result)->toBe($category);
});

it('updates a category and reloads it', function () {
    $dto = new CategoryDTO(name: 'Updated', branchIds: [5], icon: null);
    $category = M::mock(Category::class);
    $category->shouldReceive('load')->with('branches')->andReturnSelf();

    $this->categoryRepository
        ->shouldReceive('update')
        ->once()
        ->with(7, ['name' => 'Updated', 'icon' => null])
        ->andReturnNull();

    $this->categoryBranchRepository
        ->shouldReceive('deleteByCategoryId')
        ->once()
        ->with(7)
        ->andReturnTrue();

    $this->categoryBranchRepository
        ->shouldReceive('batchInsert')
        ->once()
        ->with([
            ['category_id' => 7, 'branch_id' => 5],
        ]);

    $this->categoryRepository
        ->shouldReceive('getById')
        ->once()
        ->with(7)
        ->andReturn($category);

    $result = $this->service->update(7, $dto);

    expect($result)->toBe($category);
});

it('deletes a category and its relations', function () {
    $this->categoryBranchRepository
        ->shouldReceive('deleteByCategoryId')
        ->once()
        ->with(9)
        ->andReturnTrue();

    $this->categoryRepository
        ->shouldReceive('delete')
        ->once()
        ->with(9)
        ->andReturnTrue();

    expect($this->service->delete(9))->toBeTrue();
});
