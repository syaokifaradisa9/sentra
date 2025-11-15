<?php

namespace App\Http\Middleware;

use App\Models\Business;
use App\Models\User;
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
        /** @var User|null $user */
        $user = $request->user();
        $businessParameter = $request->route($parameter);

        if (! $user instanceof User) {
            abort(403);
        }

        $business = $businessParameter instanceof Business
            ? $businessParameter
            : Business::find($businessParameter);

        if (! $business) {
            abort(404);
        }

        abort_unless((int) $business->owner_id === (int) $user->id, 403);

        // Ensure downstream uses the model instance.
        $request->route()->setParameter($parameter, $business);

        return $next($request);
    }
}
