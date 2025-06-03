<?php

// app/Http/Controllers/API/AuthController.php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\Admin;
use App\Models\Teacher;
use App\Models\Student;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'user_type' => 'required|string|in:admin,teacher,student',
            'identifier' => 'required|string',
            'password' => 'required|string'
        ]);

        $userType = $request->user_type;
        $identifier = $request->identifier;
        $password = $request->password;
        $user = null;
        $identifierField = '';

        switch ($userType) {
            case 'admin':
                $identifierField = 'email';
                $user = Admin::where($identifierField, $identifier)->first();
                break;
            case 'teacher':
                $identifierField = 'n_appoge';
                $user = Teacher::where($identifierField, $identifier)->first();
                break;
            case 'student':
                $identifierField = 'cne';
                $user = Student::where($identifierField, $identifier)->first();
                break;
        }

        if (!$user || !Hash::check($password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user_type' => $userType,
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer'
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }
}
