import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Avatar,
  Grid,
  Chip,
  Tooltip,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Divider,
  Fade,
  Zoom,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { commonAPI, adminAPI } from '../../api/api';
import { toast } from 'react-toastify';

const Levels = () => {
  const theme = useTheme();

  // Données principales
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dialogs
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openStudentsDialog, setOpenStudentsDialog] = useState(false);

  // Formulaires
  const [newLevel, setNewLevel] = useState({ name: '' });
  const [editLevel, setEditLevel] = useState({ id: null, name: '' });
  const [deleteLevel, setDeleteLevel] = useState({ id: null, name: '' });

  // Niveau sélectionné pour voir les étudiants
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedLevelStudents, setSelectedLevelStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Erreurs de formulaire
  const [formError, setFormError] = useState('');

  // Au montage, récupérer tous les niveaux
  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getLevels();
      setLevels(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur récupération niveaux adminAPI:', err);
      // fallback sur commonAPI si besoin
      try {
        const fallback = await commonAPI.getLevels();
        setLevels(fallback.data);
        setError(null);
      } catch (fallbackErr) {
        console.error('Fallback error récupération niveaux:', fallbackErr);
        setError("Échec du chargement des niveaux. Veuillez réessayer ultérieurement.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Récupérer la liste des étudiants pour un niveau donné
  const fetchLevelStudents = async (levelId) => {
    try {
      setStudentsLoading(true);
      const response = await adminAPI.getLevel(levelId);
      const students = response.data.students || [];
      setSelectedLevelStudents(students);
    } catch (err) {
      console.error('Erreur récupération étudiants du niveau:', err);
      toast.error("Erreur lors du chargement des étudiants");
      setSelectedLevelStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Helper pour obtenir la valeur d'un compteur (étudiants ou groupes)
  const getCount = (level, countType) => {
    if (level[countType] !== undefined) {
      return level[countType];
    }
    if (level[`${countType}_count`] !== undefined) {
      return level[`${countType}_count`];
    }
    return 0;
  };

  // Sommes totales pour l'en-tête
  const totalStudents = useMemo(
    () => levels.reduce((sum, lvl) => sum + getCount(lvl, 'students'), 0),
    [levels]
  );
  const totalGroups = useMemo(
    () => levels.reduce((sum, lvl) => sum + getCount(lvl, 'groups'), 0),
    [levels]
  );

  // =============================================================================
  // GESTION DIALOG ADD LEVEL
  // =============================================================================
  const handleOpenAddDialog = () => {
    setFormError('');
    setNewLevel({ name: '' });
    setOpenAddDialog(true);
  };
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };
  const handleChangeNew = (e) => {
    setNewLevel({ ...newLevel, [e.target.name]: e.target.value });
  };
  const handleSubmitNew = async () => {
    if (!newLevel.name.trim()) {
      setFormError("Le nom du niveau est requis");
      return;
    }
    try {
      await adminAPI.addLevel(newLevel);
      toast.success("Niveau ajouté avec succès");
      handleCloseAddDialog();
      fetchLevels();
    } catch (err) {
      console.error('Erreur ajout niveau:', err);
      const msg = err.response?.data?.message || "Échec de l'ajout du niveau";
      setFormError(msg);
    }
  };

  // =============================================================================
  // GESTION DIALOG EDIT LEVEL
  // =============================================================================
  const handleOpenEditDialog = (level) => {
    setFormError('');
    setEditLevel({ id: level.id, name: level.name });
    setOpenEditDialog(true);
  };
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditLevel({ id: null, name: '' });
  };
  const handleChangeEdit = (e) => {
    setEditLevel({ ...editLevel, [e.target.name]: e.target.value });
  };
  const handleSubmitEdit = async () => {
    if (!editLevel.name.trim()) {
      setFormError("Le nom du niveau est requis");
      return;
    }
    try {
      await adminAPI.updateLevel(editLevel.id, { name: editLevel.name });
      toast.success("Niveau modifié avec succès");
      handleCloseEditDialog();
      fetchLevels();
    } catch (err) {
      console.error('Erreur modification niveau:', err);
      const msg = err.response?.data?.message || "Échec de la modification du niveau";
      setFormError(msg);
    }
  };

  // =============================================================================
  // GESTION DIALOG DELETE LEVEL
  // =============================================================================
  const handleOpenDeleteDialog = (level) => {
    setDeleteLevel({ id: level.id, name: level.name });
    setOpenDeleteDialog(true);
  };
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeleteLevel({ id: null, name: '' });
  };
  const handleSubmitDelete = async () => {
    try {
      await adminAPI.deleteLevel(deleteLevel.id);
      toast.success("Niveau supprimé avec succès");
      handleCloseDeleteDialog();
      fetchLevels();
    } catch (err) {
      console.error('Erreur suppression niveau:', err);
      const msg = err.response?.data?.message || "Échec de la suppression du niveau";
      toast.error(msg);
    }
  };

  // =============================================================================
  // GESTION DIALOG VIEW STUDENTS
  // =============================================================================
  const handleViewStudents = async (level) => {
    setSelectedLevel(level);
    setOpenStudentsDialog(true);
    await fetchLevelStudents(level.id);
  };
  const handleCloseStudentsDialog = () => {
    setOpenStudentsDialog(false);
    setSelectedLevel(null);
    setSelectedLevelStudents([]);
  };

  // =============================================================================
  // JSX PRINCIPAL
  // =============================================================================
  return (
    <Box sx={{ p: 3 }}>
      {/* ================================================ */}
      {/*   EN-TÊTE AVEC STATISTIQUES ET BOUTON AJOUTER   */}
      {/* ================================================ */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          borderRadius: 2,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Gestion des niveaux scolaires
            </Typography>
            <Stack direction="row" spacing={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <SchoolIcon />
                <Typography variant="body1">
                  {levels.length} niveau{levels.length > 1 ? 'x' : ''}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <PersonIcon />
                <Typography variant="body1">
                  {totalStudents} élève{totalStudents > 1 ? 's' : ''}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <GroupIcon />
                <Typography variant="body1">
                  {totalGroups} groupe{totalGroups > 1 ? 's' : ''}
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            sx={{
              bgcolor: 'white',
              color: theme.palette.primary.main,
              '&:hover': {
                bgcolor: alpha(theme.palette.common.white, 0.9),
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[8],
              },
              transition: 'all 0.3s ease',
            }}
          >
            Nouveau niveau
          </Button>
        </Stack>
      </Paper>

      {/* ================================= */}
      {/*        AFFICHAGE DES ERREURS       */}
      {/* ================================= */}
      {error && (
        <Fade in={!!error}>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        </Fade>
      )}

      {/* ================================= */}
      {/*        TABLEAU DES NIVEAUX          */}
      {/* ================================= */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
          <CircularProgress size={48} />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Nom du niveau</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Élèves</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Groupes</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {levels.length > 0 ? (
                levels.map((level, index) => (
                  <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }} key={level.id}>
                    <TableRow
                      hover
                      sx={{
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          transform: 'scale(1.01)',
                          transition: 'all 0.2s ease',
                        },
                      }}
                    >
                      {/* ID */}
                      <TableCell>{level.id}</TableCell>

                      {/* Nom du niveau */}
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <SchoolIcon color="primary" />
                          <Typography variant="body1" fontWeight="medium">
                            {level.name}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* Nombre d'élèves */}
                      <TableCell>
                        <Chip
                          label={`${getCount(level, 'students')} élève${getCount(level, 'students') > 1 ? 's' : ''}`}
                          color="primary"
                          variant="outlined"
                          size="small"
                          icon={<PersonIcon fontSize="small" />}
                        />
                      </TableCell>

                      {/* Nombre de groupes */}
                      <TableCell>
                        <Chip
                          label={`${getCount(level, 'groups')} groupe${getCount(level, 'groups') > 1 ? 's' : ''}`}
                          color="secondary"
                          variant="outlined"
                          size="small"
                          icon={<GroupIcon fontSize="small" />}
                        />
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Voir les élèves" arrow>
                            <IconButton
                              color="info"
                              size="small"
                              onClick={() => handleViewStudents(level)}
                              sx={{ '&:hover': { transform: 'scale(1.1)' } }}
                            >
                              <PersonIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Modifier" arrow>
                            <IconButton
                              color="success"
                              size="small"
                              onClick={() => handleOpenEditDialog(level)}
                              sx={{ '&:hover': { transform: 'scale(1.1)' } }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer" arrow>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleOpenDeleteDialog(level)}
                              sx={{ '&:hover': { transform: 'scale(1.1)' } }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  </Zoom>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Stack alignItems="center" spacing={2}>
                      <SchoolIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
                      <Typography variant="h6" color="text.secondary">
                        Aucun niveau trouvé.
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenAddDialog}
                      >
                        Ajouter un niveau
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ==================================================================== */}
      {/* DIALOG ADD NEW LEVEL */}
      {/* ==================================================================== */}
      <Dialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
              <AddIcon />
            </Avatar>
            <Typography variant="h5">Nouveau Niveau</Typography>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Nom du niveau"
            type="text"
            fullWidth
            variant="outlined"
            value={newLevel.name}
            onChange={handleChangeNew}
            error={!!formError}
            placeholder="Ex : 1ère année, 2ᵉ année, Licence 1..."
          />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseAddDialog} size="large">
            Annuler
          </Button>
          <Button
            onClick={handleSubmitNew}
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={20} /> : null}
            disabled={loading}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================================================================== */}
      {/* DIALOG EDIT LEVEL */}
      {/* ==================================================================== */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'warning.main' }}>
              <EditIcon />
            </Avatar>
            <Typography variant="h5">Modifier le Niveau</Typography>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Nom du niveau"
            type="text"
            fullWidth
            variant="outlined"
            value={editLevel.name}
            onChange={handleChangeEdit}
            error={!!formError}
            placeholder="Ex : 1ère année, 2ᵉ année, Licence 1..."
          />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseEditDialog} size="large">
            Annuler
          </Button>
          <Button
            onClick={handleSubmitEdit}
            variant="contained"
            color="warning"
            size="large"
            startIcon={loading ? <CircularProgress size={20} /> : null}
            disabled={loading}
          >
            Mettre à jour
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================================================================== */}
      {/* DIALOG DELETE CONFIRMATION LEVEL */}
      {/* ==================================================================== */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'error.main' }}>
              <DeleteIcon />
            </Avatar>
            <Typography variant="h6">Confirmer la suppression</Typography>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Cette action est irréversible !
          </Alert>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer le niveau{' '}
            <strong>"{deleteLevel.name}"</strong> ?
            <br />
            <em>
              Vous ne pourrez supprimer ce niveau que s’il ne contient aucun
              élève ou groupe.
            </em>
          </DialogContentText>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDeleteDialog} variant="outlined" size="large">
            Annuler
          </Button>
          <Button
            onClick={handleSubmitDelete}
            variant="contained"
            color="error"
            size="large"
            startIcon={loading ? <CircularProgress size={20} /> : <DeleteIcon />}
            disabled={loading}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================================================================== */}
      {/* DIALOG VIEW STUDENTS OF LEVEL */}
      {/* ==================================================================== */}
      <Dialog
        open={openStudentsDialog}
        onClose={handleCloseStudentsDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h5">
                Élèves du niveau {selectedLevel?.name}
              </Typography>
              {selectedLevel && (
                <Typography variant="subtitle2" color="text.secondary">
                  Total&nbsp;: {getCount(selectedLevel, 'students')} élève
                  {getCount(selectedLevel, 'students') > 1 ? 's' : ''}
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          {studentsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {selectedLevelStudents.length > 0 ? (
                <Grid container spacing={2}>
                  {selectedLevelStudents.map((student) => (
                    <Grid item xs={12} sm={6} md={4} key={student.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <PersonIcon color="primary" />
                            <Typography variant="subtitle1" fontWeight="medium">
                              {student.first_name} {student.last_name}
                            </Typography>
                          </Stack>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            <strong>CNE :</strong> {student.cne || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Groupe :</strong> {student.group?.group_number || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Étoiles :</strong> {student.total_stars || 0}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Aucun élève trouvé dans ce niveau.
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseStudentsDialog} size="large">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Levels;
