import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Fade,
  Slide,
  Avatar,
  Divider,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  School,
  AdminPanelSettings,
  Lock,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { USER_TYPES } from '../../utils/constants';

const Login = () => {
  const { login, isAuthenticated, userType, error } = useAuth();
  const [formData, setFormData] = useState({
    userType: USER_TYPES.ADMIN,
    identifier: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated) {
    switch (userType) {
      case USER_TYPES.ADMIN:
        return <Navigate to="/admin/dashboard" />;
      case USER_TYPES.TEACHER:
        return <Navigate to="/teacher/dashboard" />;
      case USER_TYPES.STUDENT:
        return <Navigate to="/student/dashboard" />;
      default:
        return <Navigate to="/" />;
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError('');

    if (!formData.identifier || !formData.password) {
      setFormError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    try {
      const result = await login(formData.userType, formData.identifier, formData.password);
      if (!result.success) {
        setFormError(result.error || 'Échec de la connexion');
      }
    } catch (err) {
      setFormError('Une erreur s\'est produite lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const getIdentifierLabel = () => {
    switch (formData.userType) {
      case USER_TYPES.ADMIN:
        return 'Email';
      case USER_TYPES.TEACHER:
        return 'N° Apogée';
      case USER_TYPES.STUDENT:
        return 'CNE';
      default:
        return 'Identifiant';
    }
  };

  const getUserTypeIcon = () => {
    switch (formData.userType) {
      case USER_TYPES.ADMIN:
        return <AdminPanelSettings sx={{ fontSize: 40, color: '#1976d2' }} />;
      case USER_TYPES.TEACHER:
        return <Person sx={{ fontSize: 40, color: '#2e7d32' }} />;
      case USER_TYPES.STUDENT:
        return <School sx={{ fontSize: 40, color: '#ed6c02' }} />;
      default:
        return <Person sx={{ fontSize: 40 }} />;
    }
  };

  const getIdentifierIcon = () => {
    switch (formData.userType) {
      case USER_TYPES.ADMIN:
        return <Email />;
      case USER_TYPES.TEACHER:
        return <Person />;
      case USER_TYPES.STUDENT:
        return <School />;
      default:
        return <Person />;
    }
  };

  const getUserTypeColor = () => {
    switch (formData.userType) {
      case USER_TYPES.ADMIN:
        return '#1976d2';
      case USER_TYPES.TEACHER:
        return '#2e7d32';
      case USER_TYPES.STUDENT:
        return '#ed6c02';
      default:
        return '#1976d2';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={800}>
          <Paper
            elevation={24}
            sx={{
              p: 6,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
              },
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Logo/Icon Section */}
              <Slide direction="down" in timeout={600}>
                <Box sx={{ mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      background: `linear-gradient(135deg, ${getUserTypeColor()}, ${getUserTypeColor()}dd)`,
                      mb: 2,
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    {getUserTypeIcon()}
                  </Avatar>
                </Box>
              </Slide>

              {/* Title */}
              <Typography
                component="h1"
                variant="h3"
                align="center"
                sx={{
                  mb: 2,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                EvalStar
              </Typography>

              <Typography
                variant="h6"
                align="center"
                color="text.secondary"
                sx={{ mb: 4, fontWeight: 300 }}
              >
                Bienvenue sur votre plateforme d'évaluation
              </Typography>

              <Divider sx={{ width: '100%', mb: 4 }} />

              {/* Error Alert */}
              {(error || formError) && (
                <Slide direction="left" in timeout={400}>
                  <Alert
                    severity="error"
                    sx={{
                      mb: 3,
                      width: '100%',
                      borderRadius: 2,
                      '& .MuiAlert-icon': {
                        fontSize: '1.5rem',
                      },
                    }}
                  >
                    {formError || error}
                  </Alert>
                </Slide>
              )}

              {/* Form */}
              <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{ width: '100%' }}
              >
                <Slide direction="right" in timeout={500}>
                  <FormControl
                    fullWidth
                    margin="normal"
                    sx={{
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-1px)',
                          boxShadow: `0 4px 12px ${getUserTypeColor()}33`,
                        },
                      },
                    }}
                  >
                    <InputLabel
                      id="user-type-label"
                      sx={{ fontWeight: 500 }}
                    >
                      Type d'utilisateur
                    </InputLabel>
                    <Select
                      labelId="user-type-label"
                      id="userType"
                      name="userType"
                      value={formData.userType}
                      label="Type d'utilisateur"
                      onChange={handleChange}
                      sx={{
                        '& .MuiSelect-select': {
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        },
                      }}
                    >
                      <MenuItem value={USER_TYPES.ADMIN}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AdminPanelSettings sx={{ color: '#1976d2' }} />
                          Administrateur
                        </Box>
                      </MenuItem>
                      <MenuItem value={USER_TYPES.TEACHER}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person sx={{ color: '#2e7d32' }} />
                          Enseignant
                        </Box>
                      </MenuItem>
                      <MenuItem value={USER_TYPES.STUDENT}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <School sx={{ color: '#ed6c02' }} />
                          Étudiant
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Slide>

                <Slide direction="left" in timeout={600}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="identifier"
                    label={getIdentifierLabel()}
                    name="identifier"
                    autoComplete="off"
                    value={formData.identifier}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {getIdentifierIcon()}
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-1px)',
                          boxShadow: `0 4px 12px ${getUserTypeColor()}33`,
                        },
                      },
                      '& .MuiFormLabel-root': {
                        fontWeight: 500,
                      },
                    }}
                  />
                </Slide>

                <Slide direction="right" in timeout={700}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Mot de passe"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 4,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-1px)',
                          boxShadow: `0 4px 12px ${getUserTypeColor()}33`,
                        },
                      },
                      '& .MuiFormLabel-root': {
                        fontWeight: 500,
                      },
                    }}
                  />
                </Slide>

                <Slide direction="up" in timeout={800}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      py: 2,
                      borderRadius: 2,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      background: `linear-gradient(135deg, ${getUserTypeColor()}, ${getUserTypeColor()}dd)`,
                      boxShadow: `0 4px 12px ${getUserTypeColor()}33`,
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        background: `linear-gradient(135deg, ${getUserTypeColor()}dd, ${getUserTypeColor()}bb)`,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 6px 20px ${getUserTypeColor()}44`,
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                      },
                      '&.Mui-disabled': {
                        background: 'rgba(0, 0, 0, 0.12)',
                        color: 'rgba(0, 0, 0, 0.26)',
                      },
                    }}
                  >
                    {loading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderTop: '2px solid white',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            '@keyframes spin': {
                              '0%': { transform: 'rotate(0deg)' },
                              '100%': { transform: 'rotate(360deg)' },
                            },
                          }}
                        />
                        Connexion en cours...
                      </Box>
                    ) : (
                      'Se connecter'
                    )}
                  </Button>
                </Slide>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login;