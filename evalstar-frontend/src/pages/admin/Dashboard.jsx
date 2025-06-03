// src/pages/admin/Dashboard.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  CircularProgress, 
  Divider, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Alert,
  Card,
  CardContent,
  Chip,
  Avatar
} from '@mui/material';
import { 
  People, 
  School, 
  Assignment, 
  CheckCircle, 
  TrendingUp,
  Refresh
} from '@mui/icons-material';
import { adminAPI } from '../../api/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';

// Enregistrer les composants ChartJS
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TableauDeBordAdmin = () => {
  const [statistiques, setStatistiques] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [declencheurActualisation, setDeclencheurActualisation] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const recupererStatistiquesTableauDeBord = async () => {
      try {
        setChargement(true);
        const reponse = await adminAPI.getDashboard();
        setStatistiques(reponse.data);
        setErreur(null);
      } catch (err) {
        setErreur('Échec du chargement des données du tableau de bord');
        console.error(err);
      } finally {
        setChargement(false);
      }
    };

    recupererStatistiquesTableauDeBord();
  }, [declencheurActualisation]);

  const gererActualisation = () => {
    setDeclencheurActualisation(prev => prev + 1);
  };

  const gererVoirEtudiant = (idEtudiant) => {
    console.log(`Navigation vers l'étudiant : ${idEtudiant}`);
    navigate(`/admin/etudiants/${idEtudiant}`);
  };

  // Composant pour les cartes de statistiques
  const CarteStatistique = ({ titre, valeur, icone, couleur = 'primary' }) => (
    <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${couleur === 'primary' ? '#69e9f8' : couleur === 'secondary' ? '#dc004e' : couleur === 'success' ? '#2e7d32' : '#ed6c02'} 20%, transparent 100%)` }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
            {valeur || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {titre}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: `${couleur}.main`, width: 56, height: 56 }}>
          {icone}
        </Avatar>
      </CardContent>
    </Card>
  );

  if (chargement) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Chargement des données...
        </Typography>
      </Box>
    );
  }

  if (erreur) {
    return (
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {erreur}
        </Alert>
        <Button 
          variant="contained" 
          onClick={gererActualisation} 
          startIcon={<Refresh />}
          size="large"
        >
          Réessayer
        </Button>
      </Box>
    );
  }

  if (!statistiques) {
    return (
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Aucune donnée disponible
        </Typography>
        <Button 
          variant="contained" 
          onClick={gererActualisation} 
          startIcon={<Refresh />}
          size="large"
        >
          Actualiser
        </Button>
      </Box>
    );
  }

  // Préparer les données pour le graphique de distribution des étudiants
  const donneesDistributionNiveaux = statistiques.levels ? {
    labels: statistiques.levels.map(niveau => niveau.name),
    datasets: [
      {
        label: 'Nombre d\'Étudiants',
        data: statistiques.levels.map(niveau => niveau.students_count),
        backgroundColor: [
          'rgba(25, 118, 210, 0.8)',
          'rgba(156, 39, 176, 0.8)',
          'rgba(255, 152, 0, 0.8)',
          'rgba(76, 175, 80, 0.8)',
          'rgba(244, 67, 54, 0.8)',
        ],
        borderColor: [
          'rgba(25, 118, 210, 1)',
          'rgba(156, 39, 176, 1)',
          'rgba(255, 152, 0, 1)',
          'rgba(76, 175, 80, 1)',
          'rgba(244, 67, 54, 1)',
        ],
        borderWidth: 2,
      },
    ],
  } : null;

  // Données des meilleurs étudiants
  const donneesMeilleursEtudiants = statistiques.top_students ? {
    labels: statistiques.top_students.map(etudiant => `${etudiant.first_name} ${etudiant.last_name}`),
    datasets: [
      {
        label: 'Étoiles',
        data: statistiques.top_students.map(etudiant => etudiant.total_stars),
        backgroundColor: 'rgba(255, 193, 7, 0.8)',
        borderColor: 'rgba(255, 193, 7, 1)',
        borderWidth: 2,
        borderRadius: 5,
      },
    ],
  } : null;

  return (
    <Box sx={{ pb: 4 }}>
      {/* En-tête */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        p: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 2,
        color: 'white'
      }}>
        <Box>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Tableau de Bord Administrateur
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Vue d'ensemble du système éducatif
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          onClick={gererActualisation}
          startIcon={<Refresh />}
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
      
      {/* Alertes */}
      {statistiques.alerts && statistiques.alerts.length > 0 && (
        <Box sx={{ mb: 4 }}>
          {statistiques.alerts.map((alerte, index) => (
            <Alert 
              severity={alerte.severity || "info"} 
              key={index} 
              sx={{ mb: 1, borderRadius: 2 }}
            >
              {alerte.message}
            </Alert>
          ))}
        </Box>
      )}
      
      <Grid container spacing={4}>
        {/* Statistiques générales - Cartes améliorées */}
        <Grid item xs={12} sm={6} md={3}>
          <CarteStatistique
            titre="Total Étudiants"
            valeur={statistiques.total_students}
            icone={<People />}
            couleur="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <CarteStatistique
            titre="Total Enseignants"
            valeur={statistiques.total_teachers}
            icone={<School />}
            couleur="secondary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <CarteStatistique
            titre="Total Évaluations"
            valeur={statistiques.total_tasks}
            icone={<Assignment />}
            couleur="warning"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <CarteStatistique
            titre="Évaluations Terminées"
            valeur={statistiques.total_completed_tasks}
            icone={<CheckCircle />}
            couleur="success"
          />
        </Grid>
        
        {/* Distribution des étudiants par niveau */}
        {donneesDistributionNiveaux && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', borderRadius: 3, boxShadow: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Répartition des Étudiants par Niveau
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                <Pie 
                  data={donneesDistributionNiveaux} 
                  options={{ 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 20,
                          usePointStyle: true,
                        }
                      }
                    }
                  }} 
                />
              </Box>
            </Paper>
          </Grid>
        )}
        
        {/* Meilleurs étudiants - graphique */}
        {donneesMeilleursEtudiants && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', borderRadius: 3, boxShadow: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Meilleurs Étudiants
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ height: 300 }}>
                <Bar 
                  data={donneesMeilleursEtudiants} 
                  options={{ 
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0,0,0,0.1)'
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
                      }
                    }
                  }} 
                />
              </Box>
            </Paper>
          </Grid>
        )}
        
        {/* Liste des meilleurs étudiants */}
        {statistiques.top_students && statistiques.top_students.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                🏆 Top 10 des Étudiants
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <TableContainer>
                <Table aria-label="tableau des meilleurs étudiants">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Rang</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Nom de l'étudiant</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Niveau</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Total d'étoiles</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Dernière Activité</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statistiques.top_students.map((etudiant, index) => (
                      <TableRow 
                        key={etudiant.id}
                        sx={{ 
                          '&:hover': { bgcolor: 'grey.50' },
                          borderLeft: index < 3 ? `4px solid ${index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'}` : 'none'
                        }}
                      >
                        <TableCell>
                          <Chip 
                            label={index + 1} 
                            size="small"
                            color={index < 3 ? 'primary' : 'default'}
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'medium' }}>
                          {`${etudiant.first_name} ${etudiant.last_name}`}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={etudiant.level_name || 'N/A'} 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            ⭐ <Typography sx={{ ml: 0.5, fontWeight: 'bold' }}>{etudiant.total_stars}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {new Date(etudiant.last_active).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="small" 
                            variant="outlined"
                            onClick={() => gererVoirEtudiant(etudiant.id)}
                            sx={{ borderRadius: 2 }}
                          >
                            Voir Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        )}
        
        {/* Activités récentes */}
        {statistiques.recent_activities && statistiques.recent_activities.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                📊 Activités Récentes
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <TableContainer>
                <Table aria-label="tableau des activités récentes">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Heure</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Utilisateur</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Activité</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Détails</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statistiques.recent_activities.map((activite) => (
                      <TableRow 
                        key={activite.id}
                        sx={{ '&:hover': { bgcolor: 'grey.50' } }}
                      >
                        <TableCell>
                          {new Date(activite.timestamp).toLocaleString('fr-FR')}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'medium' }}>
                          {activite.user_name}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={activite.action} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{activite.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default TableauDeBordAdmin;