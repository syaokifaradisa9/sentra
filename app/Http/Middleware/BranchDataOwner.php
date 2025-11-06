<?php

namespace App\Http\Middleware;

use App\Models\Branch;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class BranchDataOwner
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $branchId = $request->route('branch');
        
        if (!$branchId) {
            return back()->with('error', 'Akses ditolak, data cabang tidak ditemukan!');
        }

        $branch = Branch::find($branchId);
        if (!$branch) {
            return back()->with('error', 'Akses ditolak, cabang tidak ditemukan!');
        }

        $user = Auth::user();
        if ($branch->owner_id != $user->id) {
            return back()->with('error', 'Akses ditolak, anda tidak diizinkan untuk mengunjungi data ini!');
        }

        return $next($request);
    }
}
