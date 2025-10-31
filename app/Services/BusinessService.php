<?php

namespace App\Services;

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
    }

    public function delete(int $id): bool
    {
        return $this->businessRepository->delete($id);
    }

    public function getById(int $id): ?Business
    {
        return $this->businessRepository->getById($id);
    }
    
    public function all()
    {
        return $this->businessRepository->all();
    }
}