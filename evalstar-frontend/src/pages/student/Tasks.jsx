// src/pages/student/Tasks.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Grid,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Avatar,
  LinearProgress,
  Fade,
  Zoom,
  useTheme,
  alpha
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Done as DoneIcon,
  AccessTime as ClockIcon,
  Star as StarIcon,
  KeyboardArrowRight as ArrowIcon,
  CheckCircle as CheckCircleIcon,
  EmojiEvents as TrophyIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../api/api';
import { formatDate, getStarIcons } from '../../utils/helpers';

const Tasks = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  
  const [tabValue, setTabValue] = useState(0);
  const [tasks, setTasks] = useState({
    available_tasks: [],
    completed_tasks: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        if (!user || !user.id) {
          console.error('Utilisateur ou ID utilisateur manquant');
          setError('Les informations utilisateur sont manquantes. Veuillez vous reconnecter.');
          return;
        }

        console.log("Récupération des évaluations pour l'ID utilisateur:", user.id);
        const response = await studentAPI.getTasks(user.id);
        console.log("Réponse API évaluations:", response.data);
        
        // 1) Récupérer les tâches disponibles
        let availableTasks = [];
        if (response.data.available_tasks) {
          availableTasks = Array.isArray(response.data.available_tasks) 
            ? response.data.available_tasks 
            : Object.values(response.data.available_tasks);
        }

        // 2) Récupérer les tâches terminées (sans étoiles pour l'instant)
        let completedTasksRaw = [];
        if (response.data.completed_tasks) {
          completedTasksRaw = Array.isArray(response.data.completed_tasks) 
            ? response.data.completed_tasks 
            : Object.values(response.data.completed_tasks);
        }

        // 3) Pour chaque tâche terminée, appeler getTaskDetailsMe pour obtenir stars_earned
        const completedWithStars = await Promise.all(
          completedTasksRaw.map(async (task) => {
            try {
              const detailResp = await studentAPI.getTaskDetailsMe(task.id);
              const studentTask = detailResp.data.student_task;
              const starsEarned = studentTask?.stars_earned ?? 0;
              return {
                ...task,
                stars_earned: starsEarned,
                max_stars: task.max_stars ?? 0
              };
            } catch (e) {
              console.error(`Erreur récupération détails tâche ${task.id}:`, e);
              // Si échec, on met 0 étoiles
              return {
                ...task,
                stars_earned: 0,
                max_stars: task.max_stars ?? 0
              };
            }
          })
        );

        setTasks({
          available_tasks: availableTasks,
          completed_tasks: completedWithStars
        });
      } catch (err) {
        console.error('Erreur lors de la récupération des évaluations:', err);
        const errorMsg = err.response?.data?.message || 'Échec du chargement des évaluations';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTasks();
    }
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const isDeadlineSoon = (deadline) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2 && diffDays >= 0;
  };

  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    return deadlineDate < now;
  };

  const getDeadlineChip = (deadline) => {
    if (!deadline) return null;
    if (isDeadlinePassed(deadline)) {
      return (
        <Chip 
          size="small" 
          color="error" 
          icon={<ClockIcon />} 
          label="Expiré" 
          sx={{ 
            fontWeight: 'bold',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.7 },
              '100%': { opacity: 1 }
            }
          }}
        />
      );
    }
    if (isDeadlineSoon(deadline)) {
      return (
        <Chip 
          size="small" 
          color="warning" 
          icon={<ClockIcon />} 
          label="Bientôt dû" 
          sx={{ fontWeight: 'bold' }}
        />
      );
    }
    return (
      <Chip 
        size="small" 
        color="info" 
        icon={<ScheduleIcon />} 
        label={formatDate(deadline)} 
        variant="outlined"
      />
    );
  };

  const getProgressPercentage = (earned, max) => {
    if (!max || max === 0) return 0;
    return (earned / max) * 100;
  };

  const getScoreColor = (earned, max) => {
    const percentage = getProgressPercentage(earned, max);
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  const StatsCard = () => {
    const completedCount = Array.isArray(tasks.completed_tasks) ? tasks.completed_tasks.length : 0;
    const availableCount = Array.isArray(tasks.available_tasks) ? tasks.available_tasks.length : 0;
    const totalStars = tasks.completed_tasks?.reduce((sum, task) => sum + (task.stars_earned || 0), 0) || 0;
    const maxPossibleStars = tasks.completed_tasks?.reduce((sum, task) => sum + (task.max_stars || 0), 0) || 0;

    return (
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          borderRadius: 2
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar sx={{ 
                bgcolor: theme.palette.primary.main, 
                width: 56, 
                height: 56,
                mx: 'auto',
                mb: 1
              }}>
                <AssignmentIcon fontSize="large" />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {availableCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Évaluations disponibles
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar sx={{ 
                bgcolor: theme.palette.success.main, 
                width: 56, 
                height: 56,
                mx: 'auto',
                mb: 1
              }}>
                <TrophyIcon fontSize="large" />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {completedCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Évaluations terminées
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar sx={{ 
                bgcolor: theme.palette.warning.main, 
                width: 56, 
                height: 56,
                mx: 'auto',
                mb: 1
              }}>
                <StarIcon fontSize="large" />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {totalStars}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Étoiles obtenues
              </Typography>
              {maxPossibleStars > 0 && (
                <LinearProgress 
                  variant="determinate" 
                  value={getProgressPercentage(totalStars, maxPossibleStars)}
                  sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  color={getScoreColor(totalStars, maxPossibleStars)}
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  const renderTaskCards = (taskList, isCompleted = false) => {
    if (!Array.isArray(taskList) || taskList.length === 0) {
      return (
        <Fade in timeout={600}>
          <Alert 
            severity="info" 
            sx={{ 
              mt: 2,
              borderRadius: 2,
              '& .MuiAlert-message': {
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }
            }}
            icon={isCompleted ? <TrophyIcon /> : <AssignmentIcon />}
          >
            {isCompleted 
              ? 'Vous n\'avez pas encore terminé d\'évaluations.' 
              : 'Aucune évaluation disponible pour le moment.'}
          </Alert>
        </Fade>
      );
    }

    return (
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {taskList.map((task, index) => (
          <Grid item xs={12} md={6} lg={4} key={task.id}>
            <Zoom in timeout={300 + index * 100}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                    borderColor: theme.palette.primary.main
                  },
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  position: 'relative',
                  overflow: 'visible'
                }}
              >
                {/* Badge de priorité */}
                {!isCompleted && task.deadline && isDeadlineSoon(task.deadline) && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: 16,
                      zIndex: 1
                    }}
                  >
                    <Chip
                      size="small"
                      label="URGENT"
                      color="error"
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                        animation: 'bounce 1s infinite'
                      }}
                    />
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', lineHeight: 1.3 }}>
                      {task.title}
                    </Typography>
                    
                    {isCompleted ? (
                      <Tooltip title="Terminé" arrow>
                        <CheckCircleIcon 
                          sx={{ 
                            color: theme.palette.success.main,
                            fontSize: 28,
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                          }} 
                        />
                      </Tooltip>
                    ) : (
                      task.deadline && getDeadlineChip(task.deadline)
                    )}
                  </Box>
                  
                  {/* Info enseignant avec avatar */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        mr: 1.5,
                        bgcolor: theme.palette.secondary.main,
                        fontSize: '0.9rem'
                      }}
                    >
                      {task.teacher?.first_name?.[0]}{task.teacher?.last_name?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {task.teacher?.first_name} {task.teacher?.last_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Enseignant
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Étoiles avec design amélioré */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    p: 2,
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    borderRadius: 1,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                  }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Étoiles maximum
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getStarIcons(task.max_stars, task.max_stars)}
                        <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
                          {task.max_stars}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {isCompleted && (
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Étoiles obtenues
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          {getStarIcons(task.stars_earned, task.max_stars)}
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              ml: 1, 
                              fontWeight: 'bold',
                              color:
                                getScoreColor(task.stars_earned, task.max_stars) === 'success'
                                  ? theme.palette.success.main
                                  : getScoreColor(task.stars_earned, task.max_stars) === 'warning'
                                  ? theme.palette.warning.main
                                  : theme.palette.error.main
                            }}
                          >
                            {task.stars_earned}
                          </Typography>
                        </Box>
                        
                        {/* Barre de progression pour les évaluations terminées */}
                        <LinearProgress 
                          variant="determinate" 
                          value={getProgressPercentage(task.stars_earned, task.max_stars)}
                          sx={{ 
                            mt: 1, 
                            height: 4, 
                            borderRadius: 2,
                            width: 80
                          }}
                          color={getScoreColor(task.stars_earned, task.max_stars)}
                        />
                      </Box>
                    )}
                  </Box>
                </CardContent>
                
                <Divider />
                
                <CardActions sx={{ p: 2 }}>
                  <Button 
                    variant={isCompleted ? "outlined" : "contained"}
                    size="medium"
                    fullWidth
                    endIcon={<ArrowIcon />}
                    onClick={() => navigate(`/student/tasks/${task.id}`)}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      py: 1,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.02)'
                      }
                    }}
                  >
                    {isCompleted ? 'Voir le résultat' : 'Commencer l\'évaluation'}
                  </Button>
                </CardActions>
              </Card>
            </Zoom>
          </Grid>
        ))}
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        mt: 8,
        gap: 2
      }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          Chargement de vos évaluations...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Fade in timeout={400}>
        <Alert 
          severity="error" 
          sx={{ 
            mt: 2,
            borderRadius: 2,
            fontSize: '1rem'
          }}
        >
          {error}
        </Alert>
      </Fade>
    );
  }

  return (
    <Box>
      {/* En-tête avec design amélioré */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 4,
        pb: 2,
        borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
      }}>
        <Avatar sx={{ 
          bgcolor: theme.palette.primary.main, 
          width: 48, 
          height: 48,
          mr: 2
        }}>
          <AssignmentIcon fontSize="large" />
        </Avatar>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
            Mes Évaluations
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Gérez vos évaluations et suivez vos progrès
          </Typography>
        </Box>
      </Box>

      {/* Carte des statistiques */}
      <StatsCard />

      {/* Onglets avec design moderne */}
      <Paper 
        elevation={0}
        sx={{ 
          mb: 3,
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: 'hidden'
        }}
      >
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              py: 2,
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '1rem'
            }
          }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon />
                <span>Disponibles</span>
                <Chip 
                  size="small" 
                  label={Array.isArray(tasks.available_tasks) ? tasks.available_tasks.length : 0} 
                  color="primary"
                  sx={{ minWidth: 28 }}
                />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DoneIcon />
                <span>Terminées</span>
                <Chip 
                  size="small" 
                  label={Array.isArray(tasks.completed_tasks) ? tasks.completed_tasks.length : 0} 
                  color="success"
                  sx={{ minWidth: 28 }}
                />
              </Box>
            } 
          />
        </Tabs>
      </Paper>

      {/* Contenu des onglets */}
      <Box sx={{ mt: 2 }}>
        {tabValue === 0 && renderTaskCards(tasks.available_tasks)}
        {tabValue === 1 && renderTaskCards(tasks.completed_tasks, true)}
      </Box>
    </Box>
  );
};

export default Tasks;
