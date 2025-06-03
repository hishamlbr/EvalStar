<?php

// app/Http/Controllers/API/LevelController.php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Level;

class LevelController extends Controller
{
    public function index()
    {
        $levels = Level::withCount('students')->get();
        return response()->json($levels);
    }

    public function show($id)
    {
        $level = Level::with(['groups', 'students'])->findOrFail($id);
        return response()->json($level);
    }
}
