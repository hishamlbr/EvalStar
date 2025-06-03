<?php

// app/Models/Student.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Student extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'cne',
        'first_name',
        'last_name',
        'password',
        'level_id',
        'group_id',
        'total_stars',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function level()
    {
        return $this->belongsTo(Level::class);
    }

    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    public function tasks()
    {
        return $this->belongsToMany(Task::class, 'student_tasks')
                    ->withPivot('stars_earned', 'completed', 'completion_date');
    }

    public function studentTasks()
    {
        return $this->hasMany(StudentTask::class);
    }

    public function answers()
    {
        return $this->hasMany(StudentAnswer::class);
    }
    
    public function studentAnswers()
    {
        return $this->hasMany(StudentAnswer::class);
    }
}