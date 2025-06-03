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
} from '@mui/material';
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

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" sx={{ mb: 4 }}>
            Connexion à EvalStar
          </Typography>

          {(error || formError) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {formError || error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <FormControl fullWidth margin="normal">
              <InputLabel id="user-type-label">Type d'utilisateur</InputLabel>
              <Select
                labelId="user-type-label"
                id="userType"
                name="userType"
                value={formData.userType}
                label="Type d'utilisateur"
                onChange={handleChange}
              >
                <MenuItem value={USER_TYPES.ADMIN}>Administrateur</MenuItem>
                <MenuItem value={USER_TYPES.TEACHER}>Enseignant</MenuItem>
                <MenuItem value={USER_TYPES.STUDENT}>Étudiant</MenuItem>
              </Select>
            </FormControl>

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
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mot de passe"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
