<?php

namespace App\Services;

use App\Repositories\Branch\BranchRepository;
use App\Models\Branch;
use App\DTOs\BranchDTO;

class BranchService
{
    private BranchRepository $branchRepository;

    public function __construct(BranchRepository $branchRepository)
    {
        $this->branchRepository = $branchRepository;
    }

    public function store(BranchDTO $branchDTO): Branch
    {
        return $this->branchRepository->store($branchDTO->toArray());
    }

    public function update(int $id, BranchDTO $branchDTO): ?Branch
    {
        return $this->branchRepository->update($id, $branchDTO->toArray());
    }

    public function delete(int $id): bool
    {
        return $this->branchRepository->delete($id);
    }

    public function getById(int $id): ?Branch
    {
        return $this->branchRepository->getById($id);
    }
    
    public function all()
    {
        return $this->branchRepository->all();
    }
}