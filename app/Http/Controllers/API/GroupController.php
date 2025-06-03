<?php

// app/Http/Controllers/API/GroupController.php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Group;

class GroupController extends Controller
{
    public function index()
    {
        $groups = Group::with('level')->get();
        return response()->json($groups);
    }

    public function show($id)
    {
        $group = Group::with(['level', 'students', 'teachers'])->findOrFail($id);
        return response()->json($group);
    }
    
    public function getByLevel($levelId)
    {
        $groups = Group::where('level_id', $levelId)->get();
        return response()->json($groups);
    }
}
