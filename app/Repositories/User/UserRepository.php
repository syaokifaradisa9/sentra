<?php

namespace App\Repositories\User;

use App\Models\User;
use Illuminate\Support\Collection;

interface UserRepository
{
    public function getById(int $id): ?User;
    public function store(array $data): User;
    public function update(int $id, array $data): ?User;
    public function delete(int $id): bool;
    public function all(): Collection;
    public function updatePassword(User $user, string $newPassword): User;
}