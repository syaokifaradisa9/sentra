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

        $categories = $this->categoryService
            ->getForExport([], $userId)
            ->map(static function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'icon' => $category->icon,
                ];
            })
            ->values();

        $products = $this->productService
            ->getForExport([], $userId)
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
        ]);
    }
}

