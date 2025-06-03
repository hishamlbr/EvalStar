import React, { useState, useEffect } from 'react';
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
  Zoom,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  Tooltip,
  Avatar,
  Stack,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { commonAPI, adminAPI } from '../../api/api';
import { toast } from 'react-toastify';

const Matieres = () => {
  const theme = useTheme();

  // Données principales
  const [matieres, setMatieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

  // Dialogs : ajouter/modifier, supprimer, montrer enseignants
  const [openAddEditDialog, setOpenAddEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openTeachersDialog, setOpenTeachersDialog] = useState(false);

  // Formulaire : ajout / modification
  const [dialogMode, setDialogMode] = useState('add'); // 'add' ou 'edit'
  const [nouvelleMatiere, setNouvelleMatiere] = useState({ name: '' });
  const [matiereModif, setMatiereModif] = useState(null);
  const [formError, setFormError] = useState('');

  // Suppression
  const [matiereASupprimer, setMatiereASupprimer] = useState(null);

  // Afficher enseignants pour une matière donnée
  const [subjectTeachers, setSubjectTeachers] = useState([]);
  const [selectedMatiere, setSelectedMatiere] = useState(null);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [teachersError, setTeachersError] = useState(null);

  // Récupérer toutes les matières au montage
  useEffect(() => {
    fetchMatieres();
  }, []);

  const fetchMatieres = async () => {
    try {
      setLoading(true);
      const response = await commonAPI.getSubjects();
      setMatieres(response.data);
      setErreur(null);
    } catch (err) {
      console.error('Erreur récupération des matières :', err);
      setErreur('Échec du chargement des matières. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  // ====================================================================
  //  DIALOG AJOUTER / MODIFIER MATIÈRE
  // ====================================================================
  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setNouvelleMatiere({ name: '' });
    setMatiereModif(null);
    setFormError('');
    setOpenAddEditDialog(true);
  };
  const handleOpenEditDialog = (matiere) => {
    setDialogMode('edit');
    setNouvelleMatiere({ name: matiere.name });
    setMatiereModif(matiere);
    setFormError('');
    setOpenAddEditDialog(true);
  };
  const handleCloseAddEditDialog = () => {
    setOpenAddEditDialog(false);
    setNouvelleMatiere({ name: '' });
    setMatiereModif(null);
    setFormError('');
  };
  const handleChangeMatiere = (e) => {
    setNouvelleMatiere({ ...nouvelleMatiere, [e.target.name]: e.target.value });
  };
  const handleSubmitAddEdit = async () => {
    if (!nouvelleMatiere.name.trim()) {
      setFormError('Le nom de la matière est requis');
      return;
    }
    try {
      if (dialogMode === 'edit' && matiereModif) {
        await adminAPI.updateSubject(matiereModif.id, nouvelleMatiere);
        toast.success('Matière modifiée avec succès');
      } else {
        await adminAPI.addSubject(nouvelleMatiere);
        toast.success('Matière ajoutée avec succès');
      }
      handleCloseAddEditDialog();
      fetchMatieres();
    } catch (err) {
      console.error('Erreur opération matière :', err);
      const msg =
        err.response?.data?.message ||
        (dialogMode === 'edit'
          ? 'Échec de la modification de la matière'
          : 'Échec de l’ajout de la matière');
      setFormError(msg);
    }
  };

  // ====================================================================
  //  DIALOG SUPPRESSION
  // ====================================================================
  const handleOpenDeleteDialog = (matiere) => {
    setMatiereASupprimer(matiere);
    setOpenDeleteDialog(true);
  };
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setMatiereASupprimer(null);
  };
  const handleSubmitDelete = async () => {
    if (!matiereASupprimer) return;
    try {
      await adminAPI.deleteSubject(matiereASupprimer.id);
      toast.success('Matière supprimée avec succès');
      handleCloseDeleteDialog();
      fetchMatieres();
    } catch (err) {
      console.error('Erreur suppression matière :', err);
      const msg = err.response?.data?.message || 'Échec de la suppression de la matière';
      toast.error(msg);
    }
  };

  // ====================================================================
  //  DIALOG AFFICHER ENSEIGNANTS DE LA MATIÈRE
  // ====================================================================
  const handleOpenTeachersDialog = async (matiere) => {
    setSelectedMatiere(matiere);
    setOpenTeachersDialog(true);
    setTeachersLoading(true);
    setTeachersError(null);

    try {
      // L’API GET /subjects/{id} renvoie { id, name, teachers: [...] }
      const response = await commonAPI.getSubject(matiere.id);
      const teachers = response.data.teachers || [];
      setSubjectTeachers(teachers);
    } catch (err) {
      console.error('Erreur récupération enseignants de la matière :', err);
      setTeachersError('Impossible de charger la liste des enseignants.');
      setSubjectTeachers([]);
    } finally {
      setTeachersLoading(false);
    }
  };
  const handleCloseTeachersDialog = () => {
    setOpenTeachersDialog(false);
    setSelectedMatiere(null);
    setSubjectTeachers([]);
    setTeachersError(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* ====================================================== */}
      {/*   EN-TÊTE AVEC STATISTIQUES ET BOUTON AJOUTER   */}
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
              Gestion des Matières
            </Typography>
            <Stack direction="row" spacing={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <SchoolIcon />
                <Typography variant="body1">
                  {matieres.length} matière{matieres.length > 1 ? 's' : ''}
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
            Nouvelle Matière
          </Button>
        </Stack>
      </Paper>

      {/* ====================================================== */}
      {/*                  AFFICHAGE D’ERREUR                    */}
      {/* ====================================================== */}
      {erreur && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {erreur}
        </Alert>
      )}

      {/* ====================================================== */}
      {/*                 TABLEAU DES MATIÈRES                   */}
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
                <TableCell sx={{ fontWeight: 'bold' }}>Nom</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {matieres.length > 0 ? (
                matieres.map((matiere, index) => (
                  <Zoom in key={matiere.id} style={{ transitionDelay: `${index * 100}ms` }}>
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
                      <TableCell>{matiere.id}</TableCell>
                      <TableCell>{matiere.name}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          {/* Afficher enseignants de cette matière */}
                          <Tooltip title="Voir les enseignants" arrow>
                            <IconButton
                              color="info"
                              size="small"
                              onClick={() => handleOpenTeachersDialog(matiere)}
                              sx={{ '&:hover': { transform: 'scale(1.1)' } }}
                            >
                              <PersonIcon />
                            </IconButton>
                          </Tooltip>
                          {/* Modifier */}
                          <Tooltip title="Modifier" arrow>
                            <IconButton
                              color="success"
                              size="small"
                              onClick={() => handleOpenEditDialog(matiere)}
                              sx={{ '&:hover': { transform: 'scale(1.1)' } }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          {/* Supprimer */}
                          <Tooltip title="Supprimer" arrow>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleOpenDeleteDialog(matiere)}
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
                  <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                    <Stack alignItems="center" spacing={2}>
                      <SchoolIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
                      <Typography variant="h6" color="text.secondary">
                        Aucune matière trouvée.
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenAddDialog}
                      >
                        Ajouter une matière
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
      {/*    DIALOG AJOUTER / MODIFIER MATIÈRE    */}
      {/* ==================================================================== */}
      <Dialog
        open={openAddEditDialog}
        onClose={handleCloseAddEditDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              sx={{
                bgcolor: dialogMode === 'edit' ? 'warning.main' : theme.palette.primary.main,
              }}
            >
              {dialogMode === 'edit' ? <EditIcon /> : <AddIcon />}
            </Avatar>
            <Typography variant="h5">
              {dialogMode === 'edit' ? 'Modifier la Matière' : 'Nouvelle Matière'}
            </Typography>
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
            label="Nom de la Matière"
            type="text"
            fullWidth
            variant="outlined"
            value={nouvelleMatiere.name}
            onChange={handleChangeMatiere}
            error={!!formError}
            placeholder="Ex : Informatique, Mathématiques..."
          />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseAddEditDialog} size="large">
            Annuler
          </Button>
          <Button
            onClick={handleSubmitAddEdit}
            variant="contained"
            size="large"
            startIcon={
              loading && openAddEditDialog ? <CircularProgress size={20} /> : null
            }
            disabled={loading}
          >
            {dialogMode === 'edit' ? 'Mettre à Jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================================================================== */}
      {/*        DIALOG CONFIRMATION SUPPRESSION MATIÈRE        */}
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
            Êtes-vous sûr de vouloir supprimer la matière{' '}
            <strong>"{matiereASupprimer?.name}"</strong> ?
            <br />
            Tous les liens associés à cette matière seront perdus.
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
            startIcon={loading && openDeleteDialog ? <CircularProgress size={20} /> : <DeleteIcon />}
            disabled={loading}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================================================================== */}
      {/*    DIALOG AFFICHER ENSEIGNANTS DE LA MATIÈRE    */}
      {/* ==================================================================== */}
      <Dialog
        open={openTeachersDialog}
        onClose={handleCloseTeachersDialog}
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
                Enseignants pour “{selectedMatiere?.name}”
              </Typography>
              {selectedMatiere && (
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                  Total&nbsp;: {subjectTeachers.length} enseignant
                  {subjectTeachers.length > 1 ? 's' : ''}
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          {teachersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : teachersError ? (
            <Alert severity="error">{teachersError}</Alert>
          ) : subjectTeachers.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Avatar</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nom</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>N° Appoge</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subjectTeachers.map((teacher, idx) => (
                    <Zoom
                      in
                      key={teacher.id}
                      style={{ transitionDelay: `${idx * 50}ms` }}
                    >
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
                        <TableCell>
                          <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                            {`${teacher.first_name.charAt(0)}${teacher.last_name
                              .charAt(0)
                              .toUpperCase()}`}
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          {teacher.first_name} {teacher.last_name}
                        </TableCell>
                        <TableCell>{teacher.n_appoge || 'N/A'}</TableCell>
                      </TableRow>
                    </Zoom>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">Aucun enseignant trouvé pour cette matière.</Alert>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseTeachersDialog} size="large">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Matieres;
