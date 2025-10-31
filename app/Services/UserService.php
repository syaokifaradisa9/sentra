<?php

namespace App\Services;

use App\DTO\UpdateUserDTO;
use App\Models\User;
use App\Repositories\User\UserRepository;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserService
{
    protected UserRepository $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function updatePassword(User $user, string $currentPassword, string $newPassword): User
    {
        if (!Hash::check($currentPassword, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password saat ini salah.'],
            ]);
        }

        return $this->userRepository->updatePassword($user, $newPassword);
    }

    public function update(int $userId, UpdateUserDTO $dto): User
    {
        return $this->userRepository->update($userId, $dto->toArray());
    }
}
