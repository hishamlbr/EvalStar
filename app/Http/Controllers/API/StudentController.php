<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\Student;
use App\Models\Task;
use App\Models\StudentTask;
use App\Models\StudentAnswer;
use App\Models\Question;
use App\Models\Answer;

class StudentController extends Controller
{
    // Add this missing method to get all students
    public function index()
    {
        // Check if admin is logged in
        if (!Auth::guard('admin')->check()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $students = Student::with(['level', 'group'])->get();
        return response()->json($students);
    }
    
    public function show()
    {
        $me = Auth::guard('student')->user();
        return response()->json($me->load(['level','group']));
    }

    /**
     * Update student profile information
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateProfile(Request $request)
    {
        $me = Auth::guard('student')->user();
        
        if (!$me) {
            return response()->json(['message' => 'Non autorisé'], 401);
        }
        
        $request->validate([
            'first_name' => 'sometimes|required|string|max:100',
            'last_name' => 'sometimes|required|string|max:100',
            'password' => 'sometimes|required|string|min:6',
        ]);
        
        $updateData = [];
        
        if ($request->has('first_name')) {
            $updateData['first_name'] = $request->first_name;
        }
        
        if ($request->has('last_name')) {
            $updateData['last_name'] = $request->last_name;
        }
        
        if (!empty($updateData)) {
            $me->update($updateData);
        }
        
        if ($request->filled('password')) {
            $me->password = Hash::make($request->password);
            $me->save();
        }
        
        return response()->json([
            'student' => $me->fresh()->load(['level', 'group']),
            'message' => 'Informations mises à jour avec succès'
        ]);
    }

    // Add this method to match the frontend API call
    public function getTasks($id)
    {
        // Verify the student ID matches the logged-in user or check admin/teacher permissions
        $me = Auth::guard('student')->user();
        if ($me->id != $id && !Auth::guard('admin')->check() && !Auth::guard('teacher')->check()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        // Use the same logic as getAvailableTasks
        $tasks = Task::whereHas('groups',fn($q)=>$q->where('group_id',$me->group_id))
                     ->with('teacher')->get();

        $done = StudentTask::where(['student_id'=>$me->id,'completed'=>true])
                           ->pluck('task_id')->all();

        $avail = $tasks->filter(fn($t)=>!in_array($t->id,$done)
                       && (!$t->deadline || $t->deadline>now()));
        $comp  = $tasks->whereIn('id',$done);

        return response()->json(['available_tasks'=>$avail,'completed_tasks'=>$comp]);
    }

    public function getAvailableTasks()
    {
        $me = Auth::guard('student')->user();
        $tasks = Task::whereHas('groups',fn($q)=>$q->where('group_id',$me->group_id))
                     ->with('teacher')->get();

        $done = StudentTask::where(['student_id'=>$me->id,'completed'=>true])
                           ->pluck('task_id')->all();

        $avail = $tasks->filter(fn($t)=>!in_array($t->id,$done)
                       && (!$t->deadline || $t->deadline>now()));
        $comp  = $tasks->whereIn('id',$done);

        return response()->json(['available_tasks'=>$avail,'completed_tasks'=>$comp]);
    }


    public function getTaskDetailsMe($taskId)
    {
        $me = Auth::guard('student')->user();
        
        if (!$me) {
            return response()->json(['message' => 'Non autorisé'], 401);
        }
        
        // Check if the task exists AND belongs to the student's group
        $task = Task::where('id', $taskId)
                    ->whereHas('groups', function($query) use ($me) {
                        $query->where('group_id', $me->group_id);
                    })
                    ->with(['questions.answers', 'teacher'])
                    ->first();
                    
        if (!$task) {
            return response()->json(['message' => 'Tâche non trouvée ou non accessible'], 404);
        }
    
        $rec = StudentTask::where(['student_id' => $me->id, 'task_id' => $taskId])->first();
        if ($rec && $rec->completed) {
            $ans = StudentAnswer::where('student_id', $me->id)
                                ->whereHas('question', function($q) use ($taskId) {
                                    $q->where('task_id', $taskId);
                                })
                                ->with(['question', 'answer'])
                                ->get();
            return response()->json([
                'task' => $task, 
                'student_task' => $rec,
                'student_answers' => $ans, 
                'completed' => true
            ]);
        }
    
        return response()->json(['task' => $task, 'completed' => false]);
    }

    public function getTaskDetails($taskId)
    {
        $me = Auth::guard('student')->user();
        $task = Task::where('id',$taskId)
                    ->whereHas('groups',fn($q)=>$q->where('group_id',$me->group_id))
                    ->with(['questions.answers','teacher'])
                    ->firstOrFail();

        $rec = StudentTask::where(['student_id'=>$me->id,'task_id'=>$taskId])->first();
        if ($rec && $rec->completed) {
            $ans = StudentAnswer::where('student_id',$me->id)
                                ->whereHas('question',fn($q)=>$q->where('task_id',$taskId))
                                ->with(['question','answer'])
                                ->get();
            return response()->json([
                'task'=>$task,'student_task'=>$rec,
                'student_answers'=>$ans,'completed'=>true
            ]);
        }

        return response()->json(['task'=>$task,'completed'=>false]);
    }

/**
 * Submit task answers for the authenticated student
 *
 * @param Request $request
 * @param int $taskId - The ID of the task being submitted
 * @return \Illuminate\Http\JsonResponse
 */
public function submitTaskAnswers(Request $request, $taskId)
{
    $me = Auth::guard('student')->user();
    $payload = $request->validate([
        'answers' => 'required|array',
        'answers.*' => 'required|exists:answers,id'
    ]);

    $task = Task::where('id', $taskId)
                ->whereHas('groups', fn($q) => $q->where('group_id', $me->group_id))
                ->firstOrFail();

    if ($task->deadline && $task->deadline < now()) {
        return response()->json(['message' => 'Tâche expirée'], 400);
    }
    if (StudentTask::where(['student_id' => $me->id, 'task_id' => $taskId, 'completed' => true])->exists()) {
        return response()->json(['message' => 'Déjà complété'], 400);
    }

    $questions = Question::where('task_id', $taskId)->get();
    if (count($payload['answers']) !== $questions->count()) {
        return response()->json(['message' => 'Toutes les questions doivent être répondues'], 422);
    }

    $stars = 0; // Initialize $stars variable outside the transaction

    DB::transaction(function() use($me, $task, $questions, $payload, &$stars) {
        $correct = 0;
        foreach($payload['answers'] as $aid) {
            $ans = Answer::findOrFail($aid);
            $ques = $ans->question;
            if($ques->task_id !== $task->id) abort(400, 'Réponse invalide');
            StudentAnswer::create([
                'student_id' => $me->id,
                'question_id' => $ques->id,
                'answer_id' => $aid,
                'is_correct' => $ans->is_correct
            ]);
            if($ans->is_correct) $correct++;
        }
        $pct = ($correct / count($questions)) * 100;
        $stars = match(true) {
            $pct >= 90 => $task->max_stars,
            $pct >= 75 => $task->max_stars - 1,
            $pct >= 60 => $task->max_stars - 2,
            $pct >= 50 => 1,
            default => 0,
        };
        StudentTask::updateOrCreate(
            ['student_id' => $me->id, 'task_id' => $task->id],
            ['stars_earned' => $stars, 'completed' => true, 'completion_date' => now()]
        );
        $me->increment('total_stars', $stars);
    });

    return response()->json(['message' => 'Complété', 'stars_earned' => $stars], 201);
}

    public function getClassRanking()
    {
        $me=Auth::guard('student')->user();
        $classmates=Student::where('group_id',$me->group_id)
                           ->orderByDesc('total_stars')->get();
        $rank = $classmates->search(fn($s)=>$s->id===$me->id)+1;
        return response()->json([
            'classmates'=>$classmates,'student_rank'=>$rank,
            'total_students'=>$classmates->count()
        ]);
    }

    public function getDashboardStats()
    {
        $me=Auth::guard('student')->user();
        $completed=StudentTask::where(['student_id'=>$me->id,'completed'=>true])->count();
        $ranking=$this->getClassRanking()->original;
        $recent=StudentTask::where(['student_id'=>$me->id,'completed'=>true])
                           ->with('task')->latest('completion_date')->take(3)->get();

        return response()->json([
            'student'=>$me->load(['level','group']),
            'completed_tasks'=>$completed,
            'total_stars'=>$me->total_stars,
            'class_ranking'=>$ranking,
            'recent_tasks'=>$recent,
        ]);
    }
}