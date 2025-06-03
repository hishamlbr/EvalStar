import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
  Grid,
  Divider,
  Tooltip,
  Avatar,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { commonAPI, adminAPI } from '../../api/api';
import { toast } from 'react-toastify';

const Groups = () => {
  const theme = useTheme();

  // Données principales
  const [groups, setGroups] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dialogs : ajouter, modifier, supprimer, détails
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  // Formulaire : ajout
  const [newGroup, setNewGroup] = useState({ level_id: '', group_number: '' });
  const [formError, setFormError] = useState('');

  // Formulaire : modification
  const [editingGroup, setEditingGroup] = useState(null);

  // Suppression
  const [deletingGroup, setDeletingGroup] = useState(null);

  // Détails du groupe
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupDetails, setGroupDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Permissions
  const userType = localStorage.getItem('evalstar_user_type');
  const isAdmin = userType === 'admin';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer groupes selon le rôle
      let groupsResponse;
      if (isAdmin) {
        groupsResponse = await adminAPI.getGroups();
      } else {
        groupsResponse = await commonAPI.getGroups();
      }

      // Récupérer tous les niveaux
      const levelsResponse = await commonAPI.getLevels();

      setGroups(groupsResponse.data);
      setLevels(levelsResponse.data);
    } catch (err) {
      console.error('Erreur chargement données groupes :', err);
      const msg = err.response?.data?.message || 'Échec du chargement des données.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getLevelName = (levelId) => {
    const lvl = levels.find((l) => l.id === levelId);
    return lvl ? lvl.name : 'Inconnu';
  };

  // =====================================================
  //  AJOUTER UN GROUPE
  // =====================================================
  const handleOpenAddDialog = () => {
    setNewGroup({ level_id: '', group_number: '' });
    setFormError('');
    setOpenAddDialog(true);
  };
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setFormError('');
  };
  const handleChangeNew = (e) => {
    const { name, value } = e.target;
    setNewGroup({
      ...newGroup,
      [name]: name === 'group_number' ? parseInt(value) || '' : value,
    });
    if (formError) setFormError('');
  };
  const handleSubmitNew = async () => {
    if (!newGroup.level_id) {
      setFormError('Le niveau est requis');
      return;
    }
    if (!newGroup.group_number || newGroup.group_number < 1) {
      setFormError('Le numéro de groupe est requis et doit être supérieur à 0');
      return;
    }
    try {
      await adminAPI.addGroup(newGroup);
      toast.success('Groupe ajouté avec succès');
      handleCloseAddDialog();
      fetchData();
    } catch (err) {
      console.error('Erreur ajout groupe :', err);
      const msg = err.response?.data?.message || "Échec de l'ajout du groupe";
      setFormError(msg);
    }
  };

  // =====================================================
  //  MODIFIER UN GROUPE
  // =====================================================
  const handleOpenEditDialog = (group) => {
    setEditingGroup({ id: group.id, level_id: group.level_id, group_number: group.group_number });
    setFormError('');
    setOpenEditDialog(true);
  };
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditingGroup(null);
    setFormError('');
  };
  const handleChangeEdit = (e) => {
    const { name, value } = e.target;
    setEditingGroup({
      ...editingGroup,
      [name]: name === 'group_number' ? parseInt(value) || '' : value,
    });
    if (formError) setFormError('');
  };
  const handleSubmitEdit = async () => {
    if (!editingGroup.level_id) {
      setFormError('Le niveau est requis');
      return;
    }
    if (!editingGroup.group_number || editingGroup.group_number < 1) {
      setFormError('Le numéro de groupe est requis et doit être supérieur à 0');
      return;
    }
    try {
      await adminAPI.updateGroup(editingGroup.id, {
        level_id: editingGroup.level_id,
        group_number: editingGroup.group_number,
      });
      toast.success('Groupe modifié avec succès');
      handleCloseEditDialog();
      fetchData();
    } catch (err) {
      console.error('Erreur modification groupe :', err);
      const msg = err.response?.data?.message || "Échec de la modification du groupe";
      setFormError(msg);
    }
  };

  // =====================================================
  //  SUPPRIMER UN GROUPE
  // =====================================================
  const handleOpenDeleteDialog = (group) => {
    setDeletingGroup(group);
    setOpenDeleteDialog(true);
  };
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeletingGroup(null);
  };
  const handleConfirmDelete = async () => {
    try {
      await adminAPI.deleteGroup(deletingGroup.id);
      toast.success('Groupe supprimé avec succès');
      handleCloseDeleteDialog();
      fetchData();
    } catch (err) {
      console.error('Erreur suppression groupe :', err);
      const msg = err.response?.data?.message || "Échec de la suppression du groupe";
      toast.error(msg);
    }
  };

  // =====================================================
  //  DÉTAILS D’UN GROUPE
  // =====================================================
  const handleOpenDetailsDialog = (group) => {
    setSelectedGroup(group);
    setOpenDetailsDialog(true);
    fetchGroupDetails(group.id);
  };
  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setSelectedGroup(null);
    setGroupDetails(null);
  };
  const fetchGroupDetails = async (groupId) => {
    try {
      setDetailsLoading(true);
      let response;
      if (isAdmin) {
        response = await adminAPI.getGroup(groupId);
      } else {
        response = await commonAPI.getGroupDetails(groupId);
      }
      setGroupDetails(response.data);
    } catch (err) {
      console.error('Erreur chargement détails groupe :', err);
      toast.error("Erreur lors du chargement des détails du groupe");
      setGroupDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* ====================================================== */}
      {/*        EN-TÊTE AVEC STATISTIQUES ET BOUTON AJOUTER       */}
      {/* ====================================================== */}
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
              Gestion des Groupes
            </Typography>
            <Stack direction="row" spacing={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <SchoolIcon />
                <Typography variant="body1">
                  {groups.length} groupe{groups.length > 1 ? 's' : ''}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <PeopleIcon />
                <Typography variant="body1">
                  {groupDetails
                    ? (groupDetails.students_count || 0) + ' étudiant(s)'
                    : `${groups.reduce((sum, g) => sum + (g.students_count || 0), 0)} étudiant(s)`}
                </Typography>
              </Box>
            </Stack>
          </Box>
          {isAdmin && (
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
              Nouveau Groupe
            </Button>
          )}
        </Stack>
      </Paper>

      {/* ====================================================== */}
      {/*             AFFICHAGE D’ERREUR SI BESOIN               */}
      {/* ====================================================== */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* ====================================================== */}
      {/*                  TABLEAU DES GROUPES                   */}
      {/* ====================================================== */}
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
                <TableCell sx={{ fontWeight: 'bold' }}>Niveau</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Groupe</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Classe</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Étudiants</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Enseignants</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groups.length > 0 ? (
                groups.map((group, idx) => (
                  <TableRow
                    key={group.id}
                    hover
                    sx={{
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        transform: 'scale(1.01)',
                        transition: 'all 0.2s ease',
                      },
                    }}
                  >
                    <TableCell>{group.id}</TableCell>
                    <TableCell>
                      <Chip
                        label={getLevelName(group.level_id)}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`G ${group.group_number}`}
                        color="secondary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {`${getLevelName(group.level_id)}/${group.group_number}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={group.students_count || 0}
                        color="info"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={group.teachers_count || 0}
                        color="warning"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="Voir détails" arrow>
                          <IconButton
                            color="info"
                            size="small"
                            onClick={() => handleOpenDetailsDialog(group)}
                            sx={{ '&:hover': { transform: 'scale(1.1)' } }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        {isAdmin && (
                          <>
                            <Tooltip title="Modifier" arrow>
                              <IconButton
                                color="success"
                                size="small"
                                onClick={() => handleOpenEditDialog(group)}
                                sx={{ '&:hover': { transform: 'scale(1.1)' } }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer" arrow>
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleOpenDeleteDialog(group)}
                                sx={{ '&:hover': { transform: 'scale(1.1)' } }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                      Aucun groupe trouvé.
                    </Typography>
                    {isAdmin && (
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenAddDialog}
                        sx={{ mt: 2 }}
                      >
                        Ajouter un groupe
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ====================================================== */}
      {/*        DIALOG AJOUTER UN GROUPE (Admins seulement)      */}
      {/* ====================================================== */}
      {isAdmin && (
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
              <Typography variant="h5">Nouveau Groupe</Typography>
            </Stack>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}
            <FormControl fullWidth margin="dense">
              <InputLabel id="add-level-label">Niveau</InputLabel>
              <Select
                labelId="add-level-label"
                name="level_id"
                value={newGroup.level_id}
                label="Niveau"
                onChange={handleChangeNew}
                error={!!formError && formError.includes('niveau')}
              >
                {levels.map((lvl) => (
                  <MenuItem key={lvl.id} value={lvl.id}>
                    {lvl.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              name="group_number"
              label="Numéro du groupe"
              type="number"
              fullWidth
              variant="outlined"
              value={newGroup.group_number}
              onChange={handleChangeNew}
              error={!!formError && formError.includes('numéro')}
              inputProps={{ min: 1 }}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseAddDialog} size="large">
              Annuler
            </Button>
            <Button onClick={handleSubmitNew} variant="contained" size="large">
              Ajouter
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* ====================================================== */}
      {/*      DIALOG MODIFIER UN GROUPE (Admins seulement)        */}
      {/* ====================================================== */}
      {isAdmin && (
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
              <Typography variant="h5">Modifier le Groupe</Typography>
            </Stack>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}
            <FormControl fullWidth margin="dense">
              <InputLabel id="edit-level-label">Niveau</InputLabel>
              <Select
                labelId="edit-level-label"
                name="level_id"
                value={editingGroup?.level_id || ''}
                label="Niveau"
                onChange={handleChangeEdit}
                error={!!formError && formError.includes('niveau')}
              >
                {levels.map((lvl) => (
                  <MenuItem key={lvl.id} value={lvl.id}>
                    {lvl.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              name="group_number"
              label="Numéro du groupe"
              type="number"
              fullWidth
              variant="outlined"
              value={editingGroup?.group_number || ''}
              onChange={handleChangeEdit}
              error={!!formError && formError.includes('numéro')}
              inputProps={{ min: 1 }}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseEditDialog} size="large">
              Annuler
            </Button>
            <Button onClick={handleSubmitEdit} variant="contained" size="large">
              Modifier
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* ====================================================== */}
      {/*   DIALOG CONFIRMATION SUPPRESSION (Admins seulement)   */}
      {/* ====================================================== */}
      {isAdmin && (
        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} maxWidth="sm" fullWidth>
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
            <DialogContentText>
              Êtes-vous sûr de vouloir supprimer le groupe{' '}
              <strong>
                {deletingGroup &&
                  `${getLevelName(deletingGroup.level_id)}/${deletingGroup.group_number}`}
              </strong>
              ? Cette action est irréversible.
            </DialogContentText>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDeleteDialog} variant="outlined" size="large">
              Annuler
            </Button>
            <Button onClick={handleConfirmDelete} color="error" variant="contained" size="large">
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* ====================================================== */}
      {/*      DIALOG DÉTAILS D’UN GROUPE                          */}
      {/* ====================================================== */}
      <Dialog open={openDetailsDialog} onClose={handleCloseDetailsDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Détails du groupe{' '}
              {selectedGroup &&
                `${getLevelName(selectedGroup.level_id)}/${selectedGroup.group_number}`}
            </Typography>
            <IconButton onClick={handleCloseDetailsDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          {detailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : groupDetails ? (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <SchoolIcon color="primary" />
                        <Typography variant="h6">Informations générales</Typography>
                      </Stack>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        ID : {selectedGroup.id}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Niveau :</strong> {getLevelName(selectedGroup.level_id)}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Numéro du groupe :</strong> {selectedGroup.group_number}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Classe :</strong>{' '}
                        {`${getLevelName(selectedGroup.level_id)}/${selectedGroup.group_number}`}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <PeopleIcon color="secondary" />
                        <Typography variant="h6">Statistiques</Typography>
                      </Stack>
                      <Typography variant="body1" gutterBottom>
                        <strong>Nombre d'étudiants :</strong> {groupDetails.students_count || 0}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Enseignants assignés :</strong> {groupDetails.teachers_count || 0}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Tâches disponibles :</strong> {groupDetails.tasks_count || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {groupDetails.students && groupDetails.students.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Étudiants dans ce groupe
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>CNE</TableCell>
                          <TableCell>Nom complet</TableCell>
                          <TableCell>Étoiles totales</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {groupDetails.students.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>{student.cne}</TableCell>
                            <TableCell>
                              {student.first_name} {student.last_name}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={student.total_stars || 0}
                                color="warning"
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {groupDetails.teachers && groupDetails.teachers.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Enseignants assignés
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>N° Apogée</TableCell>
                          <TableCell>Nom complet</TableCell>
                          <TableCell>Matière</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {groupDetails.teachers.map((teacher) => (
                          <TableRow key={teacher.id}>
                            <TableCell>{teacher.n_appoge}</TableCell>
                            <TableCell>
                              {teacher.first_name} {teacher.last_name}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={teacher.subject?.name || 'N/A'}
                                color="primary"
                                variant="outlined"
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          ) : (
            <Alert severity="info">Aucun détail disponible pour ce groupe.</Alert>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Groups;
