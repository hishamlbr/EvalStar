<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\Teacher;
use App\Models\Task;
use App\Models\Question;
use App\Models\Answer;
use App\Models\TaskGroup;
use App\Models\Student;

class TeacherController extends Controller
{
    // helper to ensure admin or self
    private function authorizeTeacher($id)
    {
        $user = Auth::guard('teacher')->user() ?? Auth::guard('admin')->user();
        if ($user instanceof Teacher && $user->id != $id) {
            abort(403, 'Accès interdit');
        }
    }

    public function index()
    {
        // admins only
        Auth::guard('admin')->user() ?? abort(403, 'Accès interdit');
        return response()->json(Teacher::with('subject','groups.level')->get());
    }

    public function show($id)
    {
        $this->authorizeTeacher($id);
        return response()->json(Teacher::with(['subject','groups.level'])->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $this->authorizeTeacher($id);
        $teacher = Teacher::findOrFail($id);
        
        $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'n_appoge' => 'required|string|max:50|unique:teachers,n_appoge,'.$id,
        ]);
        
        $teacher->update([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'n_appoge' => $request->n_appoge,
        ]);
        
        if ($request->filled('password')) {
            $teacher->password = Hash::make($request->password);
            $teacher->save();
        }
        
        return response()->json([
            'teacher' => $teacher->load(['subject', 'groups.level']),
            'message' => 'Informations mises à jour avec succès'
        ]);
    }

    public function getGroups($id)
    {
        $this->authorizeTeacher($id);
        return response()->json(Teacher::findOrFail($id)->groups()->with('level')->get());
    }

    public function createTask(Request $request)
    {
        $this->authorizeTeacher($request->teacher_id);

        $payload = $request->validate([
            'title'=>'required|string|max:255',
            'max_stars'=>'required|integer|min:1|max:5',
            'deadline'=>'nullable|date|after:now',
            'teacher_id'=>'required|exists:teachers,id',
            'groups'=>'required|array|min:1','groups.*'=>'exists:groups,id',
            'questions'=>'required|array|min:1',
            'questions.*.question_text'=>'required|string',
            'questions.*.answers'=>'required|array|min:2',
            'questions.*.answers.*.answer_text'=>'required|string',
            'questions.*.answers.*.is_correct'=>'required|boolean',
        ]);

        // ensure groups belong
        $teacherGroups = DB::table('groups')
            ->join('teacher_groups', 'groups.id', '=', 'teacher_groups.group_id')
            ->where('teacher_groups.teacher_id', $payload['teacher_id'])
            ->pluck('groups.id')
            ->all();
            
        foreach ($payload['groups'] as $gid) {
            if (!in_array($gid, $teacherGroups)) {
                abort(403, 'Accès interdit - Ce groupe n\'appartient pas à l\'enseignant');
            }
        }

        $task = Task::create([
            'title'=>$payload['title'],
            'teacher_id'=>$payload['teacher_id'],
            'max_stars'=>$payload['max_stars'],
            'deadline'=>$payload['deadline'],
        ]);

        foreach ($payload['groups'] as $gid) {
            TaskGroup::create(['task_id'=>$task->id,'group_id'=>$gid]);
        }

        foreach ($payload['questions'] as $qd) {
            $q = Question::create(['task_id'=>$task->id,'question_text'=>$qd['question_text']]);
            if (collect($qd['answers'])->where('is_correct',true)->count()!==1) {
                $q->delete();
                return response()->json(['message'=>'Chaque question doit avoir exactement une réponse correcte'],422);
            }
            foreach ($qd['answers'] as $ad) {
                Answer::create([
                    'question_id'=>$q->id,
                    'answer_text'=>$ad['answer_text'],
                    'is_correct'=>$ad['is_correct'],
                ]);
            }
        }

        return response()->json(['task'=>$task,'message'=>'Tâche créée avec succès'],201);
    }

    public function updateTask(Request $request, $id, $taskId)
    {
        $this->authorizeTeacher($id);
        
        $task = Task::where(['id' => $taskId, 'teacher_id' => $id])->firstOrFail();
        
        $payload = $request->validate([
            'title'=>'required|string|max:255',
            'max_stars'=>'required|integer|min:1|max:5',
            'deadline'=>'nullable|date|after:now',
            'groups'=>'required|array|min:1',
            'groups.*'=>'exists:groups,id',
        ]);
        
        // Check if task has already been completed by any student
        $completedCount = DB::table('student_tasks')
            ->where('task_id', $taskId)
            ->where('completed', true)
            ->count();
            
        if ($completedCount > 0) {
            return response()->json([
                'message' => 'Impossible de modifier cette tâche car elle a déjà été complétée par des étudiants'
            ], 422);
        }
        
        // ensure groups belong
        $teacherGroups = DB::table('groups')
            ->join('teacher_groups', 'groups.id', '=', 'teacher_groups.group_id')
            ->where('teacher_groups.teacher_id', $id)
            ->pluck('groups.id')
            ->all();
            
        foreach ($payload['groups'] as $gid) {
            if (!in_array($gid, $teacherGroups)) {
                abort(403, 'Accès interdit - Ce groupe n\'appartient pas à l\'enseignant');
            }
        }
        
        $task->update([
            'title' => $payload['title'],
            'max_stars' => $payload['max_stars'],
            'deadline' => $payload['deadline'],
        ]);
        
        // Update task groups
        TaskGroup::where('task_id', $taskId)->delete();
        foreach ($payload['groups'] as $gid) {
            TaskGroup::create(['task_id' => $taskId, 'group_id' => $gid]);
        }
        
        return response()->json([
            'task' => $task,
            'message' => 'Tâche mise à jour avec succès'
        ]);
    }
    
    public function deleteTask($id, $taskId)
    {
        $this->authorizeTeacher($id);
        
        $task = Task::where(['id' => $taskId, 'teacher_id' => $id])->firstOrFail();
        
        // Check if task has already been completed by any student
        $completedCount = DB::table('student_tasks')
            ->where('task_id', $taskId)
            ->where('completed', true)
            ->count();
            
        if ($completedCount > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer cette tâche car elle a déjà été complétée par des étudiants'
            ], 422);
        }
        
        // Delete associated questions and answers
        foreach ($task->questions as $question) {
            Answer::where('question_id', $question->id)->delete();
        }
        Question::where('task_id', $taskId)->delete();
        
        // Delete task groups
        TaskGroup::where('task_id', $taskId)->delete();
        
        // Delete task
        $task->delete();
        
        return response()->json([
            'message' => 'Tâche supprimée avec succès'
        ]);
    }
    
    public function updateQuestion(Request $request, $id, $taskId, $questionId)
    {
        $this->authorizeTeacher($id);
        
        $task = Task::where(['id' => $taskId, 'teacher_id' => $id])->firstOrFail();
        $question = Question::where(['id' => $questionId, 'task_id' => $taskId])->firstOrFail();
        
        // Check if task has already been completed by any student
        $completedCount = DB::table('student_tasks')
            ->where('task_id', $taskId)
            ->where('completed', true)
            ->count();
            
        if ($completedCount > 0) {
            return response()->json([
                'message' => 'Impossible de modifier cette question car cette tâche a déjà été complétée par des étudiants'
            ], 422);
        }
        
        $payload = $request->validate([
            'question_text' => 'required|string',
            'answers' => 'required|array|min:2',
            'answers.*.answer_text' => 'required|string',
            'answers.*.is_correct' => 'required|boolean',
        ]);
        
        if (collect($payload['answers'])->where('is_correct', true)->count() !== 1) {
            return response()->json([
                'message' => 'Chaque question doit avoir exactement une réponse correcte'
            ], 422);
        }
        
        $question->update([
            'question_text' => $payload['question_text']
        ]);
        
        // Delete old answers
        Answer::where('question_id', $questionId)->delete();
        
        // Create new answers
        foreach ($payload['answers'] as $answer) {
            Answer::create([
                'question_id' => $questionId,
                'answer_text' => $answer['answer_text'],
                'is_correct' => $answer['is_correct'],
            ]);
        }
        
        return response()->json([
            'question' => $question->load('answers'),
            'message' => 'Question mise à jour avec succès'
        ]);
    }

    public function getTasks($id)
    {
        $this->authorizeTeacher($id);
        return response()->json(Teacher::findOrFail($id)->tasks()->with('groups.level')->get());
    }

    public function getStudentsByGroup($tid,$gid)
    {
        $this->authorizeTeacher($tid);
        if (!DB::table('teacher_groups')->where(['teacher_id'=>$tid,'group_id'=>$gid])->exists()) {
            abort(403, 'Accès interdit');
        }
        return response()->json(Student::where('group_id',$gid)->orderByDesc('total_stars')->get());
    }

    public function getTaskDetails($tid,$taskId)
    {
        $this->authorizeTeacher($tid);
        $task = Task::where(['id'=>$taskId,'teacher_id'=>$tid])
                    ->with(['questions.answers','groups.level'])
                    ->firstOrFail();

        $progress = DB::table('student_tasks')
            ->where('task_id',$taskId)
            ->join('students','student_tasks.student_id','students.id')
            ->select('students.id','students.first_name','students.last_name','students.cne',
                     'student_tasks.stars_earned','student_tasks.completed','student_tasks.completion_date')
            ->get();

        return response()->json(['task'=>$task,'student_progress'=>$progress]);
    }

    public function getDashboardStats($id)
    {
        $this->authorizeTeacher($id);
        $teacher = Teacher::with('subject')->findOrFail($id);
        $groups   = $teacher->groups()->with('level')->get();
        $taskCnt  = $teacher->tasks()->count();
        $gids     = $groups->pluck('id')->all();
        $stuCnt   = Student::whereIn('group_id',$gids)->count();
        $avgStars = Student::whereIn('group_id',$gids)->avg('total_stars');
        $top5     = Student::whereIn('group_id',$gids)->orderByDesc('total_stars')->take(5)->get();

        return response()->json([
            'teacher'=>$teacher,
            'groups'=>$groups,
            'task_count'=>$taskCnt,
            'student_count'=>$stuCnt,
            'average_stars'=>$avgStars,
            'top_students'=>$top5,
        ]);
    }
}