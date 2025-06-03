// src/pages/teacher/CreateEvaluation.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FormControlLabel,
  Checkbox,
  IconButton,
  FormHelperText,
  Divider,
  Grid,
  Alert,
  Radio,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Fade,
  Tooltip,
  Badge,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Quiz as QuizIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { teacherAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

// Composant helper pour une question avec plusieurs réponses
const QuestionItem = ({ index, question, onChange, onDelete, isLast }) => {
  const [expanded, setExpanded] = useState(true);
  const correctAnswersCount = question.answers.filter(a => a.is_correct).length;
  const hasValidAnswers = question.answers.every(a => a.answer_text.trim());

  const handleAnswerChange = (answerIndex, field, value) => {
    const updatedAnswers = [...question.answers];
    updatedAnswers[answerIndex] = { ...updatedAnswers[answerIndex], [field]: value };
    
    // Si on marque cette réponse comme correcte, marquer les autres comme incorrectes
    if (field === 'is_correct' && value === true) {
      updatedAnswers.forEach((answer, idx) => {
        if (idx !== answerIndex) {
          updatedAnswers[idx] = { ...updatedAnswers[idx], is_correct: false };
        }
      });
    }
    
    onChange(index, 'answers', updatedAnswers);
  };

  const addAnswer = () => {
    const updatedAnswers = [...question.answers, { answer_text: '', is_correct: false }];
    onChange(index, 'answers', updatedAnswers);
  };

  const removeAnswer = (answerIndex) => {
    const updatedAnswers = question.answers.filter((_, idx) => idx !== answerIndex);
    onChange(index, 'answers', updatedAnswers);
  };

  const getQuestionStatus = () => {
    if (!question.question_text.trim()) return { color: 'error', icon: <WarningIcon />, text: 'Incomplète' };
    if (!hasValidAnswers) return { color: 'warning', icon: <WarningIcon />, text: 'Réponses manquantes' };
    if (correctAnswersCount !== 1) return { color: 'warning', icon: <WarningIcon />, text: 'Réponse correcte manquante' };
    return { color: 'success', icon: <CheckCircleIcon />, text: 'Complète' };
  };

  const status = getQuestionStatus();

  return (
    <Fade in={true} timeout={300}>
      <Card sx={{ mb: 3, border: '1px solid', borderColor: `${status.color}.light`, position: 'relative' }}>
        <CardContent sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                icon={<QuizIcon />}
                label={`Question ${index + 1}`}
                variant="outlined"
                color="primary"
              />
              <Chip
                icon={status.icon}
                label={status.text}
                color={status.color}
                size="small"
              />
            </Box>
            <Tooltip title={isLast ? "Vous devez avoir au moins une question" : "Supprimer cette question"}>
              <span>
                <IconButton 
                  color="error" 
                  onClick={() => onDelete(index)} 
                  disabled={isLast}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: 'error.light', 
                      color: 'white' 
                    } 
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
          
          <TextField
            fullWidth
            label="Texte de la question"
            value={question.question_text}
            onChange={(e) => onChange(index, 'question_text', e.target.value)}
            required
            margin="normal"
            multiline
            rows={2}
            placeholder="Saisissez votre question ici..."
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
          
          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CheckCircleIcon color="success" fontSize="small" />
              Réponses (sélectionnez la bonne réponse)
            </Typography>
            
            {question.answers.map((answer, answerIndex) => (
              <Box key={answerIndex} sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                p: 2,
                borderRadius: 2,
                backgroundColor: answer.is_correct ? 'success.light' : 'grey.50',
                border: '1px solid',
                borderColor: answer.is_correct ? 'success.main' : 'grey.300',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: answer.is_correct ? 'success.light' : 'grey.100',
                }
              }}>
                <Radio
                  checked={answer.is_correct}
                  onChange={() => handleAnswerChange(answerIndex, 'is_correct', true)}
                  name={`correct-answer-q${index}`}
                  color="success"
                />
                <TextField
                  fullWidth
                  label={`Réponse ${answerIndex + 1}`}
                  value={answer.answer_text}
                  onChange={(e) => handleAnswerChange(answerIndex, 'answer_text', e.target.value)}
                  required
                  size="small"
                  placeholder="Saisissez la réponse..."
                  sx={{ mx: 2 }}
                />
                <Tooltip title={question.answers.length <= 2 ? "Minimum 2 réponses requises" : "Supprimer cette réponse"}>
                  <span>
                    <IconButton 
                      color="error" 
                      onClick={() => removeAnswer(answerIndex)}
                      disabled={question.answers.length <= 2}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            ))}
            
            <Button
              startIcon={<AddIcon />}
              onClick={addAnswer}
              variant="outlined"
              size="small"
              sx={{ mt: 1 }}
            >
              Ajouter une réponse
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};

const TeacherCreateEvaluation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [groups, setGroups] = useState([]);
  const [submitError, setSubmitError] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  
  const [evaluationData, setEvaluationData] = useState({
    title: '',
    max_stars: 5,
    deadline: '',
    has_deadline: false,
    teacher_id: user?.id || '',
    groups: [],
    questions: [
      {
        question_text: '',
        answers: [
          { answer_text: '', is_correct: true },
          { answer_text: '', is_correct: false },
        ],
      },
    ],
  });

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user?.id) return;
      
      try {
        setLoadingGroups(true);
        const response = await teacherAPI.getGroups(user.id);
        setGroups(response.data);
      } catch (error) {
        console.error('Échec du chargement des groupes:', error);
        toast.error('Impossible de charger vos groupes assignés');
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchGroups();
  }, [user]);

  const handleBasicChange = (field, value) => {
    setEvaluationData({ ...evaluationData, [field]: value });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...evaluationData.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setEvaluationData({ ...evaluationData, questions: updatedQuestions });
  };

  const addQuestion = () => {
    setEvaluationData({
      ...evaluationData,
      questions: [
        ...evaluationData.questions,
        {
          question_text: '',
          answers: [
            { answer_text: '', is_correct: true },
            { answer_text: '', is_correct: false },
          ],
        },
      ],
    });
  };

  const removeQuestion = (index) => {
    const updatedQuestions = evaluationData.questions.filter((_, idx) => idx !== index);
    setEvaluationData({ ...evaluationData, questions: updatedQuestions });
  };

  const validateForm = () => {
    // Vérifier les informations de base de l'évaluation
    if (!evaluationData.title.trim()) {
      toast.error('Veuillez saisir un titre pour l\'évaluation');
      return false;
    }
    
    if (evaluationData.groups.length === 0) {
      toast.error('Veuillez sélectionner au moins un groupe');
      return false;
    }
    
    if (evaluationData.has_deadline && !evaluationData.deadline) {
      toast.error('Veuillez définir une échéance ou désactiver l\'option d\'échéance');
      return false;
    }
    
    // Vérifier les questions et réponses
    for (let i = 0; i < evaluationData.questions.length; i++) {
      const q = evaluationData.questions[i];
      
      if (!q.question_text.trim()) {
        toast.error(`Le texte de la question ${i + 1} est vide`);
        return false;
      }
      
      // Vérifier les réponses vides
      for (let j = 0; j < q.answers.length; j++) {
        if (!q.answers[j].answer_text.trim()) {
          toast.error(`La réponse ${j + 1} de la question ${i + 1} est vide`);
          return false;
        }
      }
      
      // Vérifier qu'exactement une réponse est marquée comme correcte
      const correctCount = q.answers.filter(a => a.is_correct).length;
      if (correctCount !== 1) {
        toast.error(`La question ${i + 1} doit avoir exactement une réponse correcte`);
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validateForm()) {
      return;
    }
    
    // Préparer les données pour la soumission
    const submissionData = {
      title: evaluationData.title,
      max_stars: evaluationData.max_stars,
      deadline: evaluationData.has_deadline ? evaluationData.deadline : null,
      teacher_id: evaluationData.teacher_id,
      groups: evaluationData.groups,
      questions: evaluationData.questions,
    };
    
    try {
      setLoading(true);
      const response = await teacherAPI.createTask(submissionData);
      toast.success('Évaluation créée avec succès !');
      navigate('/teacher/evaluations');
    } catch (error) {
      console.error('Échec de la création de l\'évaluation:', error);
      setSubmitError(error.response?.data?.message || 'Impossible de créer l\'évaluation. Veuillez réessayer.');
      toast.error('Échec de la création de l\'évaluation');
    } finally {
      setLoading(false);
    }
  };

  const getEvaluationStats = () => {
    const totalQuestions = evaluationData.questions.length;
    const completeQuestions = evaluationData.questions.filter(q => 
      q.question_text.trim() && 
      q.answers.every(a => a.answer_text.trim()) &&
      q.answers.filter(a => a.is_correct).length === 1
    ).length;
    
    return { totalQuestions, completeQuestions };
  };

  const { totalQuestions, completeQuestions } = getEvaluationStats();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/teacher/evaluations')}
            sx={{ mr: 2 }}
            variant="outlined"
          >
            Retour aux évaluations
          </Button>
          <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <QuizIcon color="primary" />
            Créer une nouvelle évaluation
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={`${completeQuestions}/${totalQuestions} questions complètes`}
            color={completeQuestions === totalQuestions ? 'success' : 'warning'}
            variant="outlined"
          />
          <Chip
            icon={<GroupIcon />}
            label={`${evaluationData.groups.length} groupe(s) sélectionné(s)`}
            color="info"
            variant="outlined"
          />
        </Box>
      </Box>
      
      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitError}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon color="primary" />
              Détails de l'évaluation
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Titre de l'évaluation"
                  value={evaluationData.title}
                  onChange={(e) => handleBasicChange('title', e.target.value)}
                  required
                  placeholder="Ex: Évaluation de mathématiques - Chapitre 1"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="max-stars-label">Nombre d'étoiles maximum</InputLabel>
                  <Select
                    labelId="max-stars-label"
                    value={evaluationData.max_stars}
                    label="Nombre d'étoiles maximum"
                    onChange={(e) => handleBasicChange('max_stars', e.target.value)}
                    sx={{ backgroundColor: 'white' }}
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <MenuItem key={num} value={num}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {num} {num === 1 ? 'Étoile' : 'Étoiles'}
                          <Box>
                            {Array(num).fill(0).map((_, i) => (
                              <StarIcon key={i} sx={{ color: 'gold', fontSize: 16 }} />
                            ))}
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={evaluationData.has_deadline}
                      onChange={(e) => handleBasicChange('has_deadline', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Définir une échéance"
                />
                
                {evaluationData.has_deadline && (
                  <TextField
                    fullWidth
                    label="Échéance"
                    type="datetime-local"
                    value={evaluationData.deadline}
                    onChange={(e) => handleBasicChange('deadline', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ mt: 2, '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
                  />
                )}
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth required error={evaluationData.groups.length === 0}>
                  <InputLabel id="groups-label">Assigner aux groupes</InputLabel>
                  <Select
                    labelId="groups-label"
                    multiple
                    value={evaluationData.groups}
                    onChange={(e) => handleBasicChange('groups', e.target.value)}
                    label="Assigner aux groupes"
                    disabled={loadingGroups}
                    sx={{ backgroundColor: 'white' }}
                    renderValue={(selected) => {
                      if (loadingGroups) return 'Chargement des groupes...';
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map(groupId => {
                            const group = groups.find(g => g.id === groupId);
                            return group ? (
                              <Chip
                                key={groupId}
                                label={`${group.level.name}/${group.group_number}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            ) : null;
                          })}
                        </Box>
                      );
                    }}
                  >
                    {loadingGroups ? (
                      <MenuItem disabled>Chargement des groupes...</MenuItem>
                    ) : groups.length === 0 ? (
                      <MenuItem disabled>Aucun groupe ne vous est assigné</MenuItem>
                    ) : (
                      groups.map((group) => (
                        <MenuItem key={group.id} value={group.id}>
                          {group.level.name}/{group.group_number}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {evaluationData.groups.length === 0 && (
                    <FormHelperText>Veuillez sélectionner au moins un groupe</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 4, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Résumé de l'évaluation
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Questions:</Typography>
                <Badge badgeContent={totalQuestions} color="primary">
                  <QuizIcon />
                </Badge>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Groupes:</Typography>
                <Badge badgeContent={evaluationData.groups.length} color="info">
                  <GroupIcon />
                </Badge>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Étoiles max:</Typography>
                <Box>
                  {Array(evaluationData.max_stars).fill(0).map((_, i) => (
                    <StarIcon key={i} sx={{ color: 'gold', fontSize: 16 }} />
                  ))}
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 4 }}>
        <QuizIcon color="primary" />
        Questions de l'évaluation
      </Typography>
      
      {evaluationData.questions.map((question, index) => (
        <QuestionItem
          key={index}
          index={index}
          question={question}
          onChange={handleQuestionChange}
          onDelete={removeQuestion}
          isLast={evaluationData.questions.length <= 1}
        />
      ))}
      
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addQuestion}
          size="large"
          sx={{
            borderStyle: 'dashed',
            borderWidth: 2,
            p: 2,
            '&:hover': {
              borderStyle: 'solid',
              backgroundColor: 'primary.light',
              color: 'white',
            }
          }}
        >
          Ajouter une question
        </Button>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/teacher/evaluations')}
          size="large"
        >
          Annuler
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSubmit}
          disabled={loading || completeQuestions !== totalQuestions}
          size="large"
          sx={{
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
            }
          }}
        >
          {loading ? 'Création en cours...' : 'Créer l\'évaluation'}
        </Button>
      </Box>
    </Container>
  );
};

export default TeacherCreateEvaluation;