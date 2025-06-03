<?php

// app/Models/Teacher.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Teacher extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'n_appoge',
        'first_name',
        'last_name',
        'password',
        'subject_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function groups()
    {
        return $this->belongsToMany(Group::class, 'teacher_groups');
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}
