<?php

namespace App\Http\Controllers;

use App\Repositories\Business\BusinessRepository;
use App\Repositories\Branch\BranchRepository;
use App\Repositories\Category\CategoryRepository;
use App\Repositories\Product\ProductRepository;
use Illuminate\Http\Request;

class RepositoryTestController extends Controller
{
    private BusinessRepository $businessRepository;
    private BranchRepository $branchRepository;
    private CategoryRepository $categoryRepository;
    private ProductRepository $productRepository;

    public function __construct(
        BusinessRepository $businessRepository,
        BranchRepository $branchRepository,
        CategoryRepository $categoryRepository,
        ProductRepository $productRepository
    ) {
        $this->businessRepository = $businessRepository;
        $this->branchRepository = $branchRepository;
        $this->categoryRepository = $categoryRepository;
        $this->productRepository = $productRepository;
    }

    public function testRepositories()
    {
        // Test each repository has the required methods
        $hasMethods = [
            'business' => [
                'getById' => method_exists($this->businessRepository, 'getById'),
                'store' => method_exists($this->businessRepository, 'store'),
                'update' => method_exists($this->businessRepository, 'update'),
                'delete' => method_exists($this->businessRepository, 'delete'),
            ],
            'branch' => [
                'getById' => method_exists($this->branchRepository, 'getById'),
                'store' => method_exists($this->branchRepository, 'store'),
                'update' => method_exists($this->branchRepository, 'update'),
                'delete' => method_exists($this->branchRepository, 'delete'),
            ],
            'category' => [
                'getById' => method_exists($this->categoryRepository, 'getById'),
                'store' => method_exists($this->categoryRepository, 'store'),
                'update' => method_exists($this->categoryRepository, 'update'),
                'delete' => method_exists($this->categoryRepository, 'delete'),
            ],
            'product' => [
                'getById' => method_exists($this->productRepository, 'getById'),
                'store' => method_exists($this->productRepository, 'store'),
                'update' => method_exists($this->productRepository, 'update'),
                'delete' => method_exists($this->productRepository, 'delete'),
            ],
        ];

        return response()->json($hasMethods);
    }
}