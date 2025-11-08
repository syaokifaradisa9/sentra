<?php

use App\Http\Controllers\BusinessController;
use Illuminate\Support\Facades\Route;

Route::prefix('business')
    ->controller(BusinessController::class)
    ->as('business.')
    ->middleware('roles:Businessman')
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

