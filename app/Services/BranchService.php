<?php

namespace App\Services;

use App\Models\Branch;
use Illuminate\Support\Collection;
use App\DataTransferObjects\BranchDTO;
use App\Repositories\Branch\BranchRepository;
use App\Repositories\Business\BusinessRepository;

class BranchService
{
    public function __construct(
        private BranchRepository $branchRepository,
        private BusinessRepository $businessRepository,
    ) {}

    public function listForUser(int $userId): Collection
    {
        return $this->branchRepository
            ->getByOwnerId($userId)
            ->load('business');
    }

    public function getForUser(int $id, int $userId): ?Branch
    {
        $branch = $this->branchRepository->getById($id);

        if (! $branch || $branch->owner_id !== $userId) {
            return null;
        }

        return $branch->load('business');
    }

    public function store(BranchDTO $branchDTO): Branch
    {
        $branch = $this->branchRepository->store($branchDTO->toArray());

        return $branch->load('business');
    }

    public function update(int $id, BranchDTO $branchDTO): ?Branch
    {
        $branch = $this->branchRepository->getById($id);

        if (! $branch || $branch->owner_id !== $branchDTO->userId) {
            return null;
        }

        $updated = $this->branchRepository->update($id, $branchDTO->toArray());

        return $updated?->load('business');
    }

    public function delete(int $id, int $userId): bool
    {
        $branch = $this->branchRepository->getById($id);

        if (! $branch || $branch->owner_id !== $userId) {
            return false;
        }

        return $this->branchRepository->delete($id);
    }

    public function getBusinessesForUser(int $userId): Collection
    {
        return $this->businessRepository->getByOwnerId($userId);
    }
}
