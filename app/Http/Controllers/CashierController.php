<?php

namespace App\Http\Controllers;

use App\Services\CategoryService;
use App\Services\ProductService;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class CashierController extends Controller
{
    public function __construct(
        private ProductService $productService,
        private CategoryService $categoryService,
    ) {}

    public function index(): InertiaResponse
    {
        $userId = auth()->id();

        $productCollection = $this->productService->getByOwnerId($userId);

        $categoryProductCounts = $productCollection
            ->groupBy('category_id')
            ->map->count();

        $categories = $this->categoryService
            ->getByOwnerId($userId)
            ->map(static function ($category) use ($categoryProductCounts) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'icon' => $category->icon,
                    'product_count' => $categoryProductCounts->get($category->id, 0),
                ];
            })
            ->values();

        $products = $productCollection
            ->map(static function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'category_id' => $product->category_id,
                    'category_name' => $product->category?->name,
                    'price' => (float) $product->price,
                    'description' => $product->description,
                    'photo_url' => $product->photo ? asset('storage/' . $product->photo) : null,
                ];
            })
            ->values();

        return Inertia::render('cashier/Index', [
            'categories' => $categories,
            'products' => $products,
            'total_products' => $products->count(),
        ]);
    }
}

