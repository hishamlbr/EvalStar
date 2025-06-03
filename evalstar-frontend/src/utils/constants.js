// src/utils/constants.js
export const USER_TYPES = {
    ADMIN: 'admin',
    TEACHER: 'teacher',
    STUDENT: 'student',
  };
  
  export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    
    // Admin routes
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_TEACHERS: '/admin/teachers',
    ADMIN_STUDENTS: '/admin/students',
    ADMIN_LEVELS: '/admin/levels',
    ADMIN_GROUPS: '/admin/groups',
    ADMIN_SUBJECTS: '/admin/subjects',
    ADMIN_TASKS: '/admin/tasks',
    
    // Teacher routes
    TEACHER_DASHBOARD: '/teacher/dashboard',
    TEACHER_GROUPS: '/teacher/groups',
    TEACHER_TASKS: '/teacher/tasks',
    TEACHER_CREATE_TASK: '/teacher/tasks/create',
    TEACHER_TASK_DETAILS: '/teacher/tasks/:id',
    TEACHER_GROUP_STUDENTS: '/teacher/groups/:id/students',
    
    // Student routes
    STUDENT_DASHBOARD: '/student/dashboard',
    STUDENT_TASKS: '/student/tasks',
    STUDENT_TASK_DETAILS: '/student/tasks/:id',
    STUDENT_RANKING: '/student/ranking',
  };