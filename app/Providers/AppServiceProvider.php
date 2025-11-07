<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\Business\BusinessRepository;
use App\Repositories\Business\EloquentBusinessRepository;
use App\Repositories\Branch\BranchRepository;
use App\Repositories\Branch\EloquentBranchRepository;
use App\Repositories\Category\CategoryRepository;
use App\Repositories\Category\EloquentCategoryRepository;
use App\Repositories\Product\ProductRepository;
use App\Repositories\Product\EloquentProductRepository;
use App\Repositories\User\UserRepository;
use App\Repositories\User\EloquentUserRepository;
use App\Repositories\CategoryBranch\CategoryBranchRepository;
use App\Repositories\CategoryBranch\EloquentCategoryBranchRepository;
use App\Repositories\ProductBranch\ProductBranchRepository;
use App\Repositories\ProductBranch\EloquentProductBranchRepository;
use App\Repositories\UserBranch\UserBranchRepository;
use App\Repositories\UserBranch\EloquentUserBranchRepository;
use App\Repositories\Promo\PromoRepository;
use App\Repositories\Promo\EloquentPromoRepository;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Business Repository
        $this->app->singleton(BusinessRepository::class, EloquentBusinessRepository::class);
        
        // Branch Repository
        $this->app->singleton(BranchRepository::class, EloquentBranchRepository::class);
        
        // Category Repository
        $this->app->singleton(CategoryRepository::class, EloquentCategoryRepository::class);
        
        // Product Repository
        $this->app->singleton(ProductRepository::class, EloquentProductRepository::class);
        
        // User Repository
        $this->app->singleton(UserRepository::class, EloquentUserRepository::class);
        
        // CategoryBranch Repository
        $this->app->singleton(CategoryBranchRepository::class, EloquentCategoryBranchRepository::class);
        
        // ProductBranch Repository
        $this->app->singleton(ProductBranchRepository::class, EloquentProductBranchRepository::class);
        
        // UserBranch Repository
        $this->app->singleton(UserBranchRepository::class, EloquentUserBranchRepository::class);

        // Promo Repository
        $this->app->singleton(PromoRepository::class, EloquentPromoRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
