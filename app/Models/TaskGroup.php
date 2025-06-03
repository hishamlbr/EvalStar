<?php

// app/Models/TaskGroup.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskGroup extends Model
{
    use HasFactory;

    protected $table = 'task_groups';

    protected $fillable = [
        'task_id',
        'group_id',
    ];
}
