<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\BusinessController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;

// Redirect root to login
Route::redirect("/", "/auth/login");

// Login route - redirect authenticated users away from login
Route::get('/auth/login', [AuthController::class, 'login'])->name('login')->middleware('guest');
Route::post('/auth/verify', [AuthController::class, 'verify'])->name('auth.verify');

// Logout route
Route::post('/logout', function () {
    auth()->logout();
    request()->session()->invalidate();
    request()->session()->regenerateToken();
    
    return redirect('/auth/login');
})->name('logout');

// Dashboard route
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard')->middleware('auth');

// Branch routes
Route::prefix('branches')->middleware('auth')->group(function () {
    Route::get('/', [BranchController::class, 'index'])->name('branches.index');
    Route::get('/datatable', [BranchController::class, 'datatable'])->name('branches.datatable');
    Route::get('/create', [BranchController::class, 'create'])->name('branches.create');
    Route::post('/', [BranchController::class, 'store'])->name('branches.store');
    Route::get('/{branch}/edit', [BranchController::class, 'edit'])->name('branches.edit');
    Route::put('/{branch}', [BranchController::class, 'update'])->name('branches.update');
    Route::delete('/{branch}', [BranchController::class, 'destroy'])->name('branches.destroy');
});

// Authenticated routes with auth prefix - using AuthController group
Route::prefix('auth')->middleware('auth')->controller(AuthController::class)->group(function () {
    // Profile routes
    Route::get('/profile', 'changeProfile')->name('profile');
    Route::put('/update-profile', 'updateProfile')->name('update-profile');
    
    // Password routes
    Route::get('/password', 'changePassword')->name('password');
    Route::put('/update-password', 'updatePassword')->name('update-password');
});

// Business routes
Route::prefix('business')->middleware('auth')->group(function () {
    Route::get('/', [BusinessController::class, 'index'])->name('business.index');
    Route::get('/create', [BusinessController::class, 'create'])->name('business.create');
    Route::post('/store', [BusinessController::class, 'store'])->name('business.store');
    Route::get('/{business}/edit', [BusinessController::class, 'edit'])->name('business.edit');
    Route::put('/{business}/update', [BusinessController::class, 'update'])->name('business.update');
    Route::delete('/{business}/delete', [BusinessController::class, 'destroy'])->name('business.delete');
    Route::get('/datatable', [BusinessController::class, 'datatable'])->name('business.datatable');
    Route::get('/print/pdf', [BusinessController::class, 'printPdf'])->name('business.print.pdf');
    Route::get('/print/excel', [BusinessController::class, 'printExcel'])->name('business.print.excel');
});

// Category routes
Route::prefix('categories')->middleware('auth')->group(function () {
    Route::get('/', [CategoryController::class, 'index'])->name('categories.index');
    Route::get('/datatable', [CategoryController::class, 'datatable'])->name('categories.datatable');
    Route::get('/create', [CategoryController::class, 'create'])->name('categories.create');
    Route::post('/', [CategoryController::class, 'store'])->name('categories.store');
    Route::get('/{category}/edit', [CategoryController::class, 'edit'])->name('categories.edit');
    Route::put('/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
});

// Product routes
Route::prefix('products')->middleware('auth')->group(function () {
    Route::get('/', [ProductController::class, 'index'])->name('products.index');
    Route::get('/datatable', [ProductController::class, 'datatable'])->name('products.datatable');
    Route::get('/create', [ProductController::class, 'create'])->name('products.create');
    Route::post('/', [ProductController::class, 'store'])->name('products.store');
    Route::get('/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
    Route::post('/{product}/update', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
});
