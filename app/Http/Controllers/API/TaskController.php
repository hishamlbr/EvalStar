<?php

// app/Http/Controllers/API/TaskController.php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\Question;
use App\Models\Answer;

class TaskController extends Controller
{
    public function index()
    {
        $tasks = Task::with(['teacher', 'groups.level'])->get();
        return response()->json($tasks);
    }

    public function show($id)
    {
        $task = Task::with(['teacher', 'groups.level', 'questions.answers'])->findOrFail($id);
        return response()->json($task);
    }

    public function getQuestions($id)
    {
        $questions = Question::with('answers')
            ->where('task_id', $id)
            ->get();
            
        return response()->json($questions);
    }
}
