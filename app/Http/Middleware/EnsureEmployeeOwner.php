<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\BranchService;
use Closure;
use Illuminate\Http\Request;

class EnsureEmployeeOwner
{
    public function __construct(
        private BranchService $branchService,
    ) {}

    /**
     * Ensure the authenticated user can manage the targeted employee.
     *
     * @param  string  $parameter  Route parameter name that holds the employee model or id.
     */
    public function handle(Request $request, Closure $next, string $parameter = 'employee')
    {
        /** @var User|null $currentUser */
        $currentUser = $request->user();
        $employeeParameter = $request->route($parameter);

        if (! $currentUser instanceof User) {
            abort(403);
        }

        $employee = $employeeParameter instanceof User
            ? $employeeParameter
            : User::find($employeeParameter);

        if (! $employee) {
            abort(404);
        }

        $managedBranchIds = $this->branchService->getBranchIdsForUser($currentUser->id);
        abort_if(empty($managedBranchIds), 403);

        $employeeBranchIds = $this->branchService->getBranchIdsForUser($employee->id);

        $hasSharedBranch = ! empty(array_intersect($managedBranchIds, $employeeBranchIds));

        abort_unless($hasSharedBranch, 403);

        $request->route()->setParameter($parameter, $employee);

        return $next($request);
    }
}
