<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\BranchController;

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
    Route::get('/create', [BranchController::class, 'create'])->name('branches.create');
    Route::post('/', [BranchController::class, 'store'])->name('branches.store');
    Route::get('/{branch}/edit', [BranchController::class, 'edit'])->name('branches.edit');
    Route::put('/{branch}', [BranchController::class, 'update'])->name('branches.update');
    Route::delete('/{branch}', [BranchController::class, 'destroy'])->name('branches.destroy');
    // Show route (for viewing details)
    Route::get('/{branch}', [BranchController::class, 'show'])->name('branches.show');
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
    Route::get('/', [App\Http\Controllers\BusinessController::class, 'index'])->name('business.index');
    Route::get('/create', [App\Http\Controllers\BusinessController::class, 'create'])->name('business.create');
    Route::post('/store', [App\Http\Controllers\BusinessController::class, 'store'])->name('business.store');
    Route::get('/{business}/edit', [App\Http\Controllers\BusinessController::class, 'edit'])->name('business.edit');
    Route::put('/{business}/update', [App\Http\Controllers\BusinessController::class, 'update'])->name('business.update');
    Route::delete('/{business}/delete', [App\Http\Controllers\BusinessController::class, 'destroy'])->name('business.delete');
    Route::get('/datatable', [App\Http\Controllers\BusinessController::class, 'datatable'])->name('business.datatable');
    Route::get('/print/pdf', [App\Http\Controllers\BusinessController::class, 'printPdf'])->name('business.print.pdf');
    Route::get('/print/excel', [App\Http\Controllers\BusinessController::class, 'printExcel'])->name('business.print.excel');
});
