// src/pages/teacher/Tasks.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  Tooltip,
  Alert,
  Card,
  CardContent,
  Grid,
  Avatar,
  Badge,
  LinearProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon,
  AccessTime as ClockIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { teacherAPI } from '../../api/api';
import { formatDate, getStarIcons } from '../../utils/helpers';

const Tasks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await teacherAPI.getTasks(user.id);
        setTasks(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des évaluations:', err);
        setError('Échec du chargement des évaluations. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchTasks();
    }
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event, task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const handleEditTask = () => {
    navigate(`/teacher/tasks/edit/${selectedTask.id}`);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setTaskToDelete(selectedTask);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;

    setDeleting(true);
    try {
      await teacherAPI.deleteTask(user.id, taskToDelete.id);
      setTasks(tasks.filter(task => task.id !== taskToDelete.id));
      setSnackbar({
        open: true,
        message: 'Évaluation supprimée avec succès',
        severity: 'success'
      });
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la suppression de l\'évaluation';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filtrer les évaluations selon l'onglet
  const filterTasks = () => {
    const now = new Date();
    
    switch(tabValue) {
      case 0: // Toutes les évaluations
        return tasks;
      case 1: // Évaluations actives
        return tasks.filter(task => !task.deadline || new Date(task.deadline) > now);
      case 2: // Évaluations expirées
        return tasks.filter(task => task.deadline && new Date(task.deadline) < now);
      default:
        return tasks;
    }
  };

  const getStatusChip = (task) => {
    const now = new Date();
    const deadline = task.deadline ? new Date(task.deadline) : null;
    
    if (!deadline) {
      return <Chip size="small" label="Aucune échéance" color="primary" variant="outlined" />;
    } else if (deadline < now) {
      return <Chip size="small" icon={<WarningIcon />} label="Expirée" color="error" />;
    } else {
      const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
      const color = daysLeft <= 3 ? 'warning' : 'success';
      return (
        <Chip 
          size="small" 
          icon={<ClockIcon />} 
          label={`${daysLeft} jour${daysLeft !== 1 ? 's' : ''} restant${daysLeft !== 1 ? 's' : ''}`} 
          color={color}
        />
      );
    }
  };

  const getTaskStats = () => {
    const now = new Date();
    const total = tasks.length;
    const active = tasks.filter(task => !task.deadline || new Date(task.deadline) > now).length;
    const expired = tasks.filter(task => task.deadline && new Date(task.deadline) < now).length;
    const noDeadline = tasks.filter(task => !task.deadline).length;
    
    return { total, active, expired, noDeadline };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
        <CircularProgress size={48} />
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          Chargement des évaluations...
        </Typography>
      </Box>
    );
  }

  const stats = getTaskStats();

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* En-tête avec dégradé */}
      <Paper 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 4,
          mb: 4,
          borderRadius: 3
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 3, width: 56, height: 56 }}>
              <AssignmentIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" gutterBottom fontWeight="bold">
                Gestion des Évaluations
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Créez et gérez les évaluations pour vos étudiants.
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              px: 3,
              py: 1.5
            }}
            onClick={() => navigate('/teacher/tasks/create')}
          >
            Créer une Nouvelle Évaluation
          </Button>
        </Box>
      </Paper>

      {/* Cartes de statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssignmentIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.total}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Total Évaluations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.active}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Évaluations Actives
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <WarningIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.expired}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Évaluations Expirées
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.noDeadline}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Sans Échéance
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={6} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="onglets d'évaluations"
            sx={{ px: 2 }}
          >
            <Tab 
              label={
                <Badge badgeContent={stats.total} color="primary" sx={{ '& .MuiBadge-badge': { right: -3, top: 3 } }}>
                  Toutes les Évaluations
                </Badge>
              } 
              icon={<AssignmentIcon />} 
              iconPosition="start" 
            />
            <Tab 
              label={
                <Badge badgeContent={stats.active} color="success" sx={{ '& .MuiBadge-badge': { right: -3, top: 3 } }}>
                  Évaluations Actives
                </Badge>
              } 
              icon={<StarIcon />} 
              iconPosition="start" 
            />
            <Tab 
              label={
                <Badge badgeContent={stats.expired} color="error" sx={{ '& .MuiBadge-badge': { right: -3, top: 3 } }}>
                  Évaluations Expirées
                </Badge>
              } 
              icon={<ClockIcon />} 
              iconPosition="start" 
            />
          </Tabs>
        </Box>

        {tasks.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Avatar sx={{ mx: 'auto', mb: 3, bgcolor: 'grey.100', width: 80, height: 80 }}>
              <AssignmentIcon sx={{ fontSize: 40, color: 'grey.400' }} />
            </Avatar>
            <Typography variant="h5" gutterBottom fontWeight="bold" color="text.secondary">
              Aucune Évaluation Disponible
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 400, mx: 'auto' }}>
              Vous n'avez pas encore créé d'évaluations. Commencez par créer votre première évaluation pour vos étudiants.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              sx={{ mt: 2, px: 4, py: 1.5 }}
              onClick={() => navigate('/teacher/tasks/create')}
            >
              Créer Votre Première Évaluation
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell width="35%" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                    Titre de l'Évaluation
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                    Groupes
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                    Étoiles Max
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                    Échéance
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                    Statut
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filterTasks().map((task, index) => (
                  <TableRow 
                    key={task.id} 
                    hover
                    sx={{ 
                      '&:hover': { bgcolor: 'action.hover' },
                      '&:nth-of-type(odd)': { bgcolor: 'grey.25' }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            mr: 2, 
                            bgcolor: 'primary.main', 
                            width: 40, 
                            height: 40,
                            fontSize: '0.875rem'
                          }}
                        >
                          {index + 1}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="bold" sx={{ mb: 0.5 }}>
                            {task.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Créée le {formatDate(task.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {task.groups.map((group) => (
                          <Chip
                            key={group.id}
                            size="small"
                            icon={<GroupIcon />}
                            label={`${group.level.name}/${group.group_number}`}
                            variant="outlined"
                            color="primary"
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getStarIcons(task.max_stars)}
                        <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                          ({task.max_stars})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {task.deadline ? formatDate(task.deadline) : 'Aucune échéance'}
                        </Typography>
                        {task.deadline && (
                          <LinearProgress 
                            variant="determinate" 
                            value={new Date(task.deadline) < new Date() ? 100 : 
                              Math.max(0, 100 - ((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24 * 7)) * 100)}
                            sx={{ mt: 1, height: 4, borderRadius: 2 }}
                            color={new Date(task.deadline) < new Date() ? 'error' : 'success'}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {getStatusChip(task)}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="Voir les Détails" arrow>
                          <IconButton
                            color="primary"
                            sx={{ 
                              bgcolor: 'primary.50',
                              '&:hover': { bgcolor: 'primary.100' }
                            }}
                            onClick={() => navigate(`/teacher/tasks/${task.id}`)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Plus d'actions" arrow>
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, task)}
                            sx={{
                              bgcolor: 'grey.100',
                              '&:hover': { bgcolor: 'grey.200' }
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {filterTasks().length === 0 && tasks.length > 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Aucune évaluation trouvée pour ce filtre
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Essayez de sélectionner un autre onglet
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Menu contextuel */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEditTask}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Modifier</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>Supprimer</ListItemText>
        </MenuItem>
      </Menu>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Êtes-vous sûr de vouloir supprimer l'évaluation "{taskToDelete?.title}" ?
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Annuler
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Tasks;