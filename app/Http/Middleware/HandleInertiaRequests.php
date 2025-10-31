<?php

namespace App\Http\Middleware;

use Inertia\Middleware;
use Illuminate\Http\Request;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Auth;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $loggedUser = Auth::user();
        $roles = [];
        if($loggedUser){
            $roles = $loggedUser->getRoleNames();
        }

        $successMessage = $request->session()->pull('success');
        $errorMessage = $request->session()->pull('error');

        return array_merge(parent::share($request), [
            'csrf_token' => csrf_token(),
            'loggeduser' => $loggedUser,
            'loggedrole' => $roles,
            'flash' => [
                'message' => $successMessage ?? $errorMessage ?? null,
                'type' => $successMessage ? 'success' : ($errorMessage ? 'error' : null),
            ]
        ]);
    }
}
