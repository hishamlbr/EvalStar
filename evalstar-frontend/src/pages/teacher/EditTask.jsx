// src/pages/teacher/EditTask.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Divider,
  Grid,
  Avatar,
  Snackbar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { teacherAPI, commonAPI } from '../../api/api';

const EditTask = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    title: '',
    max_stars: 1,
    deadline: '',
    groups: [],
    questions: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch task details and available groups in parallel
        const [taskResponse, groupsResponse] = await Promise.all([
          teacherAPI.getTaskDetails(user.id, taskId),
          teacherAPI.getGroups(user.id)
        ]);

        const task = taskResponse.data.task;
        setAvailableGroups(groupsResponse.data);
        
        setFormData({
          title: task.title,
          max_stars: task.max_stars,
          deadline: task.deadline ? task.deadline.split('T')[0] : '',
          groups: task.groups.map(g => g.id),
          questions: task.questions.map(q => ({
            id: q.id,
            question_text: q.question_text,
            answers: q.answers.map(a => ({
              id: a.id,
              answer_text: a.answer_text,
              is_correct: a.is_correct
            }))
          }))
        });
      } catch (err) {
        console.error('Error fetching task data:', err);
        setError('Erreur lors du chargement des données de la tâche');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id && taskId) {
      fetchData();
    }
  }, [user, taskId]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGroupChange = (event) => {
    const value = typeof event.target.value === 'string' 
      ? event.target.value.split(',') 
      : event.target.value;
    handleInputChange('groups', value);
  };

  const handleQuestionChange = (questionIndex, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const handleAnswerChange = (questionIndex, answerIndex, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].answers[answerIndex] = {
      ...updatedQuestions[questionIndex].answers[answerIndex],
      [field]: value
    };
    
    // If setting this answer as correct, uncheck others
    if (field === 'is_correct' && value) {
      updatedQuestions[questionIndex].answers.forEach((answer, idx) => {
        if (idx !== answerIndex) {
          answer.is_correct = false;
        }
      });
    }
    
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const addAnswer = (questionIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].answers.push({
      answer_text: '',
      is_correct: false
    });
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const removeAnswer = (questionIndex, answerIndex) => {
    const updatedQuestions = [...formData.questions];
    if (updatedQuestions[questionIndex].answers.length > 2) {
      updatedQuestions[questionIndex].answers.splice(answerIndex, 1);
      setFormData(prev => ({
        ...prev,
        questions: updatedQuestions
      }));
    }
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question_text: '',
          answers: [
            { answer_text: '', is_correct: true },
            { answer_text: '', is_correct: false }
          ]
        }
      ]
    }));
  };

  const removeQuestion = (questionIndex) => {
    if (formData.questions.length > 1) {
      const updatedQuestions = formData.questions.filter((_, idx) => idx !== questionIndex);
      setFormData(prev => ({
        ...prev,
        questions: updatedQuestions
      }));
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Le titre est requis');
      return false;
    }
    
    if (formData.groups.length === 0) {
      setError('Au moins un groupe doit être sélectionné');
      return false;
    }
    
    if (formData.questions.length === 0) {
      setError('Au moins une question est requise');
      return false;
    }
    
    for (let i = 0; i < formData.questions.length; i++) {
      const question = formData.questions[i];
      
      if (!question.question_text.trim()) {
        setError(`La question ${i + 1} ne peut pas être vide`);
        return false;
      }
      
      if (question.answers.length < 2) {
        setError(`La question ${i + 1} doit avoir au moins 2 réponses`);
        return false;
      }
      
      const correctAnswers = question.answers.filter(a => a.is_correct);
      if (correctAnswers.length !== 1) {
        setError(`La question ${i + 1} doit avoir exactement une réponse correcte`);
        return false;
      }
      
      for (let j = 0; j < question.answers.length; j++) {
        if (!question.answers[j].answer_text.trim()) {
          setError(`Toutes les réponses de la question ${i + 1} doivent être remplies`);
          return false;
        }
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const taskData = {
        title: formData.title.trim(),
        max_stars: parseInt(formData.max_stars),
        deadline: formData.deadline || null,
        groups: formData.groups
      };
      
      await teacherAPI.updateTask(user.id, taskId, taskData);
      
      setSnackbar({
        open: true,
        message: 'Tâche mise à jour avec succès',
        severity: 'success'
      });
      
      // Navigate back to tasks list after a short delay
      setTimeout(() => {
        navigate('/teacher/tasks');
      }, 1000);
      
    } catch (err) {
      console.error('Error updating task:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour de la tâche';
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
        <CircularProgress size={48} />
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          Chargement de la tâche...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Paper 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 4,
          mb: 4,
          borderRadius: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton
            onClick={() => navigate('/teacher/tasks')}
            sx={{ 
              color: 'white', 
              mr: 2,
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 3, width: 56, height: 56 }}>
            <AssignmentIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Modifier l'Évaluation
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Modifiez les détails de votre évaluation
            </Typography>
          </Box>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                  Informations de Base
                </Typography>
                
                <TextField
                  fullWidth
                  label="Titre de l'évaluation"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  margin="normal"
                  required
                  sx={{ mb: 2 }}
                />
                
                <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
                  <InputLabel>Nombre maximum d'étoiles</InputLabel>
                  <Select
                    value={formData.max_stars}
                    onChange={(e) => handleInputChange('max_stars', e.target.value)}
                    label="Nombre maximum d'étoiles"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <MenuItem key={num} value={num}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {Array.from({ length: num }, (_, i) => (
                            <StarIcon key={i} sx={{ color: 'gold', fontSize: '1.2rem' }} />
                          ))}
                          <Typography sx={{ ml: 1 }}>({num})</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  type="date"
                  label="Date limite (optionnelle)"
                  value={formData.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Groups Selection */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <GroupIcon sx={{ mr: 1, color: 'primary.main' }} />
                  Groupes Cibles
                </Typography>
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Sélectionner les groupes</InputLabel>
                  <Select
                    multiple
                    value={formData.groups}
                    onChange={handleGroupChange}
                    input={<OutlinedInput label="Sélectionner les groupes" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const group = availableGroups.find(g => g.id === value);
                          return (
                            <Chip 
                              key={value} 
                              label={`${group?.level?.name}/${group?.group_number}`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {availableGroups.map((group) => (
                      <MenuItem key={group.id} value={group.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <GroupIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                          {group.level.name}/{group.group_number}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {formData.groups.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Groupes sélectionnés:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.groups.map((groupId) => {
                        const group = availableGroups.find(g => g.id === groupId);
                        return (
                          <Chip
                            key={groupId}
                            label={`${group?.level?.name}/${group?.group_number}`}
                            color="primary"
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/teacher/tasks')}
                disabled={saving}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={saving}
                sx={{ px: 4 }}
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      {/* Note about questions */}
      <Paper sx={{ mt: 4, p: 3, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
        <Typography variant="body2" color="info.main">
          <strong>Note:</strong> La modification des questions n'est pas disponible dans cette interface pour maintenir l'intégrité des évaluations déjà complétées. Pour modifier les questions, contactez l'administrateur ou créez une nouvelle évaluation.
        </Typography>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EditTask;