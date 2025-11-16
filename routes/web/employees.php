<?php

use App\Http\Controllers\EmployeeController;
use App\Http\Middleware\EnsureEmployeeOwner;
use Illuminate\Support\Facades\Route;

Route::prefix('employees')
    ->controller(EmployeeController::class)
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
        Route::prefix('{employee}')
            ->middleware(EnsureEmployeeOwner::class)
            ->group(function () {
                Route::get('/edit', 'edit')->name('edit');
                Route::put('/', 'update')->name('update');
                Route::delete('/', 'destroy')->name('destroy');
            });
    });
