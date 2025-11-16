<?php

use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

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
        Route::middleware('roles:Businessman,BusinessOwner')->group(function () {
            Route::get('/create', 'create')->name('create');
            Route::post('/', 'store')->name('store');
            Route::prefix('{product}')->group(function () {
                Route::get('/edit', 'edit')->name('edit');
                Route::post('/', 'update')->name('update');
                Route::delete('/', 'destroy')->name('destroy');
            });
        });
    });
