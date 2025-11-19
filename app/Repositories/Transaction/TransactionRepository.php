<?php

namespace App\Repositories\Transaction;

use App\Models\Transaction;

interface TransactionRepository
{
    public function store(array $data): Transaction;

    public function countByPrefix(string $prefix): int;
}
