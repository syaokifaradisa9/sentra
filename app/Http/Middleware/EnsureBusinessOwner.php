<?php

namespace App\Http\Middleware;

use App\Models\Business;
use Closure;
use Illuminate\Http\Request;

class EnsureBusinessOwner
{
    /**
     * Ensure the authenticated user owns the provided business instance.
     *
     * @param  string  $parameter  Route parameter name that holds the Business model.
     */
    public function handle(Request $request, Closure $next, string $parameter = 'business')
    {
        /** @var \App\Models\User|null $user */
        $user = $request->user();
        $business = $request->route($parameter);

        if (! $user instanceof \App\Models\User || ! $business instanceof Business) {
            abort(403);
        }

        abort_unless((int) $business->owner_id === (int) $user->id, 403);

        return $next($request);
    }
}

