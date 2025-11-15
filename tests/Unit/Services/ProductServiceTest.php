<?php

use App\DataTransferObjects\ProductDTO;
use App\Models\Product;
use App\Repositories\Branch\BranchRepository;
use App\Repositories\Category\CategoryRepository;
use App\Repositories\Product\ProductRepository;
use App\Repositories\ProductBranch\ProductBranchRepository;
use App\Services\ProductService;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Mockery as M;

beforeEach(function () {
    Storage::fake('public');

    $this->productRepository = M::mock(ProductRepository::class);
    $this->productBranchRepository = M::mock(ProductBranchRepository::class);
    $this->categoryRepository = M::mock(CategoryRepository::class);
    $this->branchRepository = M::mock(BranchRepository::class);

    $this->service = new ProductService(
        $this->productRepository,
        $this->productBranchRepository,
        $this->categoryRepository,
        $this->branchRepository
    );

    DB::shouldReceive('transaction')
        ->andReturnUsing(fn ($callback) => $callback());
});

afterEach(fn () => M::close());

it('stores a product and syncs branches', function () {
    $dto = new ProductDTO(
        name: 'Espresso',
        categoryId: 7,
        price: 25000,
        description: 'Strong coffee',
        branchIds: [3, 4],
        photo: null
    );

    $this->categoryRepository
        ->shouldReceive('getByOwnerId')
        ->with(1)
        ->andReturn(categoryCollectionStub([
            ['id' => 7, 'branches' => [3, 4]],
        ]));

    $product = M::mock(Product::class)->makePartial();
    $product->id = 21;
    $product->photo = null;
    $product->shouldReceive('load')->with(['category.branches', 'branches'])->andReturnSelf();

    $this->productRepository
        ->shouldReceive('store')
        ->with($dto->toArray(null))
        ->andReturn($product);

    $this->productBranchRepository
        ->shouldReceive('deleteByProductId')
        ->once()
        ->with(21);

    $this->productBranchRepository
        ->shouldReceive('batchInsert')
        ->once()
        ->with(M::on(function ($payload) {
            return collect($payload)->pluck('branch_id')->sort()->values()->all() === [3, 4];
        }));

    $result = $this->service->store($dto, 1);

    expect($result)->toBe($product);
});

it('updates a product when user has access to its branches', function () {
    $dto = new ProductDTO(
        name: 'Updated Espresso',
        categoryId: 8,
        price: 30000,
        description: 'New desc',
        branchIds: [5],
        photo: null
    );

    $product = M::mock(Product::class)->makePartial();
    $product->id = 30;
    $product->photo = 'products/old.jpg';
    $product->branches = collect([(object) ['id' => 5]]);
    $product->shouldReceive('load')->with('branches')->andReturnSelf();

    $updatedProduct = M::mock(Product::class)->makePartial();
    $updatedProduct->shouldReceive('load')->with(['category.branches', 'branches'])->andReturnSelf();
    $updatedProduct->shouldReceive('load')->with(['category.branches', 'branches'])->andReturnSelf();

    $this->productRepository
        ->shouldReceive('getById')
        ->with(30)
        ->andReturn($product);

    $this->branchRepository
        ->shouldReceive('getByOwnerId')
        ->with(10)
        ->andReturn(new EloquentCollection([(object) ['id' => 5]]));

    $this->categoryRepository
        ->shouldReceive('getByOwnerId')
        ->with(10)
        ->andReturn(categoryCollectionStub([
            ['id' => 8, 'branches' => [5]],
        ]));

    $this->productRepository
        ->shouldReceive('update')
        ->with(30, $dto->toArray('products/old.jpg'))
        ->andReturn($updatedProduct);

    $this->productBranchRepository
        ->shouldReceive('deleteByProductId')
        ->once()
        ->with(30);

    $this->productBranchRepository
        ->shouldReceive('batchInsert')
        ->once();

    $result = $this->service->update(30, $dto, 10);

    expect($result)->toBe($updatedProduct);
});

it('deletes a product when accessible by the user', function () {
    $product = M::mock(Product::class)->makePartial();
    $product->id = 40;
    $product->photo = 'products/file.jpg';
    $product->branches = collect([(object) ['id' => 6]]);
    $product->shouldReceive('load')->with('branches')->andReturnSelf();

    $this->productRepository
        ->shouldReceive('getById')
        ->with(40)
        ->andReturn($product);

    $this->branchRepository
        ->shouldReceive('getByOwnerId')
        ->with(11)
        ->andReturn(new EloquentCollection([(object) ['id' => 6]]));

    $this->productBranchRepository
        ->shouldReceive('deleteByProductId')
        ->with(40)
        ->andReturnTrue();

    $this->productRepository
        ->shouldReceive('delete')
        ->with(40)
        ->andReturnTrue();

    Storage::disk('public')->put('products/file.jpg', 'dummy');

    expect($this->service->delete(40, 11))->toBeTrue();
    Storage::disk('public')->assertMissing('products/file.jpg');
});

function categoryCollectionStub(array $categories): EloquentCollection
{
    $items = array_map(function ($category) {
        return (object) [
            'id' => $category['id'],
            'branches' => new EloquentCollection(array_map(
                fn ($branchId) => (object) ['id' => $branchId]
            , $category['branches'])),
        ];
    }, $categories);

    return new EloquentCollection($items);
}
