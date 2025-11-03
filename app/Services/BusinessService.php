<?php

namespace App\Services;

use App\DataTransferObjects\BusinessDTO;
use App\Models\Business;
use App\Repositories\Business\BusinessRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class BusinessService
{
    public function __construct(
        private BusinessRepository $businessRepository,
    ) {}

    public function listForUser(int $userId): Collection
    {
        return $this->businessRepository->getByUserId($userId);
    }

    public function paginateForUser(array $filters, int $userId): LengthAwarePaginator
    {
        return $this->businessRepository->paginateForUser($filters, $userId);
    }

    public function getForUser(int $id, int $userId): ?Business
    {
        $business = $this->businessRepository->getById($id);

        if (! $business || $business->user_id !== $userId) {
            return null;
        }

        return $business;
    }

    public function store(BusinessDTO $businessDTO): Business
    {
        return $this->businessRepository->store($businessDTO->toArray());
    }

    public function update(int $id, BusinessDTO $businessDTO): ?Business
    {
        $business = $this->businessRepository->getById($id);

        if (! $business || $business->user_id !== $businessDTO->userId) {
            return null;
        }

        return $this->businessRepository->update($id, $businessDTO->toArray());
    }

    public function delete(int $id, int $userId): bool
    {
        $business = $this->businessRepository->getById($id);

        if (! $business || $business->user_id !== $userId) {
            return false;
        }

        return $this->businessRepository->delete($id);
    }
}

