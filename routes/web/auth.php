<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

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

