<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Order matters because of foreign key relationships
        $this->call([
            AdminsTableSeeder::class,
           // LevelsTableSeeder::class,
           // SubjectsTableSeeder::class,
           // GroupsTableSeeder::class,
           // TeachersTableSeeder::class,
           //StudentsTableSeeder::class,
           // TasksTableSeeder::class,
           // QuestionsTableSeeder::class,
           // AnswersTableSeeder::class,
           // TeacherGroupsTableSeeder::class,
           // TaskGroupsTableSeeder::class,
           // StudentTasksTableSeeder::class,
           // StudentAnswersTableSeeder::class,
        ]);
    }
}