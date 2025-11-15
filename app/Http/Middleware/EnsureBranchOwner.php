<?php

namespace App\Http\Middleware;

use App\Models\Branch;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;

class EnsureBranchOwner
{
    /**
     * Ensure the authenticated user owns the provided branch instance.
     *
     * @param  string  $parameter  Route parameter name that holds the Branch model.
     */
    public function handle(Request $request, Closure $next, string $parameter = 'branch')
    {
        /** @var User|null $user */
        $user = $request->user();
        $branchParameter = $request->route($parameter);

        if (! $user instanceof User) {
            abort(403);
        }

        $branch = $branchParameter instanceof Branch
            ? $branchParameter
            : Branch::find($branchParameter);

        if (! $branch) {
            abort(404);
        }

        abort_unless((int) $branch->owner_id === (int) $user->id, 403);

        // Ensure downstream uses the model instance.
        $request->route()->setParameter($parameter, $branch);

        return $next($request);
    }
}

