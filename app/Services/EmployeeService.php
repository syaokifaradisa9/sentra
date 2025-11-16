<?php

namespace App\Services;

use App\DataTransferObjects\EmployeeDTO;
use App\Models\User;
use App\Repositories\Branch\BranchRepository;
use App\Repositories\Business\BusinessRepository;
use App\Repositories\User\UserRepository;
use App\Repositories\UserBranch\UserBranchRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection as SupportCollection;
use Illuminate\Validation\ValidationException;

class EmployeeService
{
    public function __construct(
        private UserRepository $userRepository,
        private UserBranchRepository $userBranchRepository,
        private BranchRepository $branchRepository,
        private BusinessRepository $businessRepository,
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

    public function store(EmployeeDTO $dto, int $currentUserId): User
    {
        return DB::transaction(function () use ($dto, $currentUserId) {
            $branchId = $this->resolveBranchId($currentUserId, $dto);

            if (! $branchId) {
                throw ValidationException::withMessages([
                    'branch_id' => 'Cabang yang dipilih tidak valid.',
                ]);
            }

            $user = $this->userRepository->store($dto->toArrayWithPassword());

            $this->assignUserBranch($user->id, $branchId);

            return $user->load('branches');
        });
    }

    public function update(int $id, EmployeeDTO $dto, int $currentUserId): ?User
    {
        return DB::transaction(function () use ($id, $dto, $currentUserId) {
            $user = $this->userRepository->update($id, $dto->toArray());

            if (! $user) {
                return null;
            }

            if (!empty($dto->password)) {
                $this->userRepository->updatePassword($user, $dto->password);
            }

            $branchId = $this->resolveBranchId($currentUserId, $dto);

            if (! $branchId) {
                throw ValidationException::withMessages([
                    'branch_id' => 'Cabang yang dipilih tidak valid.',
                ]);
            }

            $this->assignUserBranch($id, $branchId);

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

    public function getBranchesForUser(int $userId, ?int $businessId = null): SupportCollection
    {
        $currentUser = $this->getCurrentUser($userId);

        if (! $currentUser) {
            return collect();
        }

        if ($currentUser->hasRole('Businessman')) {
            if ($businessId) {
                return $this->branchRepository
                    ->getByBusinessId($businessId)
                    ->values();
            }

            $businessIds = $this->businessRepository
                ->getByOwnerId($userId)
                ->pluck('id');

            if ($businessIds->isEmpty()) {
                return collect();
            }

            return $businessIds
                ->map(fn ($id) => $this->branchRepository->getByBusinessId($id))
                ->flatten(1)
                ->unique('id')
                ->values();
        }

        if ($currentUser->hasRole('BusinessOwner')) {
            return $this->branchRepository->getByOwnerId($userId)->values();
        }

        if ($currentUser->hasRole('SmallBusinessOwner')) {
            return $this->branchRepository->getByOwnerId($userId)->values();
        }

        return collect();
    }

    public function paginateForUser(array $filters, int $userId): LengthAwarePaginator
    {
        $query = $this->buildUserQueryForRole($userId);

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

        return $query
            ->with(['branches', 'roles'])
            ->orderBy($sortBy, $sortDirection)
            ->paginate($limit)
            ->withQueryString();
    }

    public function getForExport(array $filters, int $userId): Collection
    {
        $query = $this->buildUserQueryForRole($userId);

        $search = $filters['search'] ?? null;
        if ($search) {
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('position', 'like', "%{$search}%");
            });
        }

        return $query->with(['branches', 'roles'])->get();
    }

    private function assignUserBranch(int $userId, int $branchId): void
    {
        $this->userBranchRepository->assignBranch($userId, $branchId);
    }

    private function buildUserQueryForRole(int $userId): Builder
    {
        $currentUser = $this->getCurrentUser($userId);

        $query = User::query()->where('id', '!=', $userId);

        if (! $currentUser) {
            return $query->whereRaw('1 = 0');
        }

        if ($currentUser->hasRole('Businessman')) {
            return $query;
        }

        if ($currentUser->hasRole('BusinessOwner')) {
            return $query->whereHas('roles', function ($builder) {
                $builder->whereIn('name', ['Manager', 'Cashier', 'Admin']);
            });
        }

        if ($currentUser->hasRole('SmallBusinessOwner')) {
            return $query->whereHas('roles', function ($builder) {
                $builder->whereIn('name', ['Cashier', 'Admin']);
            });
        }

        return $query->whereRaw('1 = 0');
    }

    private function resolveBranchId(int $currentUserId, EmployeeDTO $dto): ?int
    {
        $currentUser = $this->getCurrentUser($currentUserId);

        if (! $currentUser) {
            return null;
        }

        if ($currentUser->hasRole('Businessman')) {
            if (! $dto->businessId || ! $dto->branchId) {
                return null;
            }

            $allowedBranchIds = $this->branchRepository
                ->getByBusinessId($dto->businessId)
                ->pluck('id')
                ->map(static fn ($id) => (int) $id)
                ->all();

            return in_array($dto->branchId, $allowedBranchIds, true)
                ? $dto->branchId
                : null;
        }

        if ($currentUser->hasRole('BusinessOwner')) {
            if (! $dto->branchId) {
                return null;
            }

            $allowedBranchIds = $this->branchRepository
                ->getByOwnerId($currentUserId)
                ->pluck('id')
                ->map(static fn ($id) => (int) $id)
                ->all();

            return in_array($dto->branchId, $allowedBranchIds, true)
                ? $dto->branchId
                : null;
        }

        if ($currentUser->hasRole('SmallBusinessOwner')) {
            $ownerBranchIds = $this->branchRepository
                ->getByOwnerId($currentUserId)
                ->pluck('id')
                ->map(static fn ($id) => (int) $id)
                ->values()
                ->all();

            return $ownerBranchIds[0] ?? null;
        }

        return null;
    }

    private function getCurrentUser(int $userId): ?User
    {
        $user = $this->userRepository->getById($userId);

        if (! $user) {
            return null;
        }

        $user->loadMissing('branches', 'roles');

        return $user;
    }
}
