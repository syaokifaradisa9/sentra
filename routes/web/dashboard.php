<?php

use App\Http\Controllers\CashierController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
Route::get('/cashier', [CashierController::class, 'index'])->name('cashier');
Route::post('/cashier/store', [CashierController::class, 'store'])->name('cashier.store');
