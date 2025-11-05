<?php

namespace App\Services;

use App\DataTransferObjects\EmployeeDTO;
use App\Models\User;
use App\Repositories\Branch\BranchRepository;
use App\Repositories\User\UserRepository;
use App\Repositories\UserBranch\UserBranchRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class EmployeeService
{
    public function __construct(
        private UserRepository $userRepository,
        private UserBranchRepository $userBranchRepository,
        private BranchRepository $branchRepository,
    ) {}

    public function all(): Collection
    {
        return $this->userRepository->all()->load('branches');
    }

    public function getById(int $id): ?User
    {
        $user = $this->userRepository->getById($id);

        return $user?->load('branches');
    }

    public function getByEmail(string $email): ?User
    {
        return $this->userRepository->all()
            ->where('email', $email)
            ->first();
    }

    public function store(EmployeeDTO $dto): User
    {
        return DB::transaction(function () use ($dto) {
            $user = $this->userRepository->store($dto->toArrayWithPassword());

            $this->syncUserBranches($user->id, $dto->branchIds);

            return $user->load('branches');
        });
    }

    public function update(int $id, EmployeeDTO $dto): ?User
    {
        return DB::transaction(function () use ($id, $dto) {
            $user = $this->userRepository->update($id, $dto->toArray());

            if (! $user) {
                return null;
            }

            if (!empty($dto->password)) {
                $this->userRepository->updatePassword($user, $dto->password);
            }

            $this->syncUserBranches($id, $dto->branchIds);

            return $user->load('branches');
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $this->userBranchRepository->deleteByUserId($id);

            return $this->userRepository->delete($id);
        });
    }

    public function getBranchesForUser(int $userId): Collection
    {
        return $this->branchRepository->getByUserId($userId);
    }

    public function paginateForUser(array $filters, int $userId): LengthAwarePaginator
    {
        $branchIds = $this->branchRepository
            ->getByUserId($userId)
            ->pluck('id')
            ->toArray();

        $query = $this->userRepository->all()->newQuery();

        $search = $filters['search'] ?? null;
        if ($search) {
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('position', 'like', "%{$search}%");
            });
        }

        $allowedSortColumns = [
            'name',
            'email',
            'phone',
            'position',
            'created_at',
            'updated_at',
        ];

        $sortBy = $filters['sort_by'] ?? 'created_at';
        if (! in_array($sortBy, $allowedSortColumns, true)) {
            $sortBy = 'created_at';
        }

        $sortDirection = strtolower($filters['sort_direction'] ?? 'desc');
        $sortDirection = $sortDirection === 'asc' ? 'asc' : 'desc';

        $limit = (int) ($filters['limit'] ?? 20);
        $limit = $limit > 0 ? $limit : 20;

        return $query->orderBy($sortBy, $sortDirection)
            ->paginate($limit)
            ->withQueryString();
    }

    public function getForExport(array $filters, int $userId): Collection
    {
        $branchIds = $this->branchRepository
            ->getByUserId($userId)
            ->pluck('id')
            ->toArray();

        $query = $this->userRepository->all()->newQuery();

        $search = $filters['search'] ?? null;
        if ($search) {
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('position', 'like', "%{$search}%");
            });
        }

        return $query->get();
    }

    private function syncUserBranches(int $userId, array $branchIds): void
    {
        $branchIds = array_unique(array_map('intval', $branchIds));

        $this->userBranchRepository->deleteByUserId($userId);

        if (empty($branchIds)) {
            return;
        }

        $timestamp = now();
        $payload = array_map(static function (int $branchId) use ($userId, $timestamp) {
            return [
                'user_id' => $userId,
                'branch_id' => $branchId,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ];
        }, $branchIds);

        $this->userBranchRepository->batchInsert($payload);
    }
}