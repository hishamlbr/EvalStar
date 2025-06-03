import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Avatar,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Grade as GradeIcon,
  EmojiEvents as TrophyIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Star as StarIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { studentAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { formatDate, getStarIcons } from '../../utils/helpers';

const StudentDashboard = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await studentAPI.getDashboard(user.id);
        setStats(response.data);
        setFormData({
          first_name: response.data.student.first_name,
          last_name: response.data.student.last_name,
          password: '',
          confirmPassword: ''
        });
      } catch (err) {
        console.error('Erreur lors de la récupération des données du tableau de bord:', err);
        setError('Échec du chargement des informations du tableau de bord');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user, refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEditClick = () => {
    setOpenEditDialog(true);
    setUpdateSuccess(false);
  };

  const handleCloseDialog = () => {
    setOpenEditDialog(false);
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.first_name.trim()) {
      errors.first_name = 'Le prénom est requis';
    }
    
    if (!formData.last_name.trim()) {
      errors.last_name = 'Le nom de famille est requis';
    }
    
    if (formData.password && formData.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      const submitData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
      };
      
      if (formData.password) {
        submitData.password = formData.password;
      }
      
      const response = await studentAPI.updateProfile(submitData);
      
      setStats({
        ...stats,
        student: response.data.student
      });
      
      setUser({
        ...user,
        first_name: response.data.student.first_name,
        last_name: response.data.student.last_name
      });
      
      setUpdateSuccess(true);
      
      setTimeout(() => {
        handleCloseDialog();
      }, 1500);
      
    } catch (err) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      setFormErrors({
        submit: err.response?.data?.message || 'Échec de la mise à jour du profil'
      });
    }
  };

  // Composant pour les cartes de statistiques
  const StatCard = ({ title, value, icon, color = 'primary', bgColor, subtitle }) => (
    <Card sx={{ 
      height: '100%', 
      background: `linear-gradient(135deg, ${bgColor} 20%, transparent 100%)`,
      boxShadow: 3,
      borderRadius: 3,
      transition: 'transform 0.2s',
      '&:hover': { transform: 'translateY(-4px)' }
    }}>
      <CardContent sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        textAlign: 'center',
        p: 3
      }}>
        <Avatar sx={{ 
          bgcolor: `${color}.main`, 
          width: 64, 
          height: 64, 
          mb: 2,
          boxShadow: 2
        }}>
          {icon}
        </Avatar>
        <Typography variant="h3" component="div" sx={{ 
          fontWeight: 'bold', 
          color: `${color}.main`,
          mb: 1
        }}>
          {value}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 0.5 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh' 
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Chargement de votre tableau de bord...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={handleRefresh} 
          startIcon={<RefreshIcon />}
          size="large"
        >
          Réessayer
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* En-tête avec gradient */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        p: 4,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 3,
        color: 'white',
        boxShadow: 3
      }}>
        <Box>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            🎓 Mon Tableau de Bord
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Bienvenue, {stats?.student?.first_name} {stats?.student?.last_name}
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          onClick={handleRefresh}
          startIcon={<RefreshIcon />}
          sx={{ 
            bgcolor: 'rgba(255,255,255,0.2)', 
            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
            borderRadius: 2,
            px: 3
          }}
        >
          Actualiser
        </Button>
      </Box>
      
      {stats && (
        <Grid container spacing={4}>
          {/* Carte d'informations étudiant */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2 
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Mes Informations
                  </Typography>
                </Box>
                <Tooltip title="Modifier le Profil">
                  <IconButton 
                    color="primary" 
                    size="small" 
                    onClick={handleEditClick}
                    aria-label="modifier le profil"
                    sx={{ 
                      bgcolor: 'primary.50',
                      '&:hover': { bgcolor: 'primary.100' }
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: 'primary.main',
                  mx: 'auto',
                  mb: 2,
                  fontSize: '2rem'
                }}>
                  {stats.student.first_name?.charAt(0)}{stats.student.last_name?.charAt(0)}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {stats.student.first_name} {stats.student.last_name}
                </Typography>
              </Box>

              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary={
                      <Typography variant="subtitle2" color="text.secondary">
                        CNE
                      </Typography>
                    }
                    secondary={
                      <Chip 
                        label={stats.student.cne} 
                        size="small" 
                        variant="outlined" 
                        color="primary"
                      />
                    }
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary={
                      <Typography variant="subtitle2" color="text.secondary">
                        Niveau/Groupe
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          label={stats.student.level?.name || 'N/A'} 
                          size="small" 
                          color="secondary"
                        />
                        <Chip 
                          label={`Groupe ${stats.student.group?.group_number || 'N/A'}`} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                    }
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Cartes de statistiques améliorées */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <StatCard
                  title="Évaluations Terminées"
                  value={stats.completed_tasks}
                  icon={<AssignmentIcon sx={{ fontSize: 32 }} />}
                  color="primary"
                  bgColor="#e3f2fd"
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <StatCard
                  title="Total des Étoiles"
                  value={stats.total_stars}
                  icon={<StarIcon sx={{ fontSize: 32 }} />}
                  color="warning"
                  bgColor="#fff8e1"
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <StatCard
                  title="Classement"
                  value={`${stats.class_ranking.student_rank}/${stats.class_ranking.total_students}`}
                  icon={<TrophyIcon sx={{ fontSize: 32 }} />}
                  color="success"
                  bgColor="#e8f5e9"
                  subtitle={`Top ${Math.round((stats.class_ranking.student_rank / stats.class_ranking.total_students) * 100)}%`}
                />
              </Grid>

              {/* Progression visuelle */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    📊 Votre Progression
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Position dans la classe
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {stats.class_ranking.student_rank} / {stats.class_ranking.total_students}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={100 - ((stats.class_ranking.student_rank - 1) / (stats.class_ranking.total_students - 1)) * 100}
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          bgcolor: 'success.main'
                        }
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>

              {/* Évaluations récentes */}
              <Grid item xs={12}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    🏆 Évaluations Récemment Terminées
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  {stats.recent_tasks && stats.recent_tasks.length > 0 ? (
                    <Grid container spacing={3}>
                      {stats.recent_tasks.map((task) => (
                        <Grid item xs={12} md={4} key={task.id}>
                          <Card sx={{ 
                            height: '100%',
                            borderRadius: 2,
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': { 
                              transform: 'translateY(-4px)',
                              boxShadow: 4
                            }
                          }}>
                            <CardContent sx={{ pb: 1 }}>
                              <Typography variant="h6" noWrap gutterBottom sx={{ fontWeight: 'bold' }}>
                                {task.task?.title || 'Évaluation Sans Titre'}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Box sx={{ mr: 1 }}>
                                  {getStarIcons(task.stars_earned, task.task?.max_stars || 5)}
                                </Box>
                                <Chip 
                                  label={`${task.stars_earned}/${task.task?.max_stars || 5}`}
                                  size="small"
                                  color="warning"
                                  variant="outlined"
                                />
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                ✅ Terminée: {formatDate(task.completion_date)}
                              </Typography>
                            </CardContent>
                            <CardActions sx={{ pt: 0 }}>
                              <Button 
                                size="small" 
                                variant="outlined"
                                onClick={() => navigate(`/student/tasks/${task.task_id}`)}
                                sx={{ borderRadius: 2 }}
                              >
                                Voir les Détails
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 4,
                      color: 'text.secondary'
                    }}>
                      <AssignmentIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                      <Typography variant="body1">
                        Aucune évaluation récemment terminée.
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Boutons d'action améliorés */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                size="large"
                startIcon={<AssignmentIcon />}
                onClick={() => navigate('/student/tasks')}
                sx={{ 
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  boxShadow: 2
                }}
              >
                Voir Toutes les Évaluations
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                startIcon={<TrophyIcon />}
                onClick={() => navigate('/student/ranking')}
                sx={{ 
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem'
                }}
              >
                Voir le Classement de la Classe
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}

      {/* Boîte de dialogue de modification du profil améliorée */}
      <Dialog 
        open={openEditDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center'
        }}>
          <EditIcon sx={{ mr: 1 }} />
          Modifier le Profil
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {updateSuccess && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              ✅ Profil mis à jour avec succès !
            </Alert>
          )}
          
          {formErrors.submit && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {formErrors.submit}
            </Alert>
          )}
          
          <TextField
            margin="dense"
            label="Prénom"
            name="first_name"
            fullWidth
            variant="outlined"
            value={formData.first_name}
            onChange={handleInputChange}
            error={!!formErrors.first_name}
            helperText={formErrors.first_name}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Nom de Famille"
            name="last_name"
            fullWidth
            variant="outlined"
            value={formData.last_name}
            onChange={handleInputChange}
            error={!!formErrors.last_name}
            helperText={formErrors.last_name}
            sx={{ mb: 2 }}
          />
          
          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 'bold' }}>
            🔒 Changer le mot de passe (laisser vide pour conserver le mot de passe actuel)
          </Typography>
          
          <TextField
            margin="dense"
            label="Nouveau Mot de Passe"
            name="password"
            type="password"
            fullWidth
            variant="outlined"
            value={formData.password}
            onChange={handleInputChange}
            error={!!formErrors.password}
            helperText={formErrors.password}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Confirmer le Mot de Passe"
            name="confirmPassword"
            type="password"
            fullWidth
            variant="outlined"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={!!formErrors.confirmPassword}
            helperText={formErrors.confirmPassword}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ borderRadius: 2 }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Enregistrer les Modifications
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentDashboard;