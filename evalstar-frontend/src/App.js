// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context providers
import { AuthProvider } from './context/AuthContext';

// Auth pages
import Login from './pages/auth/Login';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminTeachers from './pages/admin/Teachers';
import AdminStudents from './pages/admin/Students';
import AdminLevels from './pages/admin/Levels';
import AdminGroups from './pages/admin/Groups';
import AdminSubjects from './pages/admin/Subjects';
import AdminTasks from './pages/admin/Tasks';
import EditTask from './pages/teacher/EditTask';

// Teacher pages
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherGroups from './pages/teacher/Groups';
import TeacherTasks from './pages/teacher/Tasks';
import TeacherCreateTask from './pages/teacher/CreateTask';
import TeacherTaskDetails from './pages/teacher/TaskDetails';
import TeacherGroupStudents from './pages/teacher/GroupStudents';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import StudentTasks from './pages/student/Tasks';
import StudentTaskDetails from './pages/student/TaskDetails';
import StudentRanking from './pages/student/Ranking';

// Route guards
import PrivateRoute from './components/common/PrivateRoute';
import { USER_TYPES } from './utils/constants';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            
            {/* Admin routes */}
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute userType={USER_TYPES.ADMIN}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/teachers"
              element={
                <PrivateRoute userType={USER_TYPES.ADMIN}>
                  <AdminTeachers />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <PrivateRoute userType={USER_TYPES.ADMIN}>
                  <AdminStudents />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/levels"
              element={
                <PrivateRoute userType={USER_TYPES.ADMIN}>
                  <AdminLevels />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/groups"
              element={
                <PrivateRoute userType={USER_TYPES.ADMIN}>
                  <AdminGroups />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/subjects"
              element={
                <PrivateRoute userType={USER_TYPES.ADMIN}>
                  <AdminSubjects />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/tasks"
              element={
                <PrivateRoute userType={USER_TYPES.ADMIN}>
                  <AdminTasks />
                </PrivateRoute>
              }
            />
            
            {/* Teacher routes */}
            <Route
              path="/teacher/dashboard"
              element={
                <PrivateRoute userType={USER_TYPES.TEACHER}>
                  <TeacherDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/teacher/groups"
              element={
                <PrivateRoute userType={USER_TYPES.TEACHER}>
                  <TeacherGroups />
                </PrivateRoute>
              }
            />
            <Route
              path="/teacher/tasks"
              element={
                <PrivateRoute userType={USER_TYPES.TEACHER}>
                  <TeacherTasks />
                </PrivateRoute>
              }
            />
            <Route
              path="/teacher/tasks/create"
              element={
                <PrivateRoute userType={USER_TYPES.TEACHER}>
                  <TeacherCreateTask />
                </PrivateRoute>
              }
            />
            
            <Route path="/teacher/tasks/edit/:taskId" element={<EditTask />} />
            <Route
              path="/teacher/tasks/:id"
              element={
                <PrivateRoute userType={USER_TYPES.TEACHER}>
                  <TeacherTaskDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/teacher/groups/:id/students"
              element={
                <PrivateRoute userType={USER_TYPES.TEACHER}>
                  <TeacherGroupStudents />
                </PrivateRoute>
              }
            />
            
            {/* Student routes */}
            <Route
              path="/student/dashboard"
              element={
                <PrivateRoute userType={USER_TYPES.STUDENT}>
                  <StudentDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/student/tasks"
              element={
                <PrivateRoute userType={USER_TYPES.STUDENT}>
                  <StudentTasks />
                </PrivateRoute>
              }
            />
            <Route
              path="/student/tasks/:id"
              element={
                <PrivateRoute userType={USER_TYPES.STUDENT}>
                  <StudentTaskDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/student/ranking"
              element={
                <PrivateRoute userType={USER_TYPES.STUDENT}>
                  <StudentRanking />
                </PrivateRoute>
              }
            />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
          
          <ToastContainer position="bottom-right" />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
