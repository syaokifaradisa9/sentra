<?php

namespace App\Services;

use App\DataTransferObjects\BusinessDTO;
use App\Models\Business;
use App\Repositories\Business\BusinessRepository;
use Illuminate\Support\Facades\DB;

class BusinessService
{
    protected BusinessRepository $repository;

    public function __construct(BusinessRepository $repository)
    {
        $this->repository = $repository;
    }

    public function create(BusinessDTO $dto): Business
    {
        return $this->repository->store($dto->toArray());
    }

    public function update(int $id, BusinessDTO $dto): ?Business
    {
        return $this->repository->update($id, $dto->toArray());
    }

    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }

    public function findById(int $id): ?Business
    {
        return $this->repository->getById($id);
    }

    public function getAll()
    {
        return $this->repository->all();
    }
}