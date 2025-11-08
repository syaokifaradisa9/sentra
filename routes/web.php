<?php

use Illuminate\Support\Facades\Route;

Route::redirect('/', '/auth/login');

require __DIR__.'/web/auth.php';

Route::middleware('auth')->group(function () {
    require __DIR__.'/web/dashboard.php';
    require __DIR__.'/web/branches.php';
    require __DIR__.'/web/business.php';
    require __DIR__.'/web/categories.php';
    require __DIR__.'/web/products.php';
    require __DIR__.'/web/promos.php';
    require __DIR__.'/web/employees.php';
});
