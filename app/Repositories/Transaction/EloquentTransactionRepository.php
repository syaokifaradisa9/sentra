<?php

namespace App\Repositories\Transaction;

use App\Models\Transaction;

class EloquentTransactionRepository implements TransactionRepository
{
    public function __construct(private Transaction $model) {}

    public function store(array $data): Transaction
    {
        return $this->model->create($data);
    }

    public function countByPrefix(string $prefix): int
    {
        return $this->model
            ->where('transaction_number', 'like', "{$prefix}%")
            ->count();
    }
}
