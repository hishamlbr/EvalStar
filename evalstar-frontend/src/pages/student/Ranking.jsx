import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  Grid,
  Avatar,
  Divider,
  LinearProgress,
  Fade,
  Zoom,
  useTheme,
  alpha,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  StarOutline as StarOutlineIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  SchoolOutlined as SchoolIcon,
  WorkspacePremium as PremiumIcon,
  LocalFireDepartment as FireIcon
} from '@mui/icons-material';
import { studentAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { getStarIcons } from '../../utils/helpers';

const StudentRanking = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classRanking, setClassRanking] = useState({
    classmates: [],
    student_rank: 0,
    total_students: 0
  });

  useEffect(() => {
    const fetchRankingData = async () => {
      try {
        setLoading(true);
        const response = await studentAPI.getClassRanking(user.id);
        setClassRanking(response.data);
        setLoading(false);
      } catch (err) {
        setError('Échec du chargement des données de classement');
        setLoading(false);
      }
    };

    fetchRankingData();
  }, [user.id]);

  if (loading) {
    return (
      <Container>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh',
          gap: 2
        }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" color="text.secondary">
            Chargement du classement...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Fade in timeout={400}>
          <Alert 
            severity="error" 
            sx={{ 
              mt: 3,
              borderRadius: 2,
              fontSize: '1rem'
            }}
          >
            {error}
          </Alert>
        </Fade>
      </Container>
    );
  }

  // Trouver l'étudiant actuel dans la liste des camarades de classe
  const currentStudent = classRanking.classmates.find(student => student.id === user.id);
  const maxStars = Math.max(...classRanking.classmates.map(s => s.total_stars || 0), 1);

  // Statistiques de classe
  const getClassStats = () => {
    const totalStars = classRanking.classmates.reduce((sum, student) => sum + (student.total_stars || 0), 0);
    const averageStars = totalStars / classRanking.classmates.length;
    return {
      totalStars,
      averageStars: Math.round(averageStars * 10) / 10
    };
  };

  const classStats = getClassStats();

  return (
    <Container maxWidth="lg">
      {/* En-tête avec design moderne */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 4,
        pb: 2,
        borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
      }}>
        <Avatar sx={{ 
          bgcolor: theme.palette.primary.main, 
          width: 48, 
          height: 48,
          mr: 2
        }}>
          <TrophyIcon fontSize="large" />
        </Avatar>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
            Classement de la Classe
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Comparez vos performances avec vos camarades
          </Typography>
        </Box>
      </Box>

      {/* Statistiques de classe */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          borderRadius: 2
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar sx={{ 
                bgcolor: theme.palette.info.main, 
                width: 56, 
                height: 56,
                mx: 'auto',
                mb: 1
              }}>
                <SchoolIcon fontSize="large" />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {classRanking.total_students}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Étudiants dans la classe
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar sx={{ 
                bgcolor: theme.palette.warning.main, 
                width: 56, 
                height: 56,
                mx: 'auto',
                mb: 1
              }}>
                <StarIcon fontSize="large" />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {classStats.totalStars}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Étoiles totales de la classe
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar sx={{ 
                bgcolor: theme.palette.success.main, 
                width: 56, 
                height: 56,
                mx: 'auto',
                mb: 1
              }}>
                <TrendingUpIcon fontSize="large" />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {classStats.averageStars}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Moyenne d'étoiles
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Carte récapitulative personnalisée */}
      <Zoom in timeout={600}>
        <Card 
          elevation={0} 
          sx={{ 
            mb: 4,
            background: `linear-gradient(135deg, ${getRankGradient(classRanking.student_rank)} 0%, ${alpha(getRankColor(classRanking.student_rank), 0.1)} 100%)`,
            border: `2px solid ${getRankColor(classRanking.student_rank)}`,
            borderRadius: 3,
            overflow: 'visible',
            position: 'relative'
          }}
        >
          {/* Badge de rang */}
          <Box
            sx={{
              position: 'absolute',
              top: -12,
              right: 20,
              zIndex: 1
            }}
          >
            <Chip
              icon={getRankIcon(classRanking.student_rank)}
              label={`${classRanking.student_rank}${getRankSuffix(classRanking.student_rank)} place`}
              sx={{
                bgcolor: getRankColor(classRanking.student_rank),
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                height: 32,
                '& .MuiChip-icon': {
                  color: 'white'
                }
              }}
            />
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="center" justifyContent="center">
                  <Avatar 
                    sx={{ 
                      width: 100, 
                      height: 100, 
                      bgcolor: getRankColor(classRanking.student_rank),
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      border: `4px solid white`,
                      boxShadow: theme.shadows[8]
                    }}
                  >
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </Avatar>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Box textAlign={{ xs: 'center', md: 'left' }}>
                  <Typography variant="h4" component="div" fontWeight="bold" sx={{ mb: 1 }}>
                    {user.first_name} {user.last_name}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    CNE: {user.cne}
                  </Typography>
                  
                  {/* Affichage des étoiles avec la méthode getStarIcons */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    mb: 2,
                    p: 2,
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
                  }}>
                    <Box sx={{ mr: 2 }}>
                      {getStarIcons(currentStudent?.total_stars || 0, Math.max(currentStudent?.total_stars || 0, 5))}
                    </Box>
                    <Typography variant="h5" fontWeight="bold" color="warning.main">
                      {currentStudent?.total_stars || 0}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                      étoiles obtenues
                    </Typography>
                  </Box>
                  
                  {/* Barre de progression comparative */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Performance vs classe
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {Math.round(((currentStudent?.total_stars || 0) / maxStars) * 100)}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={((currentStudent?.total_stars || 0) / maxStars) * 100}
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.grey[300], 0.3)
                      }}
                      color={getProgressColor(classRanking.student_rank)}
                    />
                  </Box>

                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    gap: 2
                  }}>
                    <Chip
                      icon={<TrophyIcon />}
                      label={`Rang ${classRanking.student_rank}/${classRanking.total_students}`}
                      color="primary"
                      variant="outlined"
                      size="large"
                    />
                    {(currentStudent?.total_stars || 0) > classStats.averageStars && (
                      <Chip
                        icon={<FireIcon />}
                        label="Au-dessus de la moyenne"
                        color="success"
                        size="small"
                      />
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Zoom>

      {/* Podium amélioré */}
      {classRanking.classmates.length > 0 && (
        <Box sx={{ mb: 4, display: { xs: 'none', md: 'block' } }}>
          <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
            🏆 Podium de la Classe
          </Typography>
          <Box display="flex" alignItems="flex-end" justifyContent="center" sx={{ height: 280, mb: 2 }}>
            {/* Deuxième place */}
            {classRanking.classmates.length > 1 && (
              <Zoom in timeout={700}>
                <Box sx={{ width: 160, mx: 2, textAlign: 'center' }}>
                  <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                    <Avatar sx={{ 
                      width: 70, 
                      height: 70, 
                      mx: 'auto', 
                      bgcolor: '#C0C0C0',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      border: '4px solid white',
                      boxShadow: theme.shadows[4]
                    }}>
                      {classRanking.classmates[1].first_name?.[0]}{classRanking.classmates[1].last_name?.[0]}
                    </Avatar>
                    <Avatar
                      sx={{ 
                        position: 'absolute', 
                        top: -8, 
                        right: -8, 
                        bgcolor: '#C0C0C0',
                        width: 32,
                        height: 32,
                        fontSize: '1.2rem'
                      }}
                    >
                      🥈
                    </Avatar>
                  </Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                    {classRanking.classmates[1].first_name} {classRanking.classmates[1].last_name}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {getStarIcons(classRanking.classmates[1].total_stars || 0, Math.max(classRanking.classmates[1].total_stars || 0, 3))}
                  </Box>
                  <Typography variant="h6" fontWeight="bold" color="text.secondary">
                    {classRanking.classmates[1].total_stars || 0} ⭐
                  </Typography>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      height: 140, 
                      width: '100%', 
                      background: 'linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      border: '3px solid #C0C0C0',
                      borderRadius: 2,
                      mt: 2
                    }}
                  >
                    <Typography variant="h3" sx={{ color: '#666', mb: 1 }}>🥈</Typography>
                    <Typography variant="h5" sx={{ color: '#666', fontWeight: 'bold' }}>2e</Typography>
                  </Paper>
                </Box>
              </Zoom>
            )}
            
            {/* Première place */}
            {classRanking.classmates.length > 0 && (
              <Zoom in timeout={500}>
                <Box sx={{ width: 180, mx: 2, textAlign: 'center' }}>
                  <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                    <Avatar sx={{ 
                      width: 80, 
                      height: 80, 
                      mx: 'auto', 
                      bgcolor: '#FFD700',
                      fontSize: '1.8rem',
                      fontWeight: 'bold',
                      border: '4px solid white',
                      boxShadow: theme.shadows[8]
                    }}>
                      {classRanking.classmates[0].first_name?.[0]}{classRanking.classmates[0].last_name?.[0]}
                    </Avatar>
                    <Avatar
                      sx={{ 
                        position: 'absolute', 
                        top: -10, 
                        right: -10, 
                        bgcolor: '#FFD700',
                        width: 36,
                        height: 36,
                        fontSize: '1.4rem'
                      }}
                    >
                      👑
                    </Avatar>
                  </Box>
                  <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                    {classRanking.classmates[0].first_name} {classRanking.classmates[0].last_name}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {getStarIcons(classRanking.classmates[0].total_stars || 0, Math.max(classRanking.classmates[0].total_stars || 0, 5))}
                  </Box>
                  <Typography variant="h5" fontWeight="bold" color="warning.main">
                    {classRanking.classmates[0].total_stars || 0} ⭐
                  </Typography>
                  <Paper 
                    elevation={4} 
                    sx={{ 
                      height: 170, 
                      width: '100%', 
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFF8DC 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      border: '4px solid #FFD700',
                      borderRadius: 2,
                      boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)',
                      mt: 2
                    }}
                  >
                    <Typography variant="h2" sx={{ color: '#B8860B', mb: 1 }}>🏆</Typography>
                    <Typography variant="h4" sx={{ color: '#B8860B', fontWeight: 'bold' }}>1er</Typography>
                  </Paper>
                </Box>
              </Zoom>
            )}
            
            {/* Troisième place */}
            {classRanking.classmates.length > 2 && (
              <Zoom in timeout={900}>
                <Box sx={{ width: 140, mx: 2, textAlign: 'center' }}>
                  <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                    <Avatar sx={{ 
                      width: 60, 
                      height: 60, 
                      mx: 'auto', 
                      bgcolor: '#CD7F32',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      border: '3px solid white',
                      boxShadow: theme.shadows[3]
                    }}>
                      {classRanking.classmates[2].first_name?.[0]}{classRanking.classmates[2].last_name?.[0]}
                    </Avatar>
                    <Avatar
                      sx={{ 
                        position: 'absolute', 
                        top: -6, 
                        right: -6, 
                        bgcolor: '#CD7F32',
                        width: 28,
                        height: 28,
                        fontSize: '1rem'
                      }}
                    >
                      🥉
                    </Avatar>
                  </Box>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                    {classRanking.classmates[2].first_name} {classRanking.classmates[2].last_name}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {getStarIcons(classRanking.classmates[2].total_stars || 0, Math.max(classRanking.classmates[2].total_stars || 0, 3))}
                  </Box>
                  <Typography variant="h6" fontWeight="bold" color="text.secondary">
                    {classRanking.classmates[2].total_stars || 0} ⭐
                  </Typography>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      height: 110, 
                      width: '100%', 
                      background: 'linear-gradient(135deg, #CD7F32 0%, #DEB887 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      border: '3px solid #CD7F32',
                      borderRadius: 2,
                      mt: 2
                    }}
                  >
                    <Typography variant="h4" sx={{ color: '#8B4513', mb: 1 }}>🥉</Typography>
                    <Typography variant="h6" sx={{ color: '#8B4513', fontWeight: 'bold' }}>3e</Typography>
                  </Paper>
                </Box>
              </Zoom>
            )}
          </Box>
        </Box>
      )}

      {/* Tableau complet modernisé */}
      <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
        📊 Classement Complet
      </Typography>
      <Fade in timeout={800}>
        <TableContainer 
          component={Paper} 
          elevation={0}
          sx={{ 
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            overflow: 'hidden'
          }}
        >
          <Table aria-label="tableau de classement de la classe">
            <TableHead>
              <TableRow sx={{ 
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>Rang</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>Étudiant</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>CNE</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>Étoiles</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>Performance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classRanking.classmates.map((student, index) => (
                <TableRow 
                  key={student.id}
                  sx={{ 
                    backgroundColor: student.id === user.id 
                      ? alpha(theme.palette.primary.main, 0.1)
                      : index % 2 === 0 
                      ? alpha(theme.palette.background.paper, 0.5)
                      : 'inherit',
                    '&:hover': { 
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      transform: 'scale(1.01)',
                      transition: 'all 0.2s ease-in-out'
                    },
                    borderLeft: student.id === user.id ? `4px solid ${theme.palette.primary.main}` : 'none'
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: getRankColor(index + 1),
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        mr: 1
                      }}>
                        {index + 1}
                      </Avatar>
                      {index < 3 && (
                        <Chip 
                          size="small" 
                          label={medalLabel(index + 1)} 
                          sx={{ 
                            backgroundColor: medalColor(index + 1),
                            color: 'white',
                            fontSize: '0.7rem',
                            fontWeight: 'bold'
                          }} 
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ 
                        width: 36, 
                        height: 36, 
                        mr: 2,
                        bgcolor: student.id === user.id ? theme.palette.primary.main : theme.palette.grey[400],
                        fontSize: '0.9rem'
                      }}>
                        {student.first_name?.[0]}{student.last_name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={student.id === user.id ? 'bold' : 'normal'}>
                          {student.first_name} {student.last_name}
                          {student.id === user.id && (
                            <Chip 
                              size="small" 
                              label="Vous" 
                              color="primary" 
                              sx={{ ml: 1, fontSize: '0.7rem' }} 
                            />
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                      {student.cne}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
                      <Box sx={{ mb: 1 }}>
                        {getStarIcons(student.total_stars || 0, Math.min(student.total_stars || 0, 5))}
                      </Box>
                      <Typography variant="h6" fontWeight="bold" color="warning.main">
                        {student.total_stars || 0}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ width: 80 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={((student.total_stars || 0) / maxStars) * 100}
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          mb: 0.5
                        }}
                        color={getProgressColor(index + 1)}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {Math.round(((student.total_stars || 0) / maxStars) * 100)}%
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Fade>
    </Container>
  );
};

// Fonctions d'aide améliorées
const getRankColor = (rank) => {
  switch (rank) {
    case 1: return '#FFD700'; // Or
    case 2: return '#C0C0C0'; // Argent
    case 3: return '#CD7F32'; // Bronze
    default: return '#1976d2'; // Bleu par défaut
  }
};

const getRankGradient = (rank) => {
  switch (rank) {
    case 1: return 'rgba(255, 215, 0, 0.2)'; // Or
    case 2: return 'rgba(192, 192, 192, 0.2)'; // Argent
    case 3: return 'rgba(205, 127, 50, 0.2)'; // Bronze
    default: return 'rgba(25, 118, 210, 0.1)'; // Bleu par défaut
  }
};

const getRankIcon = (rank) => {
  switch (rank) {
    case 1: return <TrophyIcon />;
    case 2: return <PremiumIcon />;
    case 3: return <StarIcon />;
    default: return <PersonIcon />;
  }
};

const getRankSuffix = (rank) => {
  if (rank === 1) return 'ère';
  return 'ème';
};

const getProgressColor = (rank) => {
  switch (rank) {
    case 1: return 'warning'; // Or
    case 2: return 'info'; // Argent
    case 3: return 'secondary'; // Bronze
    default: return 'primary';
  }
};

const medalColor = (rank) => {
  switch (rank) {
    case 1: return '#FFD700'; // Or
    case 2: return '#C0C0C0'; // Argent
    case 3: return '#CD7F32'; // Bronze
    default: return '#1976d2'; // Bleu par défaut
  }
};

const medalLabel = (rank) => {
  switch (rank) {
    case 1: return '🥇 1er';
    case 2: return '🥈 2e';
    case 3: return '🥉 3e';
    default: return `${rank}e`;
  }
};

export default StudentRanking;