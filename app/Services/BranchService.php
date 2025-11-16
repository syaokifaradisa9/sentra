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

    public function store(BranchDTO $branchDTO): Branch
    {
        $branch = $this->branchRepository->store($branchDTO->toArray());
        return $branch->load('business');
    }

    public function update(int $id, BranchDTO $branchDTO): ?Branch
    {
        $updated = $this->branchRepository->update($id, $branchDTO->toArray());
        return $updated?->load('business');
    }

    public function delete(int $id): bool
    {
        return $this->branchRepository->delete($id);
    }

    public function getAllBranches(): Collection
    {
        return $this->branchRepository->all();
    }

    public function getById(int $id): ?Branch
    {
        return $this->branchRepository->getById($id);
    }

    public function getOptionsDataByOwnerId(int $userId): array
    {
        $branches = $this->branchRepository->getByOwnerId($userId);

        return $branches->map(function ($branch) {
            return [
                'id' => $branch->id,
                'name' => $branch->name,
            ];
        })->toArray();
    }

    public function getOptionsDataByUserId(int $userId): array
    {
        $branches = $this->branchRepository->getByUserId($userId);

        return $branches->map(function ($branch) {
            return [
                'id' => $branch->id,
                'name' => $branch->name,
            ];
        })->toArray();
    }

    public function getBranchIdsForUser(int $userId): array
    {
        $branches = $this->branchRepository->getByUserId($userId);

        if ($branches->isEmpty()) {
            $branches = $this->branchRepository->getByOwnerId($userId);
        }

        return $branches->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();
    }
}
