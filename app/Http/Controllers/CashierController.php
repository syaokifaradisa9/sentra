<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\BranchService;
use App\Services\CategoryService;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class CashierController extends Controller
{
    public function __construct(
        private ProductService $productService,
        private CategoryService $categoryService,
        private BranchService $branchService,
    ) {}

    public function index(Request $request): InertiaResponse
    {
        /** @var User $user */
        $user = $request->user();
        $role = $user->getRoleNames()->first() ?? '';
        $branchOptions = $this->resolveBranchOptions($user, $role);

        $accessibleBranchIds = $this->branchService->getBranchIdsForUser($user->id);
        $selectedBranchId = $this->determineSelectedBranchId($request, $role, $accessibleBranchIds);

        $productCollection = $selectedBranchId
            ? $this->productService->getByBranch($selectedBranchId)
            : collect();

        $categoryCollection = $selectedBranchId
            ? $this->categoryService->getByBranchId($selectedBranchId)
            : collect();

        $categoryProductCounts = $productCollection
            ->groupBy('category_id')
            ->map->count();

        $categories = $categoryCollection
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

        $activeBranch = $selectedBranchId
            ? $this->branchService->getById($selectedBranchId)
            : null;

        return Inertia::render('cashier/Index', [
            'categories' => $categories,
            'products' => $products,
            'total_products' => $products->count(),
            'branchOptions' => $branchOptions,
            'selectedBranchId' => $selectedBranchId,
            'canSelectBranch' => $this->canSelectBranch($role, $branchOptions),
            'activeBranch' => $activeBranch ? [
                'id' => $activeBranch->id,
                'name' => $activeBranch->name,
            ] : null,
            'currentRole' => $role,
        ]);
    }

    private function determineSelectedBranchId(Request $request, string $role, array $branchIds): ?int
    {
        if (empty($branchIds)) {
            return null;
        }

        if (in_array($role, ['Businessman', 'BusinessOwner'], true)) {
            $requestedId = $request->integer('branch_id');

            if ($requestedId && in_array($requestedId, $branchIds, true)) {
                return $requestedId;
            }

            return $branchIds[0];
        }

        return $branchIds[0];
    }

    private function resolveBranchOptions(User $user, string $role): array
    {
        if (in_array($role, ['Businessman', 'BusinessOwner', 'SmallBusinessOwner'], true)) {
            return $this->branchService->getOptionsDataByOwnerId($user->id);
        }

        return $this->branchService->getOptionsDataByUserId($user->id);
    }

    private function canSelectBranch(string $role, array $branchOptions): bool
    {
        return in_array($role, ['Businessman', 'BusinessOwner'], true)
            && count($branchOptions) > 0;
    }
}
