<?php

namespace App\Repositories\ProductTransaction;

use App\Models\ProductTransaction;

class EloquentProductTransactionRepository implements ProductTransactionRepository
{
    public function __construct(private ProductTransaction $model) {}

    public function createMany(array $records): void
    {
        $this->model->newQuery()->insert($records);
    }
}
