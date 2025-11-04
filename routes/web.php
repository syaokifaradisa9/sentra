<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\BusinessController;
use App\Http\Controllers\CashierController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;

Route::redirect("/", "/auth/login");

Route::prefix('auth')
    ->controller(AuthController::class)
    ->as('auth.')
    ->group(function () {
        Route::get('/login', 'login')->name('login')->middleware('guest');
        Route::post('/verify', 'verify')->name('verify');

        Route::middleware('auth')->group(function () {
            Route::get('/profile', 'changeProfile')->name('profile');
            Route::put('/update-profile', 'updateProfile')->name('update-profile');

            Route::get('/password', 'changePassword')->name('password');
            Route::put('/update-password', 'updatePassword')->name('update-password');
            Route::post('/logout', 'logout')->name('logout');
        });
    });

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/cashier', [CashierController::class, 'index'])->name('cashier');

    Route::prefix('branches')
        ->controller(BranchController::class)
        ->as('branches.')
        ->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/datatable', 'datatable')->name('datatable');
            Route::prefix('print')
                ->as('print.')
                ->group(function () {
                    Route::get('/pdf', 'printPdf')->name('pdf');
                    Route::get('/excel', 'printExcel')->name('excel');
                });
            Route::get('/create', 'create')->name('create');
            Route::post('/', 'store')->name('store');
            Route::prefix('{branch}')->group(function () {
                Route::get('/edit', 'edit')->name('edit');
                Route::put('/', 'update')->name('update');
                Route::delete('/', 'destroy')->name('destroy');
            });
        });

    Route::prefix('business')
        ->controller(BusinessController::class)
        ->as('business.')
        ->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/create', 'create')->name('create');
            Route::post('/store', 'store')->name('store');
            Route::prefix('{business}')->group(function () {
                Route::get('/edit', 'edit')->name('edit');
                Route::post('/update', 'update')->name('update');
                Route::delete('/delete', 'destroy')->name('delete');
            });
            Route::get('/datatable', 'datatable')->name('datatable');
            Route::prefix('print')
                ->as('print.')
                ->group(function () {
                    Route::get('/pdf', 'printPdf')->name('pdf');
                    Route::get('/excel', 'printExcel')->name('excel');
                });
        });

    Route::prefix('categories')
        ->controller(CategoryController::class)
        ->as('categories.')
        ->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/datatable', 'datatable')->name('datatable');
            Route::prefix('print')
                ->as('print.')
                ->group(function () {
                    Route::get('/pdf', 'printPdf')->name('pdf');
                    Route::get('/excel', 'printExcel')->name('excel');
                });
            Route::get('/create', 'create')->name('create');
            Route::post('/', 'store')->name('store');
            Route::prefix('{category}')->group(function () {
                Route::get('/edit', 'edit')->name('edit');
                Route::put('/', 'update')->name('update');
                Route::delete('/', 'destroy')->name('destroy');
            });
        });

    Route::prefix('products')
        ->controller(ProductController::class)
        ->as('products.')
        ->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/datatable', 'datatable')->name('datatable');
            Route::prefix('print')
                ->as('print.')
                ->group(function () {
                    Route::get('/pdf', 'printPdf')->name('pdf');
                    Route::get('/excel', 'printExcel')->name('excel');
                });
            Route::get('/create', 'create')->name('create');
            Route::post('/', 'store')->name('store');
            Route::prefix('{product}')->group(function () {
                Route::get('/edit', 'edit')->name('edit');
                Route::post('/update', 'update')->name('update');
                Route::delete('/', 'destroy')->name('destroy');
            });
        });
});
