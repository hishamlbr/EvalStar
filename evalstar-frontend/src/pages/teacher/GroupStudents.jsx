// src/pages/teacher/EtudiantsGroupe.jsx
import React, { useEffect, useState } from 'react';
import { teacherAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Container,
  Typography,
  Box,
  Avatar,
  Chip,
  CircularProgress,
  Button,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip,
  Grid,
  Badge,
} from '@mui/material';
import {
  Person as PersonIcon,
  Star as StarIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  School as SchoolIcon,
  Group as GroupIcon,
  Email as EmailIcon,
  Assignment as EvaluationIcon,
} from '@mui/icons-material';

export default function EtudiantsGroupe() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [etudiants, setEtudiants] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [recherche, setRecherche] = useState('');
  const [infoGroupe, setInfoGroupe] = useState(null);

  useEffect(() => {
    const recupererEtudiants = async () => {
      try {
        setChargement(true);
        const response = await teacherAPI.getStudentsByGroup(user.id, id);
        setEtudiants(response.data);
        
        // Simulation d'informations sur le groupe (à adapter selon votre API)
        if (response.data.length > 0) {
          setInfoGroupe({
            numero: response.data[0].group_number || 'N/A',
            niveau: response.data[0].level_name || 'N/A',
            totalEtudiants: response.data.length
          });
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des étudiants:', err);
        setErreur('Impossible de charger les étudiants du groupe.');
      } finally {
        setChargement(false);
      }
    };

    if (user?.id && id) {
      recupererEtudiants();
    }
  }, [user, id]);

  const etudiantsFiltres = etudiants.filter(etudiant =>
    `${etudiant.first_name} ${etudiant.last_name}`.toLowerCase().includes(recherche.toLowerCase()) ||
    etudiant.cne.toLowerCase().includes(recherche.toLowerCase())
  );

  const obtenirCouleurEtoiles = (nombreEtoiles) => {
    if (nombreEtoiles >= 50) return 'success';
    if (nombreEtoiles >= 25) return 'warning';
    if (nombreEtoiles >= 10) return 'info';
    return 'default';
  };

  const obtenirInitiales = (prenom, nom) => {
    return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase();
  };

  if (chargement) {
    return (
      <Container>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          mt: 10,
          gap: 2
        }}>
          <CircularProgress size={60} />
          <Typography variant="h6" color="textSecondary">
            Chargement des étudiants...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (erreur) {
    return (
      <Container>
        <Paper elevation={3} sx={{ mt: 3, p: 4, textAlign: 'center' }}>
          <Typography color="error" variant="h6" gutterBottom>
            ⚠️ {erreur}
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            sx={{ mt: 2 }} 
            onClick={() => window.location.reload()}
          >
            Réessayer
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* En-tête avec navigation */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Tooltip title="Retour aux groupes">
            <IconButton 
              onClick={() => navigate('/teacher/groups')}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
            <GroupIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              Étudiants du Groupe
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Consultez la liste des étudiants et leurs performances.
            </Typography>
          </Box>
        </Box>

        {/* Informations sur le groupe */}
        {infoGroupe && (
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Chip
                    icon={<GroupIcon />}
                    label={`Groupe ${infoGroupe.numero}`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    icon={<SchoolIcon />}
                    label={infoGroupe.niveau}
                    color="secondary"
                    variant="outlined"
                  />
                  <Chip
                    icon={<PersonIcon />}
                    label={`${infoGroupe.totalEtudiants} étudiants`}
                    color="info"
                    variant="outlined"
                  />
                </Box>
                <Button
                  variant="contained"
                  startIcon={<EvaluationIcon />}
                  onClick={() => {
                    const state = { 
                      preselectedGroups: [id],
                      preselectedLevel: infoGroupe.niveauId
                    };
                    navigate('/teacher/tasks/create', { state });
                  }}
                >
                  Créer Évaluation
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Barre de recherche */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher par nom ou CNE..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />
      </Box>

      {/* Tableau des étudiants */}
      <Paper elevation={3}>
        {etudiantsFiltres.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <PersonIcon color="action" sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {recherche ? 'Aucun étudiant trouvé' : 'Aucun étudiant dans ce groupe'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {recherche ? 'Essayez de modifier votre recherche.' : 'Ce groupe ne contient pas encore d\'étudiants.'}
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ p: 2, bgcolor: 'primary.light' }}>
              <Typography variant="h6" color="primary.contrastText">
                Liste des Étudiants ({etudiantsFiltres.length})
              </Typography>
            </Box>
            <Divider />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
                        Étudiant
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SchoolIcon sx={{ mr: 1, fontSize: 20 }} />
                        CNE
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <StarIcon sx={{ mr: 1, fontSize: 20 }} />
                        Étoiles
                      </Box>
                    </TableCell>
                   
                  </TableRow>
                </TableHead>
                <TableBody>
                  {etudiantsFiltres.map((etudiant, index) => (
                    <TableRow 
                      key={etudiant.id}
                      sx={{ 
                        '&:hover': { bgcolor: 'action.hover' },
                        '&:nth-of-type(even)': { bgcolor: 'action.selected' }
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
                              fontSize: '0.9rem'
                            }}
                          >
                            {obtenirInitiales(etudiant.first_name, etudiant.last_name)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {etudiant.first_name} {etudiant.last_name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Étudiant #{index + 1}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={etudiant.cne} 
                          variant="outlined" 
                          size="small"
                          color="info"
                        />
                      </TableCell>
                      <TableCell>
                        <Badge 
                          badgeContent={etudiant.total_stars || 0} 
                          color={obtenirCouleurEtoiles(etudiant.total_stars || 0)}
                          anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                          }}
                        >
                          <StarIcon 
                            sx={{ 
                              color: 'warning.main',
                              fontSize: 24
                            }} 
                          />
                        </Badge>
                      </TableCell>
                      
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Paper>

      {/* Statistiques rapides */}
      {etudiantsFiltres.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    {etudiantsFiltres.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Étudiants Total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main" fontWeight="bold">
                    {Math.round(etudiantsFiltres.reduce((sum, e) => sum + (e.total_stars || 0), 0) / etudiantsFiltres.length) || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Étoiles Moyenne
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {Math.max(...etudiantsFiltres.map(e => e.total_stars || 0))}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Maximum Étoiles
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Container>
  );
}