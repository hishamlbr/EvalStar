<?php

// app/Models/TeacherGroup.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeacherGroup extends Model
{
    use HasFactory;

    protected $table = 'teacher_groups';

    protected $fillable = [
        'teacher_id',
        'group_id',
    ];
}