<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\TeacherController;
use App\Http\Controllers\API\StudentController;
use App\Http\Controllers\API\LevelController;
use App\Http\Controllers\API\GroupController;
use App\Http\Controllers\API\SubjectController;
use App\Http\Controllers\API\TaskController;
use App\Http\Controllers\API\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Authentication Routes
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

// Admin Routes
Route::prefix('admin')->middleware('auth:sanctum,admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'getDashboardStats']);
    
    // Teacher management
    Route::post('/teachers', [AdminController::class, 'addTeacher']);
    Route::put('/teachers/{id}', [AdminController::class, 'updateTeacher']);
    Route::delete('/teachers/{id}', [AdminController::class, 'deleteTeacher']);
    
    // Student management
    Route::post('/students', [AdminController::class, 'addStudent']);
    Route::put('/students/{id}', [AdminController::class, 'updateStudent']);
    Route::delete('/students/{id}', [AdminController::class, 'deleteStudent']);
    
    // Level management
    Route::post('/levels', [AdminController::class, 'addLevel']);
    Route::put('/levels/{id}', [AdminController::class, 'updateLevel']);
    Route::delete('/levels/{id}', [AdminController::class, 'deleteLevel']);
    Route::get('/levels', [AdminController::class, 'getLevels']);
    Route::get('/levels/{id}', [AdminController::class, 'getLevel']);
    
    // Group management
    Route::get('/groups', [AdminController::class, 'getGroups']);
    Route::get('/groups/{id}', [AdminController::class, 'getGroup']);
    Route::post('/groups', [AdminController::class, 'addGroup']);
    Route::put('/groups/{id}', [AdminController::class, 'updateGroup']);
    Route::delete('/groups/{id}', [AdminController::class, 'deleteGroup']);
    
    // Subject management
    Route::post('/subjects', [AdminController::class, 'addSubject']);
    Route::put('/subjects/{id}', [AdminController::class, 'updateSubject']);
    Route::delete('/subjects/{id}', [AdminController::class, 'deleteSubject']);
    
    // Admin management
    Route::get('/admins', [AdminController::class, 'index']);
    Route::post('/admins', [AdminController::class, 'store']);
    Route::get('/admins/{id}', [AdminController::class, 'show']);
    Route::put('/admins/{id}', [AdminController::class, 'update']);
    Route::delete('/admins/{id}', [AdminController::class, 'destroy']);
});

// Teacher Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/teachers/{id}', [TeacherController::class, 'show']);
    Route::put('/teachers/{id}', [TeacherController::class, 'update']);
    Route::get('/teachers/{id}/groups', [TeacherController::class, 'getGroups']);
    
    // Task management
    Route::post('/teachers/tasks', [TeacherController::class, 'createTask']);
    Route::get('/teachers/{id}/tasks', [TeacherController::class, 'getTasks']);
    Route::put('/teachers/{id}/tasks/{taskId}', [TeacherController::class, 'updateTask']);
    Route::delete('/teachers/{id}/tasks/{taskId}', [TeacherController::class, 'deleteTask']);
    
    // Question management
    Route::put('/teachers/{id}/tasks/{taskId}/questions/{questionId}', [TeacherController::class, 'updateQuestion']);
    
    Route::get('/teachers/{id}/groups/{gid}/students', [TeacherController::class, 'getStudentsByGroup']);
    Route::get('/teachers/{id}/tasks/{taskId}', [TeacherController::class, 'getTaskDetails']);
    Route::get('/teachers/{id}/dashboard', [TeacherController::class, 'getDashboardStats']);
});

// Student Routes
Route::middleware('auth:sanctum')->group(function () {
    // Standard student routes
    Route::get('/students/me', [StudentController::class, 'show']);
    Route::put('/students/me', [StudentController::class, 'updateProfile']);
    Route::get('/students/me/tasks/{taskId}', [StudentController::class, 'getTaskDetailsMe']);
    Route::get('/students/{id}', [StudentController::class, 'show']);
    Route::get('/students/{id}/tasks', [StudentController::class, 'getTasks']);
    Route::get('/students/{id}/tasks/{taskId}', [StudentController::class, 'getTaskDetails']);
    Route::get('/students/{id}/ranking', [StudentController::class, 'getClassRanking']);
    Route::get('/students/{id}/dashboard', [StudentController::class, 'getDashboardStats']);
    
    // "Me" routes for current student
    Route::get('/students/me/tasks', [StudentController::class, 'getAvailableTasks']);
    Route::post('/students/me/tasks/{taskId}/submit', [StudentController::class, 'submitTaskAnswers']);
    Route::get('/students/me/ranking', [StudentController::class, 'getClassRanking']);
    Route::get('/students/me/dashboard', [StudentController::class, 'getDashboardStats']);
});

// Common Routes (accessible by authenticated users)
Route::middleware('auth:sanctum')->group(function () {
    // Students resource
    Route::get('/students', [StudentController::class, 'index']);
    Route::get('/teachers', [TeacherController::class, 'index']);
    
    // Levels resource
    Route::get('/levels', [LevelController::class, 'index']);
    Route::get('/levels/{id}', [LevelController::class, 'show']);
    Route::get('/levels/{levelId}/groups', [GroupController::class, 'getByLevel']);
    
    // Groups resource
    Route::get('/groups', [GroupController::class, 'index']);
    Route::get('/groups/{id}', [GroupController::class, 'show']);
    
    // Subjects resource
    Route::get('/subjects', [SubjectController::class, 'index']);
    Route::get('/subjects/{id}', [SubjectController::class, 'show']);
    
    // Tasks resource
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::get('/tasks/{id}', [TaskController::class, 'show']);
    Route::get('/tasks/{id}/questions', [TaskController::class, 'getQuestions']);
});