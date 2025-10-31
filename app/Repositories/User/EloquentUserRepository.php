<?php

namespace App\Repositories\User;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Collection;

class EloquentUserRepository implements UserRepository
{
    protected User $model;

    public function __construct(User $user)
    {
        $this->model = $user;
    }

    public function getById(int $id): ?User
    {
        return $this->model->find($id);
    }

    public function store(array $data): User
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data): ?User
    {
        $user = $this->model->find($id);
        if ($user) {
            $user->update($data);
            return $user->fresh();
        }
        return null;
    }

    public function delete(int $id): bool
    {
        $user = $this->model->find($id);
        if ($user) {
            return $user->delete();
        }
        return false;
    }

    public function all(): Collection
    {
        return $this->model->all();
    }

    public function updatePassword(User $user, string $newPassword): User
    {
        $user->password = Hash::make($newPassword);
        $user->save();
        return $user->fresh();
    }
}