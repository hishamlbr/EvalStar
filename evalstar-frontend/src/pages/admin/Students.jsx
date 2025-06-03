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
      width: 250,
    },
  },
};

const Etudiants = () => {
  const theme = useTheme();

  // Données principales
  const [etudiants, setEtudiants] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  // Recherche et filtrage
  const [rechercheTexte, setRechercheTexte] = useState('');
  const [filtreNiveau, setFiltreNiveau] = useState('');

  // État du formulaire (ajout / modification)
  const [ouvert, setOuvert] = useState(false);
  const [modeModification, setModeModification] = useState(false);
  const [donneesFormulaire, setDonneesFormulaire] = useState({
    id: null,
    cne: '',
    first_name: '',
    last_name: '',
    level_id: '',
    group_id: ''
  });

  // Confirmation de suppression
  const [dialogueSuppressionOuvert, setDialogueSuppressionOuvert] = useState(false);
  const [etudiantASupprimer, setEtudiantASupprimer] = useState(null);
  const [chargementSuppression, setChargementSuppression] = useState(false);

  // Affichage mot de passe après ajout
  const [nouvelEtudiant, setNouvelEtudiant] = useState(null);
  const [motDePasseTemporaire, setMotDePasseTemporaire] = useState('');
  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);

  // Récupérer données au montage
  useEffect(() => {
    recupererDonnees();
  }, []);

  const recupererDonnees = async () => {
    try {
      setChargement(true);
      const [etudiantsRes, niveauxRes, groupesRes] = await Promise.allSettled([
        adminAPI.getStudents(),
        commonAPI.getLevels(),
        commonAPI.getGroups()
      ]);

      // Étudiants
      if (etudiantsRes.status === 'fulfilled') {
        setEtudiants(etudiantsRes.value.data);
      } else {
        console.error('Erreur récupération étudiants:', etudiantsRes.reason);
        toast.error('Erreur lors du chargement des étudiants');
      }

      // Niveaux
      if (niveauxRes.status === 'fulfilled') {
        setNiveaux(niveauxRes.value.data);
      } else {
        console.error('Erreur récupération niveaux:', niveauxRes.reason);
        toast.error('Erreur lors du chargement des niveaux');
      }

      // Groupes
      if (groupesRes.status === 'fulfilled') {
        setGroupes(groupesRes.value.data);
      } else {
        console.error('Erreur récupération groupes:', groupesRes.reason);
        toast.error('Erreur lors du chargement des groupes');
      }

      setErreur(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des données:', err);
      setErreur(`Échec du chargement des données. Erreur: ${err.message || 'Inconnue'}`);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setChargement(false);
    }
  };

  // Filtrer les étudiants selon texte et niveau sélectionné
  const etudiantsFiltres = useMemo(() => {
    return etudiants.filter((etudiant) => {
      const correspondTexte = !rechercheTexte ||
        `${etudiant.first_name} ${etudiant.last_name}`.toLowerCase().includes(rechercheTexte.toLowerCase()) ||
        etudiant.cne.toLowerCase().includes(rechercheTexte.toLowerCase());

      const correspondNiveau = !filtreNiveau ||
        etudiant.level_id === parseInt(filtreNiveau, 10);

      return correspondTexte && correspondNiveau;
    });
  }, [etudiants, rechercheTexte, filtreNiveau]);

  // Ouvrir dialogue d'ajout
  const gererOuvertureDialogue = () => {
    setModeModification(false);
    setDonneesFormulaire({
      id: null,
      cne: '',
      first_name: '',
      last_name: '',
      level_id: '',
      group_id: ''
    });
    setAfficherMotDePasse(false);
    setOuvert(true);
  };

  // Ouvrir dialogue de modification
  const gererOuvertureModification = (etudiant) => {
    setModeModification(true);
    setDonneesFormulaire({
      id: etudiant.id,
      cne: etudiant.cne,
      first_name: etudiant.first_name,
      last_name: etudiant.last_name,
      level_id: etudiant.level_id.toString(),
      group_id: etudiant.group_id.toString()
    });
    setAfficherMotDePasse(false);
    setOuvert(true);
  };

  // Fermer le dialogue (ajout / modification / mot de passe)
  const gererFermeture = () => {
    setOuvert(false);
    setDonneesFormulaire({
      id: null,
      cne: '',
      first_name: '',
      last_name: '',
      level_id: '',
      group_id: ''
    });
    setAfficherMotDePasse(false);
    setModeModification(false);
  };

  // Gérer changement dans le formulaire
  const gererChangement = (e) => {
    const { name, value } = e.target;
    setDonneesFormulaire((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Soumettre le formulaire (ajout ou modification)
  const gererSoumission = async (e) => {
    e.preventDefault();
    const { cne, first_name, last_name, level_id, group_id } = donneesFormulaire;

    if (!cne || !first_name || !last_name || !level_id || !group_id) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setChargement(true);
      let reponse;

      if (modeModification) {
        // Mise à jour
        reponse = await adminAPI.updateStudent(donneesFormulaire.id, {
          cne,
          first_name,
          last_name,
          level_id,
          group_id
        });

        setEtudiants((prev) =>
          prev.map((e) =>
            e.id === donneesFormulaire.id
              ? { ...reponse.data.student } // on suppose que l’API renvoie student mis à jour
              : e
          )
        );

        toast.success('Étudiant mis à jour avec succès');
        gererFermeture();
      } else {
        // Ajout
        reponse = await adminAPI.addStudent({
          cne,
          first_name,
          last_name,
          level_id,
          group_id
        });

        setNouvelEtudiant(reponse.data.student);
        setMotDePasseTemporaire(reponse.data.password);
        setAfficherMotDePasse(true);

        // Récupérer les objets niveau et groupe pour affichage immédiat
        const niveauTrouve = niveaux.find((n) => n.id === parseInt(level_id, 10));
        const groupeTrouve = groupes.find((g) => g.id === parseInt(group_id, 10));

        setEtudiants((prev) => [
          ...prev,
          {
            ...reponse.data.student,
            level: niveauTrouve || null,
            group: groupeTrouve || null
          }
        ]);

        toast.success('Étudiant ajouté avec succès');
      }
    } catch (err) {
      console.error("Erreur lors de l'enregistrement de l'étudiant :", err);
      toast.error(err.response?.data?.message || "Échec de l'enregistrement de l'étudiant");
    } finally {
      setChargement(false);
    }
  };

  // Préparer la suppression
  const gererClicSuppression = (etudiant) => {
    setEtudiantASupprimer(etudiant);
    setDialogueSuppressionOuvert(true);
  };

  const gererAnnulationSuppression = () => {
    setEtudiantASupprimer(null);
    setDialogueSuppressionOuvert(false);
  };

  const gererConfirmationSuppression = async () => {
    if (!etudiantASupprimer) return;
    try {
      setChargementSuppression(true);
      await adminAPI.deleteStudent(etudiantASupprimer.id);
      setEtudiants((prev) => prev.filter((e) => e.id !== etudiantASupprimer.id));
      toast.success('Étudiant supprimé avec succès');
    } catch (err) {
      console.error("Erreur lors de la suppression de l'étudiant :", err);
      toast.error(err.response?.data?.message || "Échec de la suppression de l'étudiant");
    } finally {
      setChargementSuppression(false);
      setDialogueSuppressionOuvert(false);
      setEtudiantASupprimer(null);
    }
  };

  // Libellé du groupe (niveau + numéro)
  const obtenirLibelleGroupe = (idGroupe) => {
    const g = groupes.find((grp) => grp.id === parseInt(idGroupe, 10));
    if (!g || !g.level) return 'Inconnu';
    return `${g.level.name} - G${g.group_number}`;
  };

  // Initiales pour l'avatar
  const obtenirInitiales = (prenom, nom) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  // Vider filtres
  const viderFiltres = () => {
    setRechercheTexte('');
    setFiltreNiveau('');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* ============================== */}
      {/*   EN-TÊTE AVEC STATISTIQUES    */}
      {/* ============================== */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          borderRadius: 2
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Gestion des Étudiants
            </Typography>
            <Stack direction="row" spacing={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <PersonIcon />
                <Typography variant="body1">
                  {etudiants.length} étudiant{etudiants.length > 1 ? 's' : ''}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <SchoolIcon />
                <Typography variant="body1">
                  {niveaux.length} niveau{niveaux.length > 1 ? 'x' : ''}
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
            Nouvel Étudiant
          </Button>
        </Stack>
      </Paper>

      {/* ============================== */}
      {/*    BARRE DE RECHERCHE / FILTRAGE  */}
      {/* ============================== */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Champ recherche */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Rechercher par nom ou CNE..."
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

          {/* Filtre par niveau */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filtrer par niveau</InputLabel>
              <Select
                value={filtreNiveau}
                onChange={(e) => setFiltreNiveau(e.target.value)}
                label="Filtrer par niveau"
                startAdornment={<FilterListIcon sx={{ mr: 1, color: 'action.active' }} />}
                input={<OutlinedInput label="Filtrer par niveau" />}
                MenuProps={ProprietesMenu}
              >
                <MenuItem value="">Tous les niveaux</MenuItem>
                {niveaux.map((niv) => (
                  <MenuItem key={niv.id} value={niv.id}>
                    {niv.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Bouton Vider filtres */}
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={viderFiltres}
              disabled={!rechercheTexte && !filtreNiveau}
              startIcon={<ClearIcon />}
            >
              Vider filtres
            </Button>
          </Grid>
        </Grid>
        {(rechercheTexte || filtreNiveau) && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              {etudiantsFiltres.length} résultat{etudiantsFiltres.length > 1 ? 's' : ''} trouvé
              {etudiantsFiltres.length > 1 ? 's' : ''}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* ============================== */}
      {/*      MESSAGE D'ERREUR (SI BESOIN)     */}
      {/* ============================== */}
      {erreur && (
        <Fade in={!!erreur}>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {erreur}
          </Alert>
        </Fade>
      )}

      {/* ============================== */}
      {/*         TABLEAU DES ÉTUDIANTS        */}
      {/* ============================== */}
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
        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Étudiant</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>CNE</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Classe</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Groupe</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {etudiantsFiltres.length > 0 ? (
                etudiantsFiltres.map((etudiant, index) => (
                  <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }} key={etudiant.id}>
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
                      {/* Avatar + Nom */}
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
                            {obtenirInitiales(etudiant.first_name, etudiant.last_name)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="medium">
                              {`${etudiant.first_name} ${etudiant.last_name}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {etudiant.id}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* CNE */}
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {etudiant.cne}
                        </Typography>
                      </TableCell>

                      {/* Classe (Niveau) */}
                      <TableCell>
                        {etudiant.level?.name ?? 'N/A'}
                      </TableCell>

                      {/* Groupe (numéro) */}
                      <TableCell>
                        {etudiant.group ? (
                          <Chip
                            label={`G${etudiant.group.group_number}`}
                            size="small"
                            color="secondary"
                            variant="outlined"
                            icon={<GroupIcon fontSize="small" />}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary" fontStyle="italic">
                            Aucun groupe
                          </Typography>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Modifier" arrow>
                            <IconButton
                              color="success"
                              size="small"
                              onClick={() => gererOuvertureModification(etudiant)}
                              sx={{ '&:hover': { transform: 'scale(1.1)' } }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer" arrow>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => gererClicSuppression(etudiant)}
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
                        {rechercheTexte || filtreNiveau
                          ? 'Aucun étudiant ne correspond aux critères'
                          : 'Aucun étudiant trouvé'}
                      </Typography>
                      {!rechercheTexte && !filtreNiveau && (
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={gererOuvertureDialogue}
                        >
                          Ajouter le premier étudiant
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

      {/* ====================================================== */}
      {/*     DIALOGUE D'AJOUT / MODIFICATION D'ÉTUDIANT        */}
      {/* ====================================================== */}
      <Dialog
        open={ouvert}
        onClose={gererFermeture}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        {!afficherMotDePasse ? (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: modeModification ? 'success.main' : 'primary.main' }}>
                  {modeModification ? <EditIcon /> : <PersonAddIcon />}
                </Avatar>
                <Typography variant="h5">
                  {modeModification ? 'Modifier l’Étudiant' : 'Nouvel Étudiant'}
                </Typography>
              </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 3 }}>
              <DialogContentText sx={{ mb: 3 }}>
                {modeModification
                  ? "Mettez à jour les informations de l'étudiant. Les champs obligatoires sont marqués."
                  : "Remplissez les informations pour créer un nouveau compte étudiant. Un mot de passe temporaire sera généré automatiquement."}
              </DialogContentText>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    required
                    fullWidth
                    label="CNE"
                    name="cne"
                    value={donneesFormulaire.cne}
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
                    label="Nom de famille"
                    name="last_name"
                    value={donneesFormulaire.last_name}
                    onChange={gererChangement}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Niveau</InputLabel>
                    <Select
                      name="level_id"
                      value={donneesFormulaire.level_id}
                      onChange={gererChangement}
                      label="Niveau"
                    >
                      {niveaux.map((niv) => (
                        <MenuItem key={niv.id} value={niv.id}>
                          {niv.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl
                    fullWidth
                    required
                    disabled={!donneesFormulaire.level_id}
                  >
                    <InputLabel>Groupe</InputLabel>
                    <Select
                      name="group_id"
                      value={donneesFormulaire.group_id}
                      onChange={gererChangement}
                      label="Groupe"
                      MenuProps={ProprietesMenu}
                    >
                      {groupes
                        .filter(
                          (g) =>
                            g.level_id ===
                            parseInt(donneesFormulaire.level_id || '0', 10)
                        )
                        .map((g) => (
                          <MenuItem key={g.id} value={g.id}>
                            {`G${g.group_number} (${g.level?.name || 'N/A'})`}
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
                Le compte étudiant a été créé avec succès. Veuillez communiquer ces informations à l’étudiant.
              </Alert>

              <Card variant="outlined" sx={{ mb: 3, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="success.main">
                    Informations de Connexion
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Nom complet</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {nouvelEtudiant.first_name} {nouvelEtudiant.last_name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">CNE</Typography>
                      <Typography variant="body1" fontWeight="medium" fontFamily="monospace">
                        {nouvelEtudiant.cne}
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
                  <strong>Important :</strong> L’étudiant doit changer ce mot de passe lors de sa première connexion pour des raisons de sécurité.
                </Typography>
              </Alert>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={gererFermeture} variant="contained" size="large" fullWidth>
                Parfait, j’ai noté !
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ====================================================== */}
      {/*        DIALOGUE DE CONFIRMATION DE SUPPRESSION         */}
      {/* ====================================================== */}
      <Dialog
        open={dialogueSuppressionOuvert}
        onClose={gererAnnulationSuppression}
        PaperProps={{ sx: { borderRadius: 2 } }}
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
            Êtes-vous sûr de vouloir supprimer définitivement l’étudiant{' '}
            <strong>"{etudiantASupprimer?.first_name} {etudiantASupprimer?.last_name}"</strong> ?
          </DialogContentText>
          <DialogContentText sx={{ mt: 2, fontStyle: 'italic' }}>
            Toutes les données associées à cet étudiant seront perdues et ne pourront pas être récupérées.
          </DialogContentText>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={gererAnnulationSuppression} variant="outlined" size="large">
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

export default Etudiants;
