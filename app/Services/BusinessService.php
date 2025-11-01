<?php

namespace App\Services;

<<<<<<< HEAD
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
=======
use App\Repositories\Business\BusinessRepository;
use App\Models\Business;
use App\DataTransferObjects\BusinessDTO;

class BusinessService
{
    private BusinessRepository $businessRepository;

    public function __construct(BusinessRepository $businessRepository)
    {
        $this->businessRepository = $businessRepository;
    }

    public function store(BusinessDTO $businessDTO): Business
    {
        return $this->businessRepository->store($businessDTO->toArray());
    }

    public function update(int $id, BusinessDTO $businessDTO): ?Business
    {
        return $this->businessRepository->update($id, $businessDTO->toArray());
>>>>>>> a0348dfc2fe0e882570c33f61e458ee154579607
    }

    public function delete(int $id): bool
    {
<<<<<<< HEAD
        return $this->repository->delete($id);
    }

    public function findById(int $id): ?Business
    {
        return $this->repository->getById($id);
    }

    public function getAll()
    {
        return $this->repository->all();
=======
        return $this->businessRepository->delete($id);
    }

    public function getById(int $id): ?Business
    {
        return $this->businessRepository->getById($id);
    }
    
    public function all()
    {
        return $this->businessRepository->all();
>>>>>>> a0348dfc2fe0e882570c33f61e458ee154579607
    }
}