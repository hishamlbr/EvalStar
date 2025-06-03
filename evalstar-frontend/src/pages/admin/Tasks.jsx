// src/pages/teacher/Tasks.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { teacherAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';

const TeacherTasks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await teacherAPI.getTasks(user.id);
        setTasks(response.data);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchTasks();
    }
  }, [user]);

  const getStatusChip = (task) => {
    const now = new Date();
    const deadline = task.deadline ? new Date(task.deadline) : null;
    
    if (!deadline) {
      return <Chip label="No Deadline" color="info" size="small" />;
    } else if (deadline < now) {
      return <Chip label="Expired" color="error" size="small" />;
    } else {
      return <Chip label="Active" color="success" size="small" />;
    }
  };

  const getGroupsList = (task) => {
    if (!task.groups || task.groups.length === 0) return 'No groups assigned';
    
    return task.groups.map(group => 
      `${group.level.name}/${group.group_number}`
    ).join(', ');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          My Tasks
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/teacher/tasks/create')}
        >
          Create Task
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : tasks.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            You haven't created any tasks yet
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/teacher/tasks/create')}
            sx={{ mt: 2 }}
          >
            Create Your First Task
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Max Stars</TableCell>
                <TableCell>Deadline</TableCell>
                <TableCell>Assigned Groups</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{getStatusChip(task)}</TableCell>
                  <TableCell>
                    {Array(task.max_stars).fill('★').join('')}
                  </TableCell>
                  <TableCell>
                    {task.deadline ? formatDate(task.deadline) : 'No deadline'}
                  </TableCell>
                  <TableCell>{getGroupsList(task)}</TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton 
                        color="primary"
                        component={Link}
                        to={`/teacher/tasks/${task.id}`}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default TeacherTasks;