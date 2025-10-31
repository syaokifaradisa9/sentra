<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;

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

// Authenticated routes with auth prefix - using AuthController group
Route::prefix('auth')->middleware('auth')->controller(AuthController::class)->group(function () {
    // Profile routes
    Route::get('/profile', 'changeProfile')->name('profile');
    Route::put('/update-profile', 'updateProfile')->name('update-profile');
    
    // Password routes
    Route::get('/password', 'changePassword')->name('password');
    Route::put('/update-password', 'updatePassword')->name('update-password');
});
