<?php

namespace App\Http\Middleware;

use App\Models\Business;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class BusinessDataOwner
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $businessId = $request->route('business');
        
        if (!$businessId) {
            return back()->with('error', 'Akses ditolak, data bisnis tidak ditemukan!');
        }

        $business = Business::find($businessId);
        
        if (!$business) {
            return back()->with('error', 'Akses ditolak, bisnis tidak ditemukan!');
        }

        $user = Auth::user();
        if ($business->owner_id != $user->id) {
            return back()->with('error', 'Akses ditolak, anda tidak diizinkan untuk mengakses data ini!');
        }

        return $next($request);
    }
}
