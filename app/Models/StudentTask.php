<?php

// app/Models/StudentTask.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentTask extends Model
{
    use HasFactory;

    protected $table = 'student_tasks';

    protected $fillable = [
        'student_id',
        'task_id',
        'stars_earned',
        'completed',
        'completion_date',
    ];

    protected $casts = [
        'completed' => 'boolean',
        'completion_date' => 'datetime',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function task()
    {
        return $this->belongsTo(Task::class);
    }
}