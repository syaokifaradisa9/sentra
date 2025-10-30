<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

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

// Dashboard route - requires authentication
Route::get('/dashboard', function () {
    return inertia('Dashboard');
})->name('dashboard')->middleware('auth');
