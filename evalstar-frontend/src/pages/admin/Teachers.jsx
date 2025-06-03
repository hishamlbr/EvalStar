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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Grid,
  Card,
  CardContent,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Tooltip,
  InputAdornment,
  Avatar,
  Stack,
  Divider,
  Fade,
  Zoom,
  Badge,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Add as AddIcon, 
  Visibility as VisibilityIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Group as GroupIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { adminAPI, commonAPI } from '../../api/api';

const HAUTEUR_ELEMENT = 48;
const ESPACEMENT_HAUT = 8;
const ProprietesMenu = {
  PaperProps: {
    style: {
      maxHeight: HAUTEUR_ELEMENT * 4.5 + ESPACEMENT_HAUT,
      width: 300,
    },
  },
};

const Enseignants = () => {
  const theme = useTheme();
  const [enseignants, setEnseignants] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  
  // États de recherche et filtrage
  const [rechercheTexte, setRechercheTexte] = useState('');
  const [filtrMatiere, setFiltrMatiere] = useState('');
  
  // État du formulaire
  const [ouvert, setOuvert] = useState(false);
  const [modeModification, setModeModification] = useState(false);
  const [donneesFormulaire, setDonneesFormulaire] = useState({
    id: null,
    n_appoge: '',
    first_name: '',
    last_name: '',
    password: '',
    subject_id: '',
    groups: []
  });
  
  // Dialogue de confirmation de suppression
  const [dialogueSuppressionOuvert, setDialogueSuppressionOuvert] = useState(false);
  const [enseignantASupprimer, setEnseignantASupprimer] = useState(null);
  const [chargementSuppression, setChargementSuppression] = useState(false);
  
  // État de la réponse
  const [nouvelEnseignant, setNouvelEnseignant] = useState(null);
  const [motDePasseTemporaire, setMotDePasseTemporaire] = useState('');
  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);

  useEffect(() => {
    recupererDonnees();
  }, []);

  // Filtrage des enseignants
  const enseignantsFiltres = useMemo(() => {
    return enseignants.filter(enseignant => {
      const correspondTexte = !rechercheTexte || 
        `${enseignant.first_name} ${enseignant.last_name}`.toLowerCase().includes(rechercheTexte.toLowerCase()) ||
        enseignant.n_appoge.toLowerCase().includes(rechercheTexte.toLowerCase());
      
      const correspondMatiere = !filtrMatiere || enseignant.subject_id === parseInt(filtrMatiere);
      
      return correspondTexte && correspondMatiere;
    });
  }, [enseignants, rechercheTexte, filtrMatiere]);

  const recupererDonnees = async () => {
    try {
      setChargement(true);
      console.log('Récupération des données...');
      
      const [enseignantsRes, matieresRes, groupesRes] = await Promise.allSettled([
        adminAPI.getTeachers(),
        commonAPI.getSubjects(),
        commonAPI.getGroups()
      ]);

      if (enseignantsRes.status === 'fulfilled') {
        console.log('Données des enseignants:', enseignantsRes.value.data);
        setEnseignants(enseignantsRes.value.data);
      } else {
        console.error('Erreur enseignants:', enseignantsRes.reason);
        toast.error('Erreur lors du chargement des enseignants');
      }

      if (matieresRes.status === 'fulfilled') {
        console.log('Données des matières:', matieresRes.value.data);
        setMatieres(matieresRes.value.data);
      } else {
        console.error('Erreur matières:', matieresRes.reason);
        toast.error('Erreur lors du chargement des matières');
      }

      if (groupesRes.status === 'fulfilled') {
        console.log('Données des groupes:', groupesRes.value.data);
        setGroupes(groupesRes.value.data);
      } else {
        console.error('Erreur groupes:', groupesRes.reason);
        toast.error('Erreur lors du chargement des groupes');
      }
      
      setErreur(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des données:', err);
      setErreur(`Échec du chargement des données. Erreur: ${err.message || 'Erreur inconnue'}`);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setChargement(false);
    }
  };

  const gererOuvertureDialogue = () => {
    setModeModification(false);
    setDonneesFormulaire({
      id: null,
      n_appoge: '',
      first_name: '',
      last_name: '',
      password: '',
      subject_id: '',
      groups: []
    });
    setOuvert(true);
  };

  const gererOuvertureModification = (enseignant) => {
    setModeModification(true);
    setDonneesFormulaire({
      id: enseignant.id,
      n_appoge: enseignant.n_appoge,
      first_name: enseignant.first_name,
      last_name: enseignant.last_name,
      password: '',
      subject_id: enseignant.subject_id,
      groups: enseignant.groups ? enseignant.groups.map(g => g.id) : []
    });
    setOuvert(true);
  };

  const gererFermeture = () => {
    setOuvert(false);
    setDonneesFormulaire({
      id: null,
      n_appoge: '',
      first_name: '',
      last_name: '',
      password: '',
      subject_id: '',
      groups: []
    });
    setAfficherMotDePasse(false);
    setModeModification(false);
  };

  const gererChangement = (e) => {
    const { name, value } = e.target;
    setDonneesFormulaire({
      ...donneesFormulaire,
      [name]: value
    });
  };

  const gererChangementGroupes = (event) => {
    const {
      target: { value },
    } = event;
    setDonneesFormulaire({
      ...donneesFormulaire,
      groups: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const gererSoumission = async (e) => {
    e.preventDefault();
    
    if (!donneesFormulaire.n_appoge || !donneesFormulaire.first_name || !donneesFormulaire.last_name || !donneesFormulaire.subject_id || donneesFormulaire.groups.length === 0) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setChargement(true);
      let reponse;
      
      if (modeModification) {
        const donneesMAJ = {...donneesFormulaire};
        if (!donneesMAJ.password) {
          delete donneesMAJ.password;
        }
        
        reponse = await adminAPI.updateTeacher(donneesFormulaire.id, donneesMAJ);
        setEnseignants(enseignants.map(enseignant => 
          enseignant.id === donneesFormulaire.id ? reponse.data.teacher : enseignant
        ));
        
        toast.success('Enseignant mis à jour avec succès');
        gererFermeture();
      } else {
        reponse = await adminAPI.addTeacher(donneesFormulaire);
        setNouvelEnseignant(reponse.data.teacher);
        setMotDePasseTemporaire(reponse.data.password);
        setAfficherMotDePasse(true);
        setEnseignants([...enseignants, reponse.data.teacher]);
        toast.success('Enseignant ajouté avec succès');
      }
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement de l\'enseignant:', err);
      toast.error(err.response?.data?.message || 'Échec de l\'enregistrement de l\'enseignant');
    } finally {
      setChargement(false);
    }
  };

  const gererClicSuppression = (enseignant) => {
    setEnseignantASupprimer(enseignant);
    setDialogueSuppressionOuvert(true);
  };

  const gererAnnulationSuppression = () => {
    setEnseignantASupprimer(null);
    setDialogueSuppressionOuvert(false);
  };

  const gererConfirmationSuppression = async () => {
    if (!enseignantASupprimer) return;
    
    try {
      setChargementSuppression(true);
      await adminAPI.deleteTeacher(enseignantASupprimer.id);
      setEnseignants(enseignants.filter(enseignant => enseignant.id !== enseignantASupprimer.id));
      toast.success('Enseignant supprimé avec succès');
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'enseignant:', err);
      toast.error(err.response?.data?.message || 'Échec de la suppression de l\'enseignant');
    } finally {
      setChargementSuppression(false);
      setDialogueSuppressionOuvert(false);
      setEnseignantASupprimer(null);
    }
  };

  const obtenirLibelleGroupe = (idGroupe) => {
    const groupe = groupes.find(g => g.id === parseInt(idGroupe));
    if (!groupe || !groupe.level) return 'Inconnu';
    return `${groupe.level.name} - Groupe ${groupe.group_number}`;
  };

  const obtenirInitiales = (prenom, nom) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  const viderFiltres = () => {
    setRechercheTexte('');
    setFiltrMatiere('');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête avec statistiques */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 3, 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white'
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Gestion des Enseignants
            </Typography>
            <Stack direction="row" spacing={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <PersonIcon />
                <Typography variant="body1">
                  {enseignants.length} enseignant{enseignants.length > 1 ? 's' : ''}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <SchoolIcon />
                <Typography variant="body1">
                  {matieres.length} matière{matieres.length > 1 ? 's' : ''}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <GroupIcon />
                <Typography variant="body1">
                  {groupes.length} groupe{groupes.length > 1 ? 's' : ''}
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Button 
            variant="contained" 
            size="large"
            startIcon={<PersonAddIcon />}
            onClick={gererOuvertureDialogue}
            sx={{ 
              bgcolor: 'white', 
              color: theme.palette.primary.main,
              '&:hover': { 
                bgcolor: alpha(theme.palette.common.white, 0.9),
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[8]
              },
              transition: 'all 0.3s ease'
            }}
          >
            Nouvel Enseignant
          </Button>
        </Stack>
      </Paper>

      {/* Barre de recherche et filtres */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Rechercher par nom ou N° Appoge..."
              value={rechercheTexte}
              onChange={(e) => setRechercheTexte(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: rechercheTexte && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setRechercheTexte('')} size="small">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filtrer par matière</InputLabel>
              <Select
                value={filtrMatiere}
                onChange={(e) => setFiltrMatiere(e.target.value)}
                label="Filtrer par matière"
                startAdornment={<FilterListIcon sx={{ mr: 1, color: 'action.active' }} />}
              >
                <MenuItem value="">Toutes les matières</MenuItem>
                {matieres.map((matiere) => (
                  <MenuItem key={matiere.id} value={matiere.id}>
                    {matiere.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={viderFiltres}
              disabled={!rechercheTexte && !filtrMatiere}
            >
              Vider filtres
            </Button>
          </Grid>
        </Grid>
        {(rechercheTexte || filtrMatiere) && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              {enseignantsFiltres.length} résultat{enseignantsFiltres.length > 1 ? 's' : ''} trouvé{enseignantsFiltres.length > 1 ? 's' : ''}
            </Typography>
          </Box>
        )}
      </Paper>

      {erreur && (
        <Fade in={!!erreur}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {erreur}
          </Alert>
        </Fade>
      )}

      {chargement && !ouvert ? (
        <Box display="flex" justifyContent="center" my={8}>
          <Stack alignItems="center" spacing={2}>
            <CircularProgress size={48} />
            <Typography variant="body1" color="text.secondary">
              Chargement des données...
            </Typography>
          </Stack>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Enseignant</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>N° Appoge</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Matière</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Groupes Assignés</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enseignantsFiltres && enseignantsFiltres.length > 0 ? (
                enseignantsFiltres.map((enseignant, index) => (
                  <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }} key={enseignant.id}>
                    <TableRow 
                      hover
                      sx={{ 
                        '&:hover': { 
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          transform: 'scale(1.01)',
                          transition: 'all 0.2s ease'
                        }
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar
                            sx={{ 
                              bgcolor: theme.palette.primary.main,
                              width: 40,
                              height: 40,
                              fontSize: '0.875rem'
                            }}
                          >
                            {obtenirInitiales(enseignant.first_name, enseignant.last_name)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="medium">
                              {`${enseignant.first_name} ${enseignant.last_name}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {enseignant.id}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {enseignant.n_appoge}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={enseignant.subject?.name || 'Non assigné'} 
                          color={enseignant.subject ? 'primary' : 'default'} 
                          variant="outlined"
                          icon={<SchoolIcon />}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {enseignant.groups && enseignant.groups.length > 0 ? (
                            enseignant.groups.map((groupe) => (
                              <Chip 
                                key={groupe.id} 
                                label={`${groupe.level?.name || 'Niveau'} - G${groupe.group_number}`} 
                                size="small" 
                                color="secondary"
                                variant="outlined"
                              />
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                              Aucun groupe
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Modifier" arrow>
                            <IconButton 
                              color="success" 
                              size="small" 
                              onClick={() => gererOuvertureModification(enseignant)}
                              sx={{ '&:hover': { transform: 'scale(1.1)' } }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer" arrow>
                            <IconButton 
                              color="error" 
                              size="small"
                              onClick={() => gererClicSuppression(enseignant)}
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
                      <PersonIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
                      <Typography variant="h6" color="text.secondary">
                        {rechercheTexte || filtrMatiere ? 'Aucun enseignant ne correspond aux critères' : 'Aucun enseignant trouvé'}
                      </Typography>
                      {!rechercheTexte && !filtrMatiere && (
                        <Button 
                          variant="contained" 
                          startIcon={<AddIcon />}
                          onClick={gererOuvertureDialogue}
                        >
                          Ajouter le premier enseignant
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialogue d'ajout/modification d'enseignant */}
      <Dialog 
        open={ouvert} 
        onClose={gererFermeture} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        {!afficherMotDePasse ? (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: modeModification ? 'success.main' : 'primary.main' }}>
                  {modeModification ? <EditIcon /> : <PersonAddIcon />}
                </Avatar>
                <Typography variant="h5">
                  {modeModification ? 'Modifier l\'Enseignant' : 'Nouvel Enseignant'}
                </Typography>
              </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 3 }}>
              <DialogContentText sx={{ mb: 3 }}>
                {modeModification 
                  ? 'Mettez à jour les informations de l\'enseignant. Laissez le mot de passe vide pour le conserver.'
                  : 'Remplissez les informations pour créer un nouveau compte enseignant. Un mot de passe temporaire sera généré automatiquement.'
                }
              </DialogContentText>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    required
                    fullWidth
                    label="N° Appoge"
                    name="n_appoge"
                    value={donneesFormulaire.n_appoge}
                    onChange={gererChangement}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    required
                    fullWidth
                    label="Prénom"
                    name="first_name"
                    value={donneesFormulaire.first_name}
                    onChange={gererChangement}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    required
                    fullWidth
                    label="Nom de Famille"
                    name="last_name"
                    value={donneesFormulaire.last_name}
                    onChange={gererChangement}
                    variant="outlined"
                  />
                </Grid>
                
                {modeModification && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nouveau mot de passe"
                      name="password"
                      type="password"
                      value={donneesFormulaire.password}
                      onChange={gererChangement}
                      helperText="Laissez vide pour conserver le mot de passe actuel"
                      variant="outlined"
                    />
                  </Grid>
                )}
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Matière Enseignée</InputLabel>
                    <Select
                      name="subject_id"
                      value={donneesFormulaire.subject_id}
                      onChange={gererChangement}
                      label="Matière Enseignée"
                    >
                      {matieres.map((matiere) => (
                        <MenuItem key={matiere.id} value={matiere.id}>
                          {matiere.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Groupes Assignés</InputLabel>
                    <Select
                      multiple
                      value={donneesFormulaire.groups}
                      onChange={gererChangementGroupes}
                      input={<OutlinedInput label="Groupes Assignés" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={obtenirLibelleGroupe(value)} size="small" />
                          ))}
                        </Box>
                      )}
                      MenuProps={ProprietesMenu}
                    >
                      {groupes.map((groupe) => (
                        <MenuItem key={groupe.id} value={groupe.id}>
                          {groupe.level ? `${groupe.level.name} - Groupe ${groupe.group_number}` : `Groupe ${groupe.group_number}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={gererFermeture} size="large">
                Annuler
              </Button>
              <Button 
                onClick={gererSoumission}
                variant="contained" 
                disabled={chargement}
                size="large"
                startIcon={chargement ? <CircularProgress size={20} /> : null}
              >
                {modeModification ? 'Mettre à Jour' : 'Créer le Compte'}
              </Button>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogTitle>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <PersonIcon />
                </Avatar>
                <Typography variant="h5">Compte Créé avec Succès !</Typography>
              </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 3 }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                Le compte enseignant a été créé avec succès. Veuillez communiquer ces informations à l'enseignant.
              </Alert>
              
              <Card variant="outlined" sx={{ mb: 3, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="success.main">
                    Informations de Connexion
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Nom Complet</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {nouvelEnseignant.first_name} {nouvelEnseignant.last_name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">N° Appoge</Typography>
                      <Typography variant="body1" fontWeight="medium" fontFamily="monospace">
                        {nouvelEnseignant.n_appoge}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Mot de Passe Temporaire</Typography>
                      <Typography 
                        variant="h6" 
                        fontWeight="bold" 
                        fontFamily="monospace"
                        sx={{ 
                          bgcolor: alpha(theme.palette.warning.main, 0.1),
                          p: 1,
                          borderRadius: 1,
                          border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                          display: 'inline-block'
                        }}
                      >
                        {motDePasseTemporaire}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Important :</strong> L'enseignant doit changer ce mot de passe lors de sa première connexion pour des raisons de sécurité.
                </Typography>
              </Alert>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={gererFermeture} variant="contained" size="large" fullWidth>
                Parfait, j'ai noté !
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={dialogueSuppressionOuvert}
        onClose={gererAnnulationSuppression}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'error.main' }}>
              <DeleteIcon />
            </Avatar>
            <Typography variant="h6">Confirmer la Suppression</Typography>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Cette action est irréversible !
          </Alert>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer définitivement l'enseignant{' '}
            <strong>"{enseignantASupprimer?.first_name} {enseignantASupprimer?.last_name}"</strong> ?
          </DialogContentText>
          <DialogContentText sx={{ mt: 2, fontStyle: 'italic' }}>
            Toutes les données associées à cet enseignant seront perdues et ne pourront pas être récupérées.
          </DialogContentText>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={gererAnnulationSuppression} 
            variant="outlined"
            size="large"
          >
            Annuler
          </Button>
          <Button 
            onClick={gererConfirmationSuppression} 
            color="error" 
            variant="contained"
            disabled={chargementSuppression}
            size="large"
            startIcon={chargementSuppression ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {chargementSuppression ? 'Suppression...' : 'Supprimer Définitivement'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Enseignants;