"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Modal,
  Backdrop,
} from "@mui/material"
import {
  Assignment as AssignmentIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Star as StarIcon,
} from "@mui/icons-material"
import { toast } from "react-toastify"
import { useAuth } from "../../context/AuthContext"
import { studentAPI } from "../../api/api"
import { formatDate, getStarIcons } from "../../utils/helpers"

// Star Animation Component
const StarAnimation = ({ isOpen, starsEarned, maxStars, onClose }) => {
  const [animationPhase, setAnimationPhase] = useState(0)
  const [visibleStars, setVisibleStars] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setAnimationPhase(0)
      setVisibleStars(0)

      // Phase 1: Show celebration text
      const timer1 = setTimeout(() => setAnimationPhase(1), 500)

      // Phase 2: Start showing stars one by one
      const timer2 = setTimeout(() => {
        setAnimationPhase(2)
        let starCount = 0
        const starInterval = setInterval(() => {
          starCount++
          setVisibleStars(starCount)
          if (starCount >= starsEarned) {
            clearInterval(starInterval)
            // Phase 3: Final celebration
            setTimeout(() => setAnimationPhase(3), 500)
          }
        }, 300)
      }, 1500)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [isOpen, starsEarned])

  const handleClose = () => {
    setAnimationPhase(0)
    setVisibleStars(0)
    onClose()
  }

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        sx: { backgroundColor: "rgba(0, 0, 0, 0.8)" },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 500 },
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: 24,
          p: 4,
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        {/* Confetti Background Effect */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              animationPhase >= 3
                ? "linear-gradient(45deg, #FFD700 0%, #FFA500 25%, #FFD700 50%, #FFA500 75%, #FFD700 100%)"
                : "transparent",
            opacity: animationPhase >= 3 ? 0.1 : 0,
            transition: "all 0.5s ease-in-out",
            zIndex: -1,
          }}
        />

        {/* Main Content */}
        <Box sx={{ position: "relative", zIndex: 1 }}>
          {/* Phase 1: Celebration Text */}
          <Typography
            variant="h3"
            sx={{
              mb: 3,
              fontWeight: "bold",
              background: "linear-gradient(45deg, #FFD700, #FFA500)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              transform: animationPhase >= 1 ? "scale(1)" : "scale(0)",
              transition: "transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
            }}
          >
            🎉 Félicitations! 🎉
          </Typography>

          {/* Phase 2 & 3: Stars Display */}
          {animationPhase >= 2 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 3, color: "text.primary" }}>
                Vous avez gagné:
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                }}
              >
                {Array.from({ length: maxStars }, (_, index) => {
                  const isEarned = index < starsEarned
                  const isVisible = index < visibleStars

                  return (
                    <StarIcon
                      key={index}
                      sx={{
                        fontSize: 48,
                        color: isEarned ? "#FFD700" : "#E0E0E0",
                        transform: isVisible ? "scale(1) rotate(0deg)" : "scale(0) rotate(180deg)",
                        transition: "all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                        filter: isEarned && isVisible ? "drop-shadow(0 0 8px #FFD700)" : "none",
                        animation: isEarned && isVisible && animationPhase >= 3 ? "pulse 2s infinite" : "none",
                      }}
                    />
                  )
                })}
              </Box>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  color: "primary.main",
                  transform: animationPhase >= 3 ? "scale(1.1)" : "scale(1)",
                  transition: "transform 0.3s ease-in-out",
                }}
              >
                {starsEarned} / {maxStars} étoiles
              </Typography>
            </Box>
          )}

          {/* Phase 3: Performance Message */}
          {animationPhase >= 3 && (
            <Box
              sx={{
                transform: "translateY(0)",
                opacity: 1,
                transition: "all 0.5s ease-in-out",
                mb: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color:
                    starsEarned === maxStars
                      ? "success.main"
                      : starsEarned >= maxStars * 0.7
                        ? "warning.main"
                        : "info.main",
                  fontWeight: "medium",
                }}
              >
                {starsEarned === maxStars
                  ? "🌟 Performance parfaite! 🌟"
                  : starsEarned >= maxStars * 0.7
                    ? "👏 Très bon travail! 👏"
                    : "💪 Continuez vos efforts! 💪"}
              </Typography>
            </Box>
          )}

          {/* Close Button */}
          {animationPhase >= 3 && (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleClose}
              sx={{
                mt: 2,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: "bold",
                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                "&:hover": {
                  background: "linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)",
                },
              }}
            >
              Continuer
            </Button>
          )}
        </Box>

        {/* CSS Animation for pulsing stars */}
        <style jsx>{`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}</style>
      </Box>
    </Modal>
  )
}

const DetailsEvaluation = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [evaluation, setEvaluation] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)
  const [terminee, setTerminee] = useState(false)
  const [evaluationEtudiant, setEvaluationEtudiant] = useState(null)
  const [reponsesEtudiant, setReponsesEtudiant] = useState([])

  // État pour suivre les réponses sélectionnées
  const [reponsesSelectionnees, setReponsesSelectionnees] = useState({})
  const [envoiEnCours, setEnvoiEnCours] = useState(false)

  // État pour l'animation des étoiles
  const [showStarAnimation, setShowStarAnimation] = useState(false)
  const [starsEarned, setStarsEarned] = useState(0)

  useEffect(() => {
    const recupererDetailsEvaluation = async () => {
      try {
        setChargement(true)
        const response = await studentAPI.getTaskDetailsMe(id)
        setEvaluation(response.data.task)
        setTerminee(response.data.completed)

        if (response.data.completed) {
          setEvaluationEtudiant(response.data.student_task)
          setReponsesEtudiant(response.data.student_answers)
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des détails de l'évaluation:", err)
        setErreur(err.response?.data?.message || "Échec du chargement des détails de l'évaluation")
        toast.error("Échec du chargement des détails de l'évaluation")
      } finally {
        setChargement(false)
      }
    }

    if (user && id) {
      recupererDetailsEvaluation()
    }
  }, [user, id])

  const gererChangementReponse = (questionId, reponseId) => {
    setReponsesSelectionnees({
      ...reponsesSelectionnees,
      [questionId]: reponseId,
    })
  }

  const gererSoumission = async () => {
    // Vérifier si toutes les questions ont une réponse
    const toutesQuestionsRepondues = evaluation.questions.every((question) => reponsesSelectionnees[question.id])

    if (!toutesQuestionsRepondues) {
      toast.warning("Veuillez répondre à toutes les questions avant de soumettre")
      return
    }

    try {
      setEnvoiEnCours(true)
      const reponses = Object.values(reponsesSelectionnees)

      // Correction: Passer seulement l'ID de l'évaluation et le tableau des réponses
      const response = await studentAPI.submitTaskAnswers(evaluation.id, reponses)

      // Stocker les étoiles gagnées et afficher l'animation
      setStarsEarned(response.data.stars_earned)
      setShowStarAnimation(true)

      // Actualiser les données pour afficher le statut de completion
      const donneesEvaluationMiseAJour = await studentAPI.getTaskDetailsMe(id)
      setEvaluation(donneesEvaluationMiseAJour.data.task)
      setTerminee(donneesEvaluationMiseAJour.data.completed)
      setEvaluationEtudiant(donneesEvaluationMiseAJour.data.student_task)
      setReponsesEtudiant(donneesEvaluationMiseAJour.data.student_answers)
    } catch (err) {
      console.error("Erreur lors de la soumission de l'évaluation:", err)
      toast.error(err.response?.data?.message || "Échec de la soumission de l'évaluation")
    } finally {
      setEnvoiEnCours(false)
    }
  }

  const estDelaiDepasse = () => {
    if (!evaluation || !evaluation.deadline) return false
    return new Date(evaluation.deadline) < new Date()
  }

  if (chargement) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (erreur) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {erreur}
      </Alert>
    )
  }

  if (!evaluation) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Évaluation non trouvée
      </Alert>
    )
  }

  return (
    <Box>
      {/* Star Animation Modal */}
      <StarAnimation
        isOpen={showStarAnimation}
        starsEarned={starsEarned}
        maxStars={evaluation?.max_stars || 5}
        onClose={() => setShowStarAnimation(false)}
      />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1">
          {evaluation.title}
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/student/tasks")}>
          Retour aux Évaluations
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">
            <AssignmentIcon sx={{ verticalAlign: "middle", mr: 1 }} />
            Détails de l'Évaluation
          </Typography>

          {evaluation.deadline && (
            <Chip
              color={estDelaiDepasse() ? "error" : "info"}
              label={`Échéance : ${formatDate(evaluation.deadline)}`}
            />
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="body1" gutterBottom>
          <strong>Enseignant :</strong> {evaluation.teacher.first_name} {evaluation.teacher.last_name}
        </Typography>

        <Typography variant="body1" gutterBottom>
          <strong>Étoiles Maximum :</strong> {getStarIcons(evaluation.max_stars, evaluation.max_stars)}
        </Typography>

        {terminee && (
          <Box sx={{ mt: 2, p: 2, bgcolor: "success.light", borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Évaluation Terminée !
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Date de Completion :</strong> {formatDate(evaluationEtudiant.completion_date)}
            </Typography>
            <Typography variant="body1">
              <strong>Étoiles Gagnées :</strong> {getStarIcons(evaluationEtudiant.stars_earned, evaluation.max_stars)}
            </Typography>
          </Box>
        )}
      </Paper>

      {terminee ? (
        // Afficher les résultats si terminée
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Vos Réponses
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <List>
            {evaluation.questions.map((question, index) => {
              const reponseEtudiant = reponsesEtudiant.find((r) => r.question_id === question.id)

              return (
                <ListItem key={question.id} sx={{ mb: 3, flexDirection: "column", alignItems: "flex-start" }}>
                  <ListItemText primary={`Question ${index + 1} : ${question.question_text}`} sx={{ mb: 1 }} />

                  <Box sx={{ width: "100%", pl: 2 }}>
                    {question.answers.map((reponse) => {
                      const estSelectionnee = reponseEtudiant && reponseEtudiant.answer_id === reponse.id
                      const estCorrecte = reponse.is_correct

                      return (
                        <Box
                          key={reponse.id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 1,
                            bgcolor: estSelectionnee ? (estCorrecte ? "success.light" : "error.light") : "transparent",
                            borderRadius: 1,
                            mb: 1,
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            {estSelectionnee &&
                              (estCorrecte ? <CheckIcon color="success" /> : <CloseIcon color="error" />)}
                          </ListItemIcon>
                          <ListItemText primary={reponse.answer_text} />
                          {!estSelectionnee && estCorrecte && (
                            <Chip size="small" label="Réponse Correcte" color="success" variant="outlined" />
                          )}
                        </Box>
                      )
                    })}
                  </Box>
                </ListItem>
              )
            })}
          </List>
        </Paper>
      ) : (
        // Afficher les questions à répondre si pas terminée
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Questions
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {estDelaiDepasse() ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              L'échéance pour cette évaluation est dépassée. Vous ne pouvez plus soumettre de réponses.
            </Alert>
          ) : (
            <>
              {evaluation.questions.map((question, index) => (
                <Card key={question.id} sx={{ mb: 3 }}>
                  <CardContent>
                    <FormControl component="fieldset" fullWidth>
                      <FormLabel component="legend">
                        <Typography variant="subtitle1" fontWeight="bold">
                          Question {index + 1} : {question.question_text}
                        </Typography>
                      </FormLabel>

                      <RadioGroup
                        name={`question-${question.id}`}
                        value={reponsesSelectionnees[question.id] || ""}
                        onChange={(e) => gererChangementReponse(question.id, Number.parseInt(e.target.value))}
                      >
                        {question.answers.map((reponse) => (
                          <FormControlLabel
                            key={reponse.id}
                            value={reponse.id}
                            control={<Radio />}
                            label={reponse.answer_text}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </CardContent>
                </Card>
              ))}

              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={gererSoumission}
                  disabled={envoiEnCours}
                  startIcon={envoiEnCours ? <CircularProgress size={20} /> : <StarIcon />}
                >
                  {envoiEnCours ? "Envoi en cours..." : "Soumettre les Réponses"}
                </Button>
              </Box>
            </>
          )}
        </Paper>
      )}
    </Box>
  )
}

export default DetailsEvaluation
