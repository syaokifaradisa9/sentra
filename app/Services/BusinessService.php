<?php

namespace App\Services;

use App\DataTransferObjects\BusinessDTO;
use App\Models\Business;
use App\Repositories\Business\BusinessRepository;
use Illuminate\Database\Eloquent\Collection;

class BusinessService
{
    public function __construct(
        private BusinessRepository $businessRepository,
    ) {}

    public function getByOwnerId(int $userId): Collection
    {
        return $this->businessRepository->getByOwnerId($userId);
    }

    public function store(BusinessDTO $businessDTO): Business
    {
        return $this->businessRepository->store($businessDTO->toArray());
    }

    public function update(int $id, BusinessDTO $businessDTO): ?Business
    {
        $business = $this->businessRepository->getById($id);

        if (! $business || $business->owner_id !== $businessDTO->userId) {
            return null;
        }

        return $this->businessRepository->update($id, $businessDTO->toArray());
    }

    public function delete(int $id, int $userId): bool
    {
        $business = $this->businessRepository->getById($id);

        if (! $business || $business->owner_id !== $userId) {
            return false;
        }

        return $this->businessRepository->delete($id);
    }
}
