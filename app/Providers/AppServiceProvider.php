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
use App\Repositories\BranchEmployee\BranchEmployeeRepository;
use App\Repositories\BranchEmployee\EloquentBranchEmployeeRepository;
use App\Repositories\Transaction\TransactionRepository;
use App\Repositories\Transaction\EloquentTransactionRepository;
use App\Repositories\ProductTransaction\ProductTransactionRepository;
use App\Repositories\ProductTransaction\EloquentProductTransactionRepository;
use App\Repositories\Promo\PromoRepository;
use App\Repositories\Promo\EloquentPromoRepository;
use App\Repositories\PromoPriceHistory\PromoPriceHistoryRepository;
use App\Repositories\PromoPriceHistory\EloquentPromoPriceHistoryRepository;

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
        
        // BranchEmployee Repository
        $this->app->singleton(BranchEmployeeRepository::class, EloquentBranchEmployeeRepository::class);

        // Transaction Repository
        $this->app->singleton(TransactionRepository::class, EloquentTransactionRepository::class);

        // Product Transaction Repository
        $this->app->singleton(ProductTransactionRepository::class, EloquentProductTransactionRepository::class);

        // Promo Repository
        $this->app->singleton(PromoRepository::class, EloquentPromoRepository::class);

        // Promo Price History Repository
        $this->app->singleton(PromoPriceHistoryRepository::class, EloquentPromoPriceHistoryRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
