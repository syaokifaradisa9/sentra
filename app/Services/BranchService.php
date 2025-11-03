<?php

namespace App\Services;

use App\DataTransferObjects\BranchDTO;
use App\Models\Branch;
use App\Repositories\Branch\BranchRepository;
use App\Repositories\Business\BusinessRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

class BranchService
{
    public function __construct(
        private BranchRepository $branchRepository,
        private BusinessRepository $businessRepository,
    ) {}

    public function listForUser(int $userId): Collection
    {
        return $this->branchRepository
            ->getByUserId($userId)
            ->load('business');
    }

    public function getForUser(int $id, int $userId): ?Branch
    {
        $branch = $this->branchRepository->getById($id);

        if (! $branch || $branch->user_id !== $userId) {
            return null;
        }

        return $branch->load('business');
    }

    public function store(BranchDTO $branchDTO): Branch
    {
        $this->assertBusinessOwnership($branchDTO->businessId, $branchDTO->userId);

        $branch = $this->branchRepository->store($branchDTO->toArray());

        return $branch->load('business');
    }

    public function update(int $id, BranchDTO $branchDTO): ?Branch
    {
        $branch = $this->branchRepository->getById($id);

        if (! $branch || $branch->user_id !== $branchDTO->userId) {
            return null;
        }

        $this->assertBusinessOwnership($branchDTO->businessId, $branchDTO->userId);

        $updated = $this->branchRepository->update($id, $branchDTO->toArray());

        return $updated?->load('business');
    }

    public function delete(int $id, int $userId): bool
    {
        $branch = $this->branchRepository->getById($id);

        if (! $branch || $branch->user_id !== $userId) {
            return false;
        }

        return $this->branchRepository->delete($id);
    }

    public function getBusinessesForUser(int $userId): Collection
    {
        return $this->businessRepository->getByUserId($userId);
    }

    public function paginateForUser(array $filters, int $userId): LengthAwarePaginator
    {
        return $this->branchRepository->paginateForUser($filters, $userId);
    }

    public function getForExport(array $filters, int $userId): Collection
    {
        return $this->branchRepository->getForExport($filters, $userId);
    }

    private function assertBusinessOwnership(int $businessId, int $userId): void
    {
        if (! $this->businessRepository->existsForUser($businessId, $userId)) {
            throw ValidationException::withMessages([
                'business_id' => 'Bisnis tidak valid untuk pengguna ini.',
            ]);
        }
    }
}
