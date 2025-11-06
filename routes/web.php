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

    Route::middleware('role:businessman')
        ->prefix('business')
        ->controller(BusinessController::class)
        ->as('business.')
        ->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/create', 'create')->name('create');
            Route::post('/store', 'store')->name('store');
            Route::prefix('{business}')->group(function () {
                Route::get('/edit', 'edit')->name('edit');
                Route::put('/update', 'update')->name('update');
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

    // Example route group for BusinessOwner-specific features (only BusinessOwner)
    Route::middleware('role:businessowner')
        ->prefix('business-owner')
        ->as('businessowner.')
        ->group(function () {
            Route::get('/', function () {
                return inertia('business-owner/Dashboard', [
                    'message' => 'Halo Business Owner! Anda memiliki akses ke fitur khusus.'
                ]);
            })->name('dashboard');
            
            Route::get('/reports', function () {
                return inertia('business-owner/Reports', [
                    'message' => 'Laporan khusus untuk Business Owner'
                ]);
            })->name('reports');
        });

    // Example route group for features accessible by both Businessman and BusinessOwner
    Route::middleware('role:businessman,businessowner')
        ->prefix('business-multi')
        ->as('businessmulti.')
        ->group(function () {
            Route::get('/', function () {
                return inertia('business-multi/Dashboard', [
                    'message' => 'Halo Businessman dan Business Owner! Anda memiliki akses ke fitur bersama.'
                ]);
            })->name('dashboard');
            
            Route::get('/analytics', function () {
                return inertia('business-multi/Analytics', [
                    'message' => 'Analitik bisnis untuk Businessman dan BusinessOwner'
                ]);
            })->name('analytics');
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

    Route::prefix('employees')
        ->controller(\App\Http\Controllers\EmployeeController::class)
        ->as('employees.')
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
            Route::prefix('{employee}')->group(function () {
                Route::get('/edit', 'edit')->name('edit');
                Route::put('/', 'update')->name('update');
                Route::delete('/', 'destroy')->name('destroy');
            });
        });
});
