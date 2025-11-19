<?php

namespace App\Repositories\ProductTransaction;

interface ProductTransactionRepository
{
    public function createMany(array $records): void;
}
