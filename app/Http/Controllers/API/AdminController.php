<?php

// app/Http/Controllers/API/AdminController.php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use App\Models\Admin;
use App\Models\Teacher;
use App\Models\Student;
use App\Models\Task;
use App\Models\Level;
use App\Models\Group;
use App\Models\Subject;
use App\Models\TeacherGroup;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function index()
    {
        $admins = Admin::all();
        return response()->json($admins);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|unique:admins',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        $admin = Admin::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'admin' => $admin,
            'message' => 'Administrateur créé avec succès'
        ], 201);
    }

    public function show($id)
    {
        $admin = Admin::findOrFail($id);
        return response()->json($admin);
    }

    public function update(Request $request, $id)
    {
        $admin = Admin::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|unique:admins,email,'.$id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        $admin->update($request->only(['first_name', 'last_name', 'email']));

        if ($request->filled('password')) {
            $admin->password = Hash::make($request->password);
            $admin->save();
        }

        return response()->json([
            'admin' => $admin,
            'message' => 'Administrateur mis à jour avec succès'
        ]);
    }

    public function destroy($id)
    {
        $admin = Admin::findOrFail($id);
        $admin->delete();

        return response()->json([
            'message' => 'Administrateur supprimé avec succès'
        ], 200);
    }

    // Teacher Management Methods
    public function addTeacher(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'n_appoge' => 'required|string|max:50|unique:teachers',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'subject_id' => 'required|exists:subjects,id',
            'groups' => 'required|array',
            'groups.*' => 'exists:groups,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        // Generate random password
        $password = Str::random(8);
        
        $teacher = Teacher::create([
            'n_appoge' => $request->n_appoge,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'password' => Hash::make($password),
            'subject_id' => $request->subject_id,
        ]);

        // Assign groups to the teacher
        foreach ($request->groups as $groupId) {
            TeacherGroup::create([
                'teacher_id' => $teacher->id,
                'group_id' => $groupId,
            ]);
        }

        return response()->json([
            'teacher' => $teacher->load(['subject', 'groups']),
            'password' => $password,
            'message' => 'Enseignant créé avec succès'
        ], 201);
    }

    public function updateTeacher(Request $request, $id)
    {
        $teacher = Teacher::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'n_appoge' => 'required|string|max:50|unique:teachers,n_appoge,'.$id,
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'subject_id' => 'required|exists:subjects,id',
            'groups' => 'sometimes|array',
            'groups.*' => 'exists:groups,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $teacher->update([
            'n_appoge' => $request->n_appoge,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'subject_id' => $request->subject_id,
        ]);
        
        if ($request->filled('password')) {
            $teacher->password = Hash::make($request->password);
            $teacher->save();
        }
        
        // Update teacher groups if provided
        if ($request->has('groups')) {
            // Remove current groups
            TeacherGroup::where('teacher_id', $teacher->id)->delete();
            
            // Add new groups
            foreach ($request->groups as $groupId) {
                TeacherGroup::create([
                    'teacher_id' => $teacher->id,
                    'group_id' => $groupId,
                ]);
            }
        }
        
        return response()->json([
            'teacher' => $teacher->load(['subject', 'groups']),
            'message' => 'Enseignant mis à jour avec succès'
        ]);
    }
    
    public function deleteTeacher($id)
    {
        $teacher = Teacher::findOrFail($id);
        
        // Begin a database transaction
        DB::beginTransaction();
        
        try {
            // Delete all tasks created by this teacher
            Task::where('teacher_id', $id)->delete();
            
            // Delete teacher-group relationships
            TeacherGroup::where('teacher_id', $id)->delete();
            
            // Delete the teacher
            $teacher->delete();
            
            // Commit the transaction
            DB::commit();
            
            return response()->json([
                'message' => 'Enseignant et toutes ses évaluations supprimés avec succès'
            ]);
        } catch (\Exception $e) {
            // Something went wrong, rollback the transaction
            DB::rollBack();
            
            return response()->json([
                'message' => 'Erreur lors de la suppression: ' . $e->getMessage()
            ], 500);
        }
    }

    // Student Management Methods
    public function addStudent(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cne' => 'required|string|max:50|unique:students',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'level_id' => 'required|exists:levels,id',
            'group_id' => 'required|exists:groups,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        // Generate random password
        $password = Str::random(8);
        
        $student = Student::create([
            'cne' => $request->cne,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'password' => Hash::make($password),
            'level_id' => $request->level_id,
            'group_id' => $request->group_id,
            'total_stars' => 0,
        ]);

        return response()->json([
            'student' => $student->load(['level', 'group']),
            'password' => $password,
            'message' => 'Étudiant créé avec succès'
        ], 201);
    }
    
    public function updateStudent(Request $request, $id)
    {
        $student = Student::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'cne' => 'required|string|max:50|unique:students,cne,'.$id,
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'level_id' => 'required|exists:levels,id',
            'group_id' => 'required|exists:groups,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $student->update([
            'cne' => $request->cne,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'level_id' => $request->level_id,
            'group_id' => $request->group_id,
        ]);
        
        if ($request->filled('password')) {
            $student->password = Hash::make($request->password);
            $student->save();
        }
        
        return response()->json([
            'student' => $student->load(['level', 'group']),
            'message' => 'Étudiant mis à jour avec succès'
        ]);
    }
    
    public function deleteStudent($id)
    {
        $student = Student::findOrFail($id);
        
        DB::beginTransaction();
        
        try {
            // Delete student's tasks and answers first
            $student->studentTasks()->delete();
            $student->studentAnswers()->delete();
            
            $student->delete();
            
            DB::commit();
            
            return response()->json([
                'message' => 'Étudiant supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Erreur lors de la suppression: ' . $e->getMessage()
            ], 500);
        }
    }

    // ENHANCED LEVEL MANAGEMENT METHODS
    public function addLevel(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:50|unique:levels',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $level = Level::create([
            'name' => $request->name,
        ]);

        return response()->json([
            'level' => $level,
            'message' => 'Niveau créé avec succès'
        ], 201);
    }

    public function getLevels()
    {
        try {
            $levels = Level::withCount(['students', 'groups'])->get();
            
            return response()->json($levels);
        } catch (\Exception $e) {
            Log::error('Error fetching levels: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la récupération des niveaux'
            ], 500);
        }
    }

    public function getLevel($id)
    {
        try {
            $level = Level::with(['students', 'groups'])->withCount(['students', 'groups'])->findOrFail($id);
            
            return response()->json($level);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Niveau introuvable'
            ], 404);
        }
    }
    
    public function updateLevel(Request $request, $id)
    {
        $level = Level::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:50|unique:levels,name,'.$id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $level->update([
            'name' => $request->name,
        ]);
        
        return response()->json([
            'level' => $level->loadCount(['students', 'groups']),
            'message' => 'Niveau mis à jour avec succès'
        ]);
    }
    
    public function deleteLevel($id)
    {
        $level = Level::findOrFail($id);
        
        // Check if level has students or groups before deleting
        $studentsCount = Student::where('level_id', $id)->count();
        $groupsCount = Group::where('level_id', $id)->count();
        
        if ($studentsCount > 0 || $groupsCount > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer ce niveau car il contient ' . 
                           ($studentsCount > 0 ? $studentsCount . ' étudiant(s)' : '') .
                           ($studentsCount > 0 && $groupsCount > 0 ? ' et ' : '') .
                           ($groupsCount > 0 ? $groupsCount . ' groupe(s)' : '') . '.'
            ], 422);
        }
        
        try {
            $level->delete();
            
            return response()->json([
                'message' => 'Niveau supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting level: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la suppression du niveau'
            ], 500);
        }
    }

    // ENHANCED GROUP MANAGEMENT METHODS
    public function addGroup(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'level_id' => 'required|exists:levels,id',
            'group_number' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Check if the group number already exists for this level
        $existingGroup = Group::where('level_id', $request->level_id)
                            ->where('group_number', $request->group_number)
                            ->first();
                            
        if ($existingGroup) {
            return response()->json([
                'message' => 'Ce numéro de groupe existe déjà pour ce niveau'
            ], 422);
        }
        
        $group = Group::create([
            'level_id' => $request->level_id,
            'group_number' => $request->group_number,
        ]);

        return response()->json([
            'group' => $group->load('level'),
            'message' => 'Groupe créé avec succès'
        ], 201);
    }

    public function getGroups()
    {
        try {
            $groups = Group::with('level')->withCount(['students', 'teachers'])->get();
            
            return response()->json($groups);
        } catch (\Exception $e) {
            Log::error('Error fetching groups: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la récupération des groupes'
            ], 500);
        }
    }

    public function getGroup($id)
    {
        try {
            $group = Group::with(['level', 'students', 'teachers.subject'])
                         ->withCount(['students', 'teachers'])
                         ->findOrFail($id);
            
            // Get tasks count for this group
            $tasksCount = Task::whereHas('groups', function($query) use ($id) {
                $query->where('groups.id', $id);
            })->count();
            
            $group->tasks_count = $tasksCount;
            
            return response()->json($group);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Groupe introuvable'
            ], 404);
        }
    }
    
    public function updateGroup(Request $request, $id)
    {
        $group = Group::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'level_id' => 'required|exists:levels,id',
            'group_number' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Check if the group number already exists for this level (excluding current group)
        $existingGroup = Group::where('level_id', $request->level_id)
                            ->where('group_number', $request->group_number)
                            ->where('id', '!=', $id)
                            ->first();
                            
        if ($existingGroup) {
            return response()->json([
                'message' => 'Ce numéro de groupe existe déjà pour ce niveau'
            ], 422);
        }
        
        $group->update([
            'level_id' => $request->level_id,
            'group_number' => $request->group_number,
        ]);
        
        return response()->json([
            'group' => $group->load('level')->loadCount(['students', 'teachers']),
            'message' => 'Groupe mis à jour avec succès'
        ]);
    }
    
    public function deleteGroup($id)
    {
        $group = Group::findOrFail($id);
        
        // Check if group has students before deleting
        $studentsCount = Student::where('group_id', $id)->count();
        $teachersCount = TeacherGroup::where('group_id', $id)->count();
        
        if ($studentsCount > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer ce groupe car il contient ' . $studentsCount . ' étudiant(s).'
            ], 422);
        }
        
        try {
            DB::beginTransaction();
            
            // Delete teacher group assignments
            TeacherGroup::where('group_id', $id)->delete();
            
            $group->delete();
            
            DB::commit();
            
            return response()->json([
                'message' => 'Groupe supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting group: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la suppression du groupe'
            ], 500);
        }
    }

    // ENHANCED SUBJECT MANAGEMENT METHODS
    public function addSubject(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100|unique:subjects',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $subject = Subject::create([
            'name' => $request->name,
        ]);

        return response()->json([
            'subject' => $subject,
            'message' => 'Matière créée avec succès'
        ], 201);
    }

    public function getSubjects()
    {
        try {
            $subjects = Subject::withCount('teachers')->get();
            
            return response()->json($subjects);
        } catch (\Exception $e) {
            Log::error('Error fetching subjects: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la récupération des matières'
            ], 500);
        }
    }

    public function getSubject($id)
    {
        try {
            $subject = Subject::with('teachers')->withCount('teachers')->findOrFail($id);
            
            return response()->json($subject);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Matière introuvable'
            ], 404);
        }
    }
    
    public function updateSubject(Request $request, $id)
    {
        $subject = Subject::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100|unique:subjects,name,'.$id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $subject->update([
            'name' => $request->name,
        ]);
        
        return response()->json([
            'subject' => $subject->loadCount('teachers'),
            'message' => 'Matière mise à jour avec succès'
        ]);
    }
    
    public function deleteSubject($id)
    {
        $subject = Subject::findOrFail($id);
        
        // Check if subject has teachers before deleting
        $teachersCount = Teacher::where('subject_id', $id)->count();
        
        if ($teachersCount > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer cette matière car elle est assignée à ' . $teachersCount . ' enseignant(s).'
            ], 422);
        }
        
        try {
            $subject->delete();
            
            return response()->json([
                'message' => 'Matière supprimée avec succès'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting subject: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la suppression de la matière'
            ], 500);
        }
    }

    // Dashboard Stats
    public function getDashboardStats()
    {
        try {
            $stats = [
                'total_students' => Student::count(),
                'total_teachers' => Teacher::count(),
                'total_tasks' => Task::count(),
                'total_levels' => Level::count(),
                'total_groups' => Group::count(),
                'total_subjects' => Subject::count(),
                'levels' => Level::withCount('students')->get(),
            ];

            // Get top students with their completed tasks count
            $topStudents = Student::orderBy('total_stars', 'desc')
                ->with('level')
                ->take(10)
                ->get();
            
            $formattedStudents = [];
            foreach ($topStudents as $student) {
                // Get level name safely
                $levelName = 'N/A';
                if ($student->level) {
                    $levelName = $student->level->name;
                }
                
                // Count completed tasks using direct query
                $completedTasks = \App\Models\StudentTask::where('student_id', $student->id)
                    ->where('completed', true)
                    ->count();
                
                $formattedStudents[] = [
                    'id' => $student->id,
                    'first_name' => $student->first_name,
                    'last_name' => $student->last_name,
                    'total_stars' => $student->total_stars ?? 0,
                    'completed_tasks' => $completedTasks,
                    'level_name' => $levelName,
                    'last_active' => $student->updated_at ? $student->updated_at->toDateString() : 'N/A'
                ];
            }
            
            $stats['top_students'] = $formattedStudents;

            // Add total completed tasks across all students
            $stats['total_completed_tasks'] = \App\Models\StudentTask::where('completed', true)->count();

            return response()->json($stats);
            
        } catch (\Exception $e) {
            Log::error('Dashboard stats error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to load dashboard data',
                'message' => $e->getMessage(),
                'total_students' => 0,
                'total_teachers' => 0,
                'total_tasks' => 0,
                'total_completed_tasks' => 0,
                'total_levels' => 0,
                'total_groups' => 0,
                'total_subjects' => 0,
                'levels' => [],
                'top_students' => []
            ], 500);
        }
    }
}