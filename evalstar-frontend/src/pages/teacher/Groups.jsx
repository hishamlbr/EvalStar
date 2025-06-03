// src/pages/teacher/Groupes.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Divider,
  Chip,
  Avatar,
  CardHeader,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Group as GroupIcon,
  PeopleAlt as StudentsIcon,
  Assignment as EvaluationIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  School as SchoolIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { teacherAPI } from '../../api/api';

const Groupes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groupes, setGroupes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    const recupererGroupes = async () => {
      try {
        const response = await teacherAPI.getGroups(user.id);
        setGroupes(response.data);
      } catch (err) {
        console.error('Erreur lors de la récupération des groupes:', err);
        setErreur('Échec du chargement des groupes. Veuillez réessayer plus tard.');
      } finally {
        setChargement(false);
      }
    };

    if (user?.id) {
      recupererGroupes();
    }
  }, [user]);

  if (chargement) {
    return (
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
          Chargement des groupes...
        </Typography>
      </Box>
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
            startIcon={<AddIcon />}
          >
            Réessayer
          </Button>
        </Paper>
      </Container>
    );
  }

  // Grouper par niveau
  const groupesParNiveau = groupes.reduce((acc, groupe) => {
    const niveauId = groupe.level.id;
    if (!acc[niveauId]) {
      acc[niveauId] = {
        niveau: groupe.level,
        groupes: []
      };
    }
    acc[niveauId].groupes.push(groupe);
    return acc;
  }, {});

  const obtenirCouleurGroupe = (numeroGroupe) => {
    const couleurs = ['primary', 'secondary', 'success', 'warning', 'info'];
    return couleurs[numeroGroupe % couleurs.length];
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
            <SchoolIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              Mes Groupes d'Enseignement
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Gérez et consultez tous vos groupes d'étudiants assignés.
            </Typography>
          </Box>
        </Box>
        
        <Paper elevation={1} sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <GroupIcon sx={{ mr: 1 }} />
            Total: {groupes.length} groupe{groupes.length > 1 ? 's' : ''}
          </Typography>
        </Paper>
      </Box>

      {Object.values(groupesParNiveau).length === 0 ? (
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center', bgcolor: 'grey.50' }}>
          <GroupIcon color="action" sx={{ fontSize: 80, opacity: 0.3, mb: 3 }} />
          <Typography variant="h5" gutterBottom>
            Aucun Groupe Assigné
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Vous n'avez encore aucun groupe assigné.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Contactez l'administration pour obtenir vos assignations.
          </Typography>
        </Paper>
      ) : (
        Object.values(groupesParNiveau).map((donneesNiveau) => (
          <Box key={donneesNiveau.niveau.id} sx={{ mb: 5 }}>
            <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <GroupIcon sx={{ mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {donneesNiveau.niveau.name}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {donneesNiveau.groupes.length} groupe{donneesNiveau.groupes.length > 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Box>
            </Paper>
            
            <Grid container spacing={3}>
              {donneesNiveau.groupes.map((groupe) => (
                <Grid item xs={12} sm={6} md={4} key={groupe.id}>
                  <Card 
                    elevation={3}
                    sx={{ 
                      height: '100%',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      }
                    }}
                  >
                    <CardHeader
                      avatar={
                        <Avatar 
                          sx={{ 
                            bgcolor: `${obtenirCouleurGroupe(groupe.group_number)}.main`,
                            width: 48,
                            height: 48,
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {groupe.group_number}
                        </Avatar>
                      }
                      title={
                        <Typography variant="h6" fontWeight="bold">
                          Groupe {groupe.group_number}
                        </Typography>
                      }
                      subheader={donneesNiveau.niveau.name}
                      action={
                        <Tooltip title="Voir les détails">
                          <IconButton 
                            color="primary"
                            onClick={() => navigate(`/teacher/groups/${groupe.id}/students`)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      }
                    />
                    
                    <CardContent sx={{ pt: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Badge badgeContent={groupe.students_count || '?'} color="primary">
                          <StudentsIcon color="action" />
                        </Badge>
                        <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                          Étudiants inscrits
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                        <Chip 
                          size="small" 
                          icon={<SchoolIcon />}
                          label={donneesNiveau.niveau.name} 
                          color="primary" 
                          variant="outlined" 
                        />
                        <Chip 
                          size="small" 
                          icon={<GroupIcon />}
                          label={`Groupe ${groupe.group_number}`} 
                          color="secondary" 
                          variant="outlined" 
                        />
                      </Box>
                    </CardContent>
                    
                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                      <Button 
                        size="small" 
                        variant="outlined"
                        startIcon={<StudentsIcon />}
                        onClick={() => navigate(`/teacher/groups/${groupe.id}/students`)}
                        sx={{ flex: 1, mr: 1 }}
                      >
                        Étudiants
                      </Button>
                      <Button 
                        size="small" 
                        variant="contained"
                        startIcon={<EvaluationIcon />}
                        onClick={() => {
                          const state = { 
                            preselectedGroups: [groupe.id],
                            preselectedLevel: donneesNiveau.niveau.id
                          };
                          navigate('/teacher/tasks/create', { state });
                        }}
                        sx={{ flex: 1, ml: 1 }}
                      >
                        Évaluation
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))
      )}
      
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Paper elevation={2} sx={{ p: 3, bgcolor: 'success.light' }}>
          <Typography variant="h6" gutterBottom color="success.contrastText">
            Créer une Nouvelle Évaluation
          </Typography>
          <Button 
            variant="contained" 
            color="success"
            startIcon={<EvaluationIcon />}
            onClick={() => navigate('/teacher/tasks/create')}
            size="large"
            sx={{ mt: 1, px: 4 }}
          >
            Nouvelle Évaluation
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Groupes;