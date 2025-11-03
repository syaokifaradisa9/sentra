<?php

namespace App\Http\Controllers;

use App\DataTransferObjects\UpdateUserDTO;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\UpdatePasswordRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Services\AuthService;
use App\Services\UserService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuthController extends Controller
{
    private $loggedUser;
    public function __construct(
        protected UserService $userService,
        protected AuthService $authService
    ){
        $this->loggedUser = Auth::user();
    }

    public function login()
    {
        return Inertia::render('auth/Login');
    }

    public function verify(LoginRequest $request)
    {
        $credentials = $request->only('email', 'password');

        $this->authService->verify($credentials);

        return to_route('dashboard');
    }

    public function changeProfile()
    {
        return Inertia::render('auth/ChangeProfile', [
            'user' => $this->loggedUser
        ]);
    }

    public function updateProfile(UpdateProfileRequest $request)
    {
        $this->userService->update(
            $this->loggedUser->id,
            UpdateUserDTO::fromAppRequest($request)
        );

        return back()->with('success', 'Sukses mengupdate profil');
    }

    public function changePassword()
    {
        return Inertia::render('auth/ChangePassword');
    }

    public function updatePassword(UpdatePasswordRequest $request)
    {
        $this->userService->updatePassword(
            $this->loggedUser,
            $request->current_password,
            $request->new_password
        );

        return to_route("password")->with('success', 'Password berhasil diperbarui');
    }

    public function logout()
    {
        auth()->logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();

        return redirect('/auth/login');
    }
}
