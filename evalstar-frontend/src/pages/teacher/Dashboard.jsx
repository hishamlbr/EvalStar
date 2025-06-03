import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Badge,
  LinearProgress,
} from '@mui/material';
import {
  School as SchoolIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  ArrowForward as ArrowForwardIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { teacherAPI } from '../../api/api';
import { toast } from 'react-toastify';

/**
 * Composant StatCard - Affiche une carte statistique avec icône, titre et valeur
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.icon - Icône à afficher
 * @param {string} props.title - Titre de la statistique
 * @param {string|number} props.value - Valeur à afficher
 * @param {string} props.color - Couleur du thème pour la carte
 * @param {string} props.subtitle - Sous-titre optionnel
 * @param {number} props.progress - Barre de progression optionnelle (0-100)
 * @returns {React.ReactElement} Un composant Paper stylé avec les informations statistiques
 */
const StatCard = ({ icon, title, value, color, subtitle, progress }) => (
  <Paper 
    elevation={4} 
    sx={{ 
      p: 3, 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      borderLeft: `6px solid ${color}`,
      borderRadius: 3,
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 25px rgba(0,0,0,0.12), 0 0 0 1px ${color}20`,
      }
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Badge badgeContent={subtitle ? "!" : null} color="primary" invisible={!subtitle}>
        {icon}
      </Badge>
      <Typography variant="h6" color="text.secondary" ml={1} fontWeight="500">
        {title}
      </Typography>
    </Box>
    <Typography variant="h2" component="div" fontWeight="700" color={color} sx={{ mb: 1 }}>
      {value}
    </Typography>
    {subtitle && (
      <Typography variant="body2" color="text.secondary" textAlign="center">
        {subtitle}
      </Typography>
    )}
    
  </Paper>
);

/**
 * Formate un nombre de manière sécurisée avec un nombre spécifié de décimales
 * @param {*} value - La valeur à formater
 * @param {number} [decimalPlaces=1] - Nombre de décimales à afficher
 * @param {string} [fallback='0,0'] - Valeur de fallback si l'analyse échoue
 * @returns {string} Nombre formaté en chaîne
 */
const formatNumber = (value, decimalPlaces = 1, fallback = '0,0') => {
  // Si la valeur est déjà un nombre, utiliser toFixed directement
  if (typeof value === 'number' && !isNaN(value)) {
    return value.toFixed(decimalPlaces).replace('.', ',');
  }
  
  // Essayer de convertir en nombre
  const parsedValue = Number(value);
  
  // Vérifier si la conversion a réussi
  if (!isNaN(parsedValue)) {
    return parsedValue.toFixed(decimalPlaces).replace('.', ',');
  }
  
  // Retourner la valeur de fallback si la conversion a échoué
  return fallback;
};

/**
 * Composant TableauDeBordEnseignant - Tableau de bord principal pour les enseignants
 * @returns {React.ReactElement} L'interface utilisateur du tableau de bord enseignant
 */
const TableauDeBordEnseignant = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupérer les données du tableau de bord au montage du composant
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const response = await teacherAPI.getDashboard(user.id);
        setDashboardData(response.data);
      } catch (err) {
        console.error('Erreur lors de la récupération des données du tableau de bord:', err);
        setError('Échec du chargement des données du tableau de bord. Veuillez réessayer plus tard.');
        toast.error('Échec du chargement des données du tableau de bord');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Gestionnaires de navigation
  const handleCreateEvaluation = () => navigate('/teacher/tasks/create');
  const handleViewGroups = () => navigate('/teacher/groups');
  const handleViewEvaluations = () => navigate('/teacher/tasks');
  const handleViewGroup = (groupId) => navigate(`/teacher/groups/${groupId}/students`);

  // Traiter les données avec useMemo pour éviter les recalculs lors des re-rendus
  const processedData = useMemo(() => {
    if (!dashboardData) return null;
    
    const { teacher, groups, task_count, student_count, average_stars, top_students } = dashboardData;
    
    return {
      teacher,
      groups: groups || [],
      evaluationCount: task_count || 0,
      studentCount: student_count || 0,
      averageStars: formatNumber(average_stars),
      topStudents: top_students || []
    };
  }, [dashboardData]);

  // État de chargement
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column' }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Chargement de votre tableau de bord...
        </Typography>
      </Box>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h6" gutterBottom>{error}</Typography>
        <Button variant="contained" size="large" sx={{ mt: 2 }} onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </Box>
    );
  }

  // État sans données
  if (!processedData) {
    return null;
  }

  const { teacher, groups, evaluationCount, studentCount, averageStars, topStudents } = processedData;

  // Calculer les statistiques de progression
  const groupProgress = groups.length > 0 ? Math.min((groups.length / 10) * 100, 100) : 0;
  const evaluationProgress = evaluationCount > 0 ? Math.min((evaluationCount / 20) * 100, 100) : 0;

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* En-tête de bienvenue amélioré */}
      <Paper 
        elevation={6} 
        sx={{ 
          p: 4, 
          mb: 4, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '40%',
            height: '100%',
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
          }
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: 'rgba(255,255,255,0.2)', 
                fontSize: '2rem',
                fontWeight: 'bold',
                border: '3px solid rgba(255,255,255,0.3)'
              }}
            >
              {teacher.first_name?.charAt(0) || ''}{teacher.last_name?.charAt(0) || ''}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h3" gutterBottom fontWeight="700" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              Bonjour, {teacher.first_name || ''} {teacher.last_name || ''} 👋
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
              📚 Matière : {teacher.subject?.name || 'Non assignée'}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8 }}>
              🕐 Dernière connexion : {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleCreateEvaluation}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                fontWeight: 'bold',
                px: 3,
                py: 1.5,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              Créer une Évaluation
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Résumé des statistiques amélioré */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<GroupIcon fontSize="large" sx={{ color: '#3b82f6' }} />} 
            title="Groupes" 
            value={groups.length} 
            color="#3b82f6"
            subtitle={`${groups.length} groupes actifs`}
            progress={groupProgress}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<AssignmentIcon fontSize="large" sx={{ color: '#ef4444' }} />} 
            title="Évaluations" 
            value={evaluationCount} 
            color="#ef4444"
            subtitle={`${evaluationCount} évaluations créées`}
            progress={evaluationProgress}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<PersonIcon fontSize="large" sx={{ color: '#10b981' }} />} 
            title="Étudiants" 
            value={studentCount} 
            color="#10b981"
            subtitle={`${studentCount} étudiants au total`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<StarIcon fontSize="large" sx={{ color: '#f59e0b' }} />} 
            title="Moy. Étoiles" 
            value={averageStars} 
            color="#f59e0b"
            subtitle="Performance moyenne"
          />
        </Grid>
      </Grid>

      {/* Contenu principal */}
      <Grid container spacing={4}>
        {/* Colonne gauche - Groupes */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={4} sx={{ height: '100%', borderRadius: 3 }}>
            <Box sx={{ 
              p: 3, 
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderRadius: '12px 12px 0 0'
            }}>
              <Typography variant="h6" component="h2" fontWeight="600">
                <GroupIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#3b82f6' }} />
                Mes Groupes
              </Typography>
              <Tooltip title="Voir tous les groupes">
                <Button 
                  size="small" 
                  endIcon={<ArrowForwardIcon />} 
                  onClick={handleViewGroups}
                  sx={{ fontWeight: '600' }}
                >
                  Tout Voir
                </Button>
              </Tooltip>
            </Box>
            <Divider />
            <List sx={{ overflow: 'auto', maxHeight: 450, p: 0 }}>
              {groups.length > 0 ? (
                groups.map((group, index) => (
                  <React.Fragment key={group.id}>
                    <ListItem
                      sx={{ 
                        py: 2,
                        '&:hover': { 
                          bgcolor: '#f1f5f9',
                          '& .MuiIconButton-root': {
                            color: '#3b82f6'
                          }
                        }
                      }}
                      secondaryAction={
                        <Tooltip title="Voir les étudiants">
                          <IconButton edge="end" onClick={() => handleViewGroup(group.id)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      }
                    >
                      <Avatar sx={{ mr: 2, bgcolor: '#3b82f6', width: 40, height: 40 }}>
                        {index + 1}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight="600">
                            Niveau : {group.level?.name || 'N/A'} - Groupe : {group.group_number || 'N/A'}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            👥 {group.students_count || '0'} étudiants
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < groups.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))
              ) : (
                <ListItem sx={{ textAlign: 'center', py: 4 }}>
                  <ListItemText 
                    primary={
                      <Typography variant="h6" color="text.secondary">
                        Aucun groupe assigné
                      </Typography>
                    }
                    secondary="Commencez par créer ou rejoindre un groupe"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Colonne du milieu - Meilleurs Étudiants */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={4} sx={{ height: '100%', borderRadius: 3 }}>
            <Box sx={{ 
              p: 3, 
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderRadius: '12px 12px 0 0' 
            }}>
              <Typography variant="h6" component="h2" fontWeight="600">
                <TrophyIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#f59e0b' }} />
                Classement Étudiants
              </Typography>
            </Box>
            <Divider />
            <List sx={{ overflow: 'auto', maxHeight: 450, p: 0 }}>
              {topStudents.length > 0 ? (
                topStudents.map((student, index) => (
                  <React.Fragment key={student.id}>
                    <ListItem sx={{ py: 2 }}>
                      <Avatar sx={{ 
                        mr: 2, 
                        bgcolor: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : index === 2 ? '#cd7c2f' : '#6b7280',
                        width: 40,
                        height: 40,
                        fontWeight: 'bold'
                      }}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight="600">
                            {student.first_name || ''} {student.last_name || ''}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            🆔 CNE: {student.cne || 'N/A'}
                          </Typography>
                        }
                      />
                      <Chip 
                        icon={<StarIcon />}
                        label={`${student.total_stars || 0} ⭐`}
                        color={index < 3 ? 'warning' : 'default'}
                        size="medium"
                        sx={{ 
                          ml: 1,
                          fontWeight: '600',
                          ...(index < 3 && {
                            background: 'linear-gradient(45deg, #fbbf24 30%, #f59e0b 90%)',
                            color: 'white'
                          })
                        }}
                      />
                    </ListItem>
                    {index < topStudents.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))
              ) : (
                <ListItem sx={{ textAlign: 'center', py: 4 }}>
                  <ListItemText 
                    primary={
                      <Typography variant="h6" color="text.secondary">
                        Aucune donnée d'étudiant
                      </Typography>
                    }
                    secondary="Les performances apparaîtront ici une fois que les étudiants commenceront les évaluations"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Colonne droite - Actions Rapides & Informations */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={3} direction="column">
            {/* Actions Rapides */}
            <Grid item xs={12}>
              <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" component="h2" gutterBottom fontWeight="600" sx={{ mb: 3 }}>
                  ⚡ Actions Rapides
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={handleCreateEvaluation}
                    sx={{ 
                      py: 1.5,
                      background: 'linear-gradient(45deg, #3b82f6 30%, #1d4ed8 90%)',
                      fontWeight: '600',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
                      }
                    }}
                  >
                    Créer une Nouvelle Évaluation
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<AssignmentIcon />}
                    onClick={handleViewEvaluations}
                    sx={{ 
                      py: 1.5,
                      fontWeight: '600',
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-2px)',
                      }
                    }}
                  >
                    Voir Toutes les Évaluations
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    color="secondary"
                    startIcon={<GroupIcon />}
                    onClick={handleViewGroups}
                    sx={{ 
                      py: 1.5,
                      fontWeight: '600',
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-2px)',
                      }
                    }}
                  >
                    Gérer les Groupes
                  </Button>
                </Box>
              </Paper>
            </Grid>
            
            {/* Informations sur la Matière */}
            <Grid item xs={12}>
              <Card elevation={4} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" component="h2" gutterBottom fontWeight="600" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <SchoolIcon sx={{ mr: 1, color: '#8b5cf6' }} />
                    Informations sur la Matière
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                      <Typography variant="body1" fontWeight="600">
                        📚 Matière : <span style={{ color: '#3b82f6' }}>{teacher.subject?.name || 'Non assignée'}</span>
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                      <Typography variant="body1" fontWeight="600">
                        🆔 ID Enseignant : <span style={{ color: '#10b981' }}>{teacher.n_appoge || 'N/A'}</span>
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                      <Typography variant="body1" fontWeight="600">
                        👥 Total Groupes : <span style={{ color: '#f59e0b' }}>{groups.length}</span>
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button 
                    size="medium" 
                    startIcon={<SchoolIcon />}
                    sx={{ fontWeight: '600' }}
                  >
                    Détails de la Matière
                  </Button>
                  <Button 
                    size="medium" 
                    startIcon={<TrendingUpIcon />}
                    sx={{ fontWeight: '600' }}
                  >
                    Statistiques
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TableauDeBordEnseignant;