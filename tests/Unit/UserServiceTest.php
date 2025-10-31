<?php

namespace Tests\Unit;

use App\Models\User;
use App\Repositories\User\UserRepository;
use App\Services\UserService;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserServiceTest extends TestCase
{
    public function test_update_password_successfully(): void
    {
        $originalUser = User::factory()->create([
            'password' => Hash::make('old_password'),
        ]);

        // Get fresh copy for comparison after update
        $user = User::find($originalUser->id);

        $userRepository = new UserRepository(new User());
        $userService = new UserService($userRepository);

        $result = $userService->updatePassword($user, 'old_password', 'new_password_123');

        $this->assertTrue(Hash::check('new_password_123', $result->password));
        $this->assertNotEquals($originalUser->password, $result->password);
    }

    public function test_update_password_fails_with_wrong_current_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('old_password'),
        ]);

        $userRepository = new UserRepository(new User());
        $userService = new UserService($userRepository);

        $this->expectException(\Illuminate\Validation\ValidationException::class);

        $userService->updatePassword($user, 'wrong_password', 'new_password_123');
    }

    public function test_update_profile_successfully(): void
    {
        $user = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'john' . uniqid() . '@example.com',
        ]);

        $userRepository = new UserRepository(new User());
        $userService = new UserService($userRepository);

        $updatedData = [
            'name' => 'Jane Doe',
            'email' => 'jane' . uniqid() . '@example.com',
        ];

        $result = $userService->updateProfile($user, $updatedData);

        $this->assertEquals('Jane Doe', $result->name);
        $this->assertEquals($updatedData['email'], $result->email);
    }
}