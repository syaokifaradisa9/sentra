<?php

namespace App\Repositories\User;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserRepository
{
    protected User $model;

    public function __construct(User $user)
    {
        $this->model = $user;
    }

    public function update(int $userId, array $data): User
    {
        $user = $this->model->findOrFail($userId);
        $user->update($data);
        return $user->fresh();
    }

    public function updatePassword(User $user, string $newPassword): User
    {
        $user->password = Hash::make($newPassword);
        $user->save();
        return $user->fresh();
    }
}
