// src/api/api.js - Updated Teacher API methods

import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add an interceptor to add the token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('evalstar_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('Request error interceptor:', error);
    return Promise.reject(error);
  }
);

// Add an interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response success:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      response: error.response?.data
    });
    
    if (error.response && error.response.status === 401) {
      console.log('401 Unauthorized - Redirecting to login');
      localStorage.removeItem('evalstar_token');
      localStorage.removeItem('evalstar_user');
      localStorage.removeItem('evalstar_user_type');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (userType, identifier, password) => {
    return api.post('/login', { user_type: userType, identifier, password });
  },
  logout: () => {
    return api.post('/logout');
  }
};

// Admin API
export const adminAPI = {
  getDashboard: () => {
    return api.get('/admin/dashboard');
  },
  
  // Teacher management
  addTeacher: (teacherData) => {
    return api.post('/admin/teachers', teacherData);
  },
  updateTeacher: (id, teacherData) => {
    return api.put(`/admin/teachers/${id}`, teacherData);
  },
  deleteTeacher: (id) => {
    return api.delete(`/admin/teachers/${id}`);
  },
  
  // Student management
  addStudent: (studentData) => {
    return api.post('/admin/students', studentData);
  },
  updateStudent: (id, studentData) => {
    return api.put(`/admin/students/${id}`, studentData);
  },
  deleteStudent: (id) => {
    return api.delete(`/admin/students/${id}`);
  },
  
  // Level management
  addLevel: (levelData) => {
    return api.post('/admin/levels', levelData);
  },
  updateLevel: (id, levelData) => {
    return api.put(`/admin/levels/${id}`, levelData);
  },
  deleteLevel: (id) => {
    return api.delete(`/admin/levels/${id}`);
  },
  getLevels: () => {
    console.log('Calling admin getLevels API');
    return api.get('/admin/levels');
  },
  getLevel: (id) => {
    console.log('Calling admin getLevel API for id:', id);
    return api.get(`/admin/levels/${id}`);
  },
  
  // Group management
  getGroups: () => {
    console.log('Calling admin getGroups API');
    return api.get('/admin/groups');
  },
  getGroup: (id) => {
    console.log('Calling admin getGroup API for id:', id);
    return api.get(`/admin/groups/${id}`);
  },
  addGroup: (groupData) => {
    console.log('Calling admin addGroup API with data:', groupData);
    return api.post('/admin/groups', groupData);
  },
  updateGroup: (id, groupData) => {
    console.log('Calling admin updateGroup API for id:', id, 'with data:', groupData);
    return api.put(`/admin/groups/${id}`, groupData);
  },
  deleteGroup: (id) => {
    console.log('Calling admin deleteGroup API for id:', id);
    return api.delete(`/admin/groups/${id}`);
  },
  
  // Subject management
  addSubject: (subjectData) => {
    return api.post('/admin/subjects', subjectData);
  },
  updateSubject: (id, subjectData) => {
    return api.put(`/admin/subjects/${id}`, subjectData);
  },
  deleteSubject: (id) => {
    return api.delete(`/admin/subjects/${id}`);
  },
  
  // Get methods for general data
  getTeachers: () => {
    console.log('Calling getTeachers API');
    return api.get('/teachers');
  },
  getStudents: () => {
    console.log('Calling getStudents API');
    return api.get('/students');
  },
  getTasks: () => {
    return api.get('/tasks');
  }
};

// Teacher API - Updated with edit/delete methods
export const teacherAPI = {
  getTeacher: (id) => {
    return api.get(`/teachers/${id}`);
  },
  updateTeacher: (id, teacherData) => {
    return api.put(`/teachers/${id}`, teacherData);
  },
  getGroups: (id) => {
    return api.get(`/teachers/${id}/groups`);
  },
  
  // Task management - Full CRUD operations
  createTask: (taskData) => {
    console.log('Creating task with data:', taskData);
    return api.post('/teachers/tasks', taskData);
  },
  getTasks: (id) => {
    return api.get(`/teachers/${id}/tasks`);
  },
  updateTask: (teacherId, taskId, taskData) => {
    console.log('Updating task:', { teacherId, taskId, taskData });
    return api.put(`/teachers/${teacherId}/tasks/${taskId}`, taskData);
  },
  deleteTask: (teacherId, taskId) => {
    console.log('Deleting task:', { teacherId, taskId });
    return api.delete(`/teachers/${teacherId}/tasks/${taskId}`);
  },
  
  // Question management
  updateQuestion: (teacherId, taskId, questionId, questionData) => {
    console.log('Updating question:', { teacherId, taskId, questionId, questionData });
    return api.put(`/teachers/${teacherId}/tasks/${taskId}/questions/${questionId}`, questionData);
  },
  
  getStudentsByGroup: (teacherId, groupId) => {
    return api.get(`/teachers/${teacherId}/groups/${groupId}/students`);
  },
  getTaskDetails: (teacherId, taskId) => {
    return api.get(`/teachers/${teacherId}/tasks/${taskId}`);
  },
  getDashboard: (id) => {
    return api.get(`/teachers/${id}/dashboard`);
  }
};

// Student API
export const studentAPI = {
  getStudent: (id) => {
    return api.get(`/students/${id}`);
  },
  updateProfile: (profileData) => {
    return api.put('/students/me', profileData);
  },
  getTasks: (id) => {
    console.log('Fetching tasks for student id:', id);
    return api.get(`/students/${id}/tasks`);
  },
  getTaskDetails: (studentId, taskId) => {
    return api.get(`/students/${studentId}/tasks/${taskId}`);
  },
  getTaskDetailsMe: (taskId) => {
    return api.get(`/students/me/tasks/${taskId}`);
  },
  submitTaskAnswers: (taskId, answers) => {
    return api.post(`/students/me/tasks/${taskId}/submit`, { answers });
  },
  getClassRanking: (id) => {
    return api.get(`/students/${id}/ranking`);
  },
  getDashboard: (id) => {
    return api.get(`/students/${id}/dashboard`);
  }
};

// Common API
export const commonAPI = {
  getLevels: () => {
    console.log('Calling getLevels API');
    return api.get('/levels');
  },
  getLevel: (id) => {
    return api.get(`/levels/${id}`);
  },
  
  getGroups: () => {
    console.log('Calling common getGroups API');
    return api.get('/groups');
  },
  getGroup: (id) => {
    console.log('Calling common getGroup API for id:', id);
    return api.get(`/groups/${id}`);
  },
  getGroupDetails: (id) => {
    console.log('Calling getGroupDetails API for id:', id);
    return api.get(`/groups/${id}`);
  },
  
  getGroupsByLevel: (levelId) => {
    return api.get(`/levels/${levelId}/groups`);
  },
  getSubjects: () => {
    console.log('Calling getSubjects API');
    return api.get('/subjects');
  },
  getSubject: (id) => {
    return api.get(`/subjects/${id}`);
  },
  getTask: (id) => {
    return api.get(`/tasks/${id}`);
  },
  getTaskQuestions: (id) => {
    return api.get(`/tasks/${id}/questions`);
  }
};