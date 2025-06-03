// src/pages/teacher/TaskDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Divider, 
  List, 
  ListItem, 
  ListItemText,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Avatar,
  Badge,
  LinearProgress
} from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { teacherAPI } from '../../api/api';
import { formatDate, getStarIcons } from '../../utils/helpers';

const TeacherTaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [studentProgress, setStudentProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        const response = await teacherAPI.getTaskDetails(user.id, id);
        setTask(response.data.task);
        setStudentProgress(response.data.student_progress);
      } catch (err) {
        console.error('Erreur lors du chargement des détails de l\'évaluation:', err);
        setError('Échec du chargement des détails de l\'évaluation. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [id, user.id]);

  const getCompletionRate = () => {
    if (!studentProgress.length) return 0;
    const completed = studentProgress.filter(s => s.completed).length;
    return Math.round((completed / studentProgress.length) * 100);
  };

  const getAverageStars = () => {
    if (!studentProgress.length) return 0;
    const completedStudents = studentProgress.filter(s => s.completed);
    if (!completedStudents.length) return 0;
    const totalStars = completedStudents.reduce((sum, student) => sum + student.stars_earned, 0);
    return (totalStars / completedStudents.length).toFixed(1);
  };

  const getDeadlineStatus = () => {
    if (!task.deadline) return { text: 'Aucune échéance', color: 'default' };
    const now = new Date();
    const deadline = new Date(task.deadline);
    const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Expirée', color: 'error' };
    if (diffDays === 0) return { text: 'Expire aujourd\'hui', color: 'warning' };
    if (diffDays <= 3) return { text: `${diffDays} jour(s) restant(s)`, color: 'warning' };
    return { text: 'Active', color: 'success' };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
        <CircularProgress size={48} />
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          Chargement des détails de l'évaluation...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  }

  if (!task) {
    return <Alert severity="info" sx={{ mt: 2 }}>Évaluation non trouvée</Alert>;
  }

  const completionRate = getCompletionRate();
  const deadlineStatus = getDeadlineStatus();

  return (
    <Box sx={{ p: 2 }}>
      {/* En-tête avec dégradé */}
      <Paper 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 3,
          mb: 3,
          borderRadius: 2
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
              <AssignmentIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold">
                Détails de l'Évaluation
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
                {task.title}
              </Typography>
            </Box>
          </Box>
          <Button 
            variant="contained" 
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } 
            }}
            onClick={() => navigate('/teacher/tasks')}
          >
            Retour aux Évaluations
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Informations générales avec cartes colorées */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' }}>
                <CardContent sx={{ textAlign: 'center', color: 'white' }}>
                  <StarIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Étoiles Max
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                    {getStarIcons(task.max_stars)}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
                <CardContent sx={{ textAlign: 'center', color: 'white' }}>
                  <ScheduleIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Échéance
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {task.deadline ? formatDate(task.deadline) : 'Aucune échéance'}
                  </Typography>
                  <Chip 
                    label={deadlineStatus.text}
                    color={deadlineStatus.color}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }}>
                <CardContent sx={{ textAlign: 'center', color: 'white' }}>
                  <GroupIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Groupes
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1, justifyContent: 'center' }}>
                    {task.groups.map(group => (
                      <Chip 
                        key={group.id}
                        label={`${group.level.name}/${group.group_number}`}
                        size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)' }}>
                <CardContent sx={{ textAlign: 'center', color: 'white' }}>
                  <TrendingUpIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Taux de Réussite
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                    {completionRate}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={completionRate}
                    sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.3)' }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Statistiques détaillées */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="bold">
                Statistiques Détaillées
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <List>
              <ListItem sx={{ px: 0 }}>
                <Badge badgeContent={studentProgress.length} color="primary" sx={{ mr: 2 }}>
                  <PeopleIcon color="action" />
                </Badge>
                <ListItemText 
                  primary="Total Étudiants" 
                  secondary={`${studentProgress.length} étudiants inscrits`}
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <Badge badgeContent={studentProgress.filter(s => s.completed).length} color="success" sx={{ mr: 2 }}>
                  <CheckCircleIcon color="action" />
                </Badge>
                <ListItemText 
                  primary="Évaluations Terminées" 
                  secondary={`${getCompletionRate()}% de réussite`}
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <StarIcon sx={{ mr: 2, color: 'gold' }} />
                <ListItemText 
                  primary="Moyenne des Étoiles" 
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getAverageStars()} 
                      <StarIcon sx={{ ml: 0.5, color: 'gold' }} fontSize="small" />
                    </Box>
                  } 
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ScheduleIcon sx={{ mr: 2, color: deadlineStatus.color === 'error' ? 'error.main' : 'action.color' }} />
                <ListItemText 
                  primary="Statut de l'Échéance" 
                  secondary={
                    <Chip 
                      label={deadlineStatus.text}
                      color={deadlineStatus.color}
                      size="small"
                    />
                  } 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Questions */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Questions de l'Évaluation
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {task.questions.map((question, qIndex) => (
              <Card key={question.id} sx={{ mb: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Question {qIndex + 1}: {question.question_text}
                  </Typography>
                  <List dense>
                    {question.answers.map((answer) => (
                      <ListItem key={answer.id} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={
                            <Box 
                              component="span" 
                              sx={{ 
                                color: answer.is_correct ? 'success.main' : 'inherit',
                                fontWeight: answer.is_correct ? 'bold' : 'normal',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              {answer.answer_text}
                              {answer.is_correct && <CheckCircleIcon sx={{ ml: 1, fontSize: 16 }} />}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>

        {/* Progrès des étudiants */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Progrès des Étudiants
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nom de l'Étudiant</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>CNE</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date d'Achèvement</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Étoiles Obtenues</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentProgress.length > 0 ? (
                    studentProgress.map((student) => (
                      <TableRow key={student.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 32, height: 32 }}>
                              {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                            </Avatar>
                            {student.first_name} {student.last_name}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                          {student.cne}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={student.completed ? <CheckCircleIcon /> : <PendingIcon />}
                            label={student.completed ? 'Terminé' : 'En attente'}
                            color={student.completed ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {student.completed 
                            ? formatDate(student.completion_date) 
                            : '—'}
                        </TableCell>
                        <TableCell>
                          {student.completed ? (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {getStarIcons(student.stars_earned)}
                              <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                                ({student.stars_earned}/{task.max_stars})
                              </Typography>
                            </Box>
                          ) : '—'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Aucune donnée d'étudiant disponible
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeacherTaskDetails;