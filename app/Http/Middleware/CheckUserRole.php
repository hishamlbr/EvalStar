<?php

// app/Http/Middleware/CheckUserRole.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;



class CheckUserRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $role
     * @return mixed
     */
    public function handle(Request $request, Closure $next, $role)
    {
        // Check if the user is authenticated and has the correct role
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        
        switch ($role) {
            case 'admin':
                if (!$user instanceof \App\Models\Admin) {
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
                break;
            case 'teacher':
                if (!$user instanceof \App\Models\Teacher) {
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
                break;
            case 'student':
                if (!$user instanceof \App\Models\Student) {
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
                break;
        }
        
        return $next($request);
    }
}