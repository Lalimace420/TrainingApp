// Base de données de 15 entraînements variés
export const workoutsDatabase = [
  {
    id: 1,
    name: 'Corps Complet - Force',
    duration: '1h - 1h30',
    type: 'full_body',
    exercises: [
      { name: 'Échauffement', details: '10 min de marche rapide ou vélo' },
      { name: 'Squats', details: '4 séries de 12 répétitions' },
      { name: 'Pompes', details: '3 séries de 10-15 répétitions' },
      { name: 'Rowing avec haltères', details: '3 séries de 12 répétitions' },
      { name: 'Fentes alternées', details: '3 séries de 10 par jambe' },
      { name: 'Planche', details: '3 séries de 45 secondes' }
    ],
    cardio: '15 minutes de marche rapide',
    tip: 'Concentre-toi sur la forme plutôt que sur le poids!'
  },
  {
    id: 2,
    name: 'Cardio Intensif + Abdos',
    duration: '1h - 1h15',
    type: 'cardio',
    exercises: [
      { name: 'Échauffement', details: '5 min de marche' },
      { name: 'Intervals de course', details: '20 min (30 sec sprint, 90 sec marche)' },
      { name: 'Burpees', details: '3 séries de 10 répétitions' },
      { name: 'Crunchs', details: '3 séries de 20 répétitions' },
      { name: 'Mountain climbers', details: '3 séries de 30 répétitions' },
      { name: 'Planche latérale', details: '3 séries de 30 sec par côté' }
    ],
    cardio: '10 minutes de retour au calme',
    tip: 'Le cardio est essentiel pour brûler les graisses!'
  },
  {
    id: 3,
    name: 'Haut du Corps',
    duration: '1h - 1h20',
    type: 'upper_body',
    exercises: [
      { name: 'Échauffement', details: '10 min de vélo' },
      { name: 'Développé couché', details: '4 séries de 10 répétitions' },
      { name: 'Tractions assistées', details: '3 séries de 8 répétitions' },
      { name: 'Curl biceps', details: '3 séries de 12 répétitions' },
      { name: 'Extension triceps', details: '3 séries de 12 répétitions' },
      { name: 'Élévations latérales', details: '3 séries de 15 répétitions' }
    ],
    cardio: '15 minutes d\'elliptique',
    tip: 'Varie la vitesse d\'exécution pour maximiser les gains!'
  },
  {
    id: 4,
    name: 'Jambes et Fessiers',
    duration: '1h - 1h30',
    type: 'lower_body',
    exercises: [
      { name: 'Échauffement', details: '10 min de vélo' },
      { name: 'Squats avec poids', details: '4 séries de 12 répétitions' },
      { name: 'Soulevé de terre roumain', details: '3 séries de 10 répétitions' },
      { name: 'Leg press', details: '3 séries de 15 répétitions' },
      { name: 'Fentes marchées', details: '3 séries de 12 par jambe' },
      { name: 'Extensions mollets', details: '3 séries de 20 répétitions' }
    ],
    cardio: '10 minutes de marche inclinée',
    tip: 'Les jambes sont les plus gros muscles, travaille-les intensément!'
  },
  {
    id: 5,
    name: 'HIIT Circuit',
    duration: '45 min - 1h',
    type: 'hiit',
    exercises: [
      { name: 'Échauffement', details: '5 min de jumping jacks' },
      { name: 'Circuit 1', details: 'Burpees + Jump squats + Pompes (3 rounds, 40 sec chaque)' },
      { name: 'Circuit 2', details: 'Mountain climbers + Fentes sautées + Planche (3 rounds, 40 sec chaque)' },
      { name: 'Circuit 3', details: 'High knees + Russian twists + Superman (3 rounds, 40 sec chaque)' },
      { name: 'Finisher', details: 'Sprint sur place 30 sec, repos 30 sec (5 rounds)' }
    ],
    cardio: '5 minutes de marche lente',
    tip: 'Donne tout pendant les 40 secondes, repose-toi 20 secondes entre!'
  },
  {
    id: 6,
    name: 'Endurance Cardio',
    duration: '1h - 1h15',
    type: 'cardio',
    exercises: [
      { name: 'Échauffement', details: '5 min de marche' },
      { name: 'Course continue', details: '30 minutes à rythme modéré' },
      { name: 'Vélo', details: '15 minutes en intervalles' },
      { name: 'Rameur', details: '10 minutes à intensité modérée' },
      { name: 'Étirements', details: '10 minutes de stretching complet' }
    ],
    cardio: 'Inclus dans l\'entraînement',
    tip: 'Maintiens un rythme où tu peux encore parler!'
  },
  {
    id: 7,
    name: 'Force - Push (Poussée)',
    duration: '1h - 1h20',
    type: 'push',
    exercises: [
      { name: 'Échauffement', details: '10 min de rameur léger' },
      { name: 'Développé incliné', details: '4 séries de 10 répétitions' },
      { name: 'Dips', details: '3 séries de 10 répétitions' },
      { name: 'Overhead press', details: '3 séries de 12 répétitions' },
      { name: 'Pompes diamant', details: '3 séries de 12 répétitions' },
      { name: 'Élévations frontales', details: '3 séries de 15 répétitions' }
    ],
    cardio: '10 minutes de vélo',
    tip: 'Contracte bien les pectoraux à chaque répétition!'
  },
  {
    id: 8,
    name: 'Force - Pull (Traction)',
    duration: '1h - 1h20',
    type: 'pull',
    exercises: [
      { name: 'Échauffement', details: '10 min d\'elliptique' },
      { name: 'Tractions', details: '4 séries de 6-8 répétitions' },
      { name: 'Rowing barre', details: '4 séries de 10 répétitions' },
      { name: 'Pull-over', details: '3 séries de 12 répétitions' },
      { name: 'Curl marteau', details: '3 séries de 12 répétitions' },
      { name: 'Face pulls', details: '3 séries de 15 répétitions' }
    ],
    cardio: '15 minutes de marche rapide',
    tip: 'Tire avec ton dos, pas avec tes bras!'
  },
  {
    id: 9,
    name: 'Core et Stabilité',
    duration: '45 min - 1h',
    type: 'core',
    exercises: [
      { name: 'Échauffement', details: '5 min de mobilité' },
      { name: 'Planche', details: '4 séries de 60 secondes' },
      { name: 'Planche latérale', details: '3 séries de 45 sec par côté' },
      { name: 'Dead bug', details: '3 séries de 15 répétitions' },
      { name: 'Bicycle crunches', details: '3 séries de 30 répétitions' },
      { name: 'Bird dog', details: '3 séries de 12 par côté' },
      { name: 'Hollow hold', details: '3 séries de 30 secondes' }
    ],
    cardio: '10 minutes de marche',
    tip: 'Garde ton core engagé pendant tout l\'entraînement!'
  },
  {
    id: 10,
    name: 'Mobilité et Force Fonctionnelle',
    duration: '1h',
    type: 'functional',
    exercises: [
      { name: 'Échauffement dynamique', details: '10 min de mobilité articulaire' },
      { name: 'Goblet squats', details: '3 séries de 15 répétitions' },
      { name: 'Kettlebell swings', details: '3 séries de 20 répétitions' },
      { name: 'Turkish get-ups', details: '3 séries de 5 par côté' },
      { name: 'Farmer walks', details: '3 séries de 40 mètres' },
      { name: 'Box jumps', details: '3 séries de 10 répétitions' }
    ],
    cardio: '5 minutes de stretching',
    tip: 'La qualité du mouvement prime sur la quantité!'
  },
  {
    id: 11,
    name: 'Circuit Métabolique',
    duration: '50 min - 1h',
    type: 'metabolic',
    exercises: [
      { name: 'Échauffement', details: '5 min de saut à la corde' },
      { name: 'Station 1', details: 'Squats + Push press (45 sec)' },
      { name: 'Station 2', details: 'Rowing + Sit-ups (45 sec)' },
      { name: 'Station 3', details: 'Battle ropes + Lunges (45 sec)' },
      { name: 'Station 4', details: 'Box step-ups + Medicine ball slams (45 sec)' },
      { name: 'Répéter', details: '4-5 rounds avec 60 sec de repos entre chaque round' }
    ],
    cardio: '10 minutes de marche active',
    tip: 'Garde l\'intensité élevée mais contrôlée!'
  },
  {
    id: 12,
    name: 'Yoga Strength',
    duration: '1h',
    type: 'yoga',
    exercises: [
      { name: 'Salutations au soleil', details: '5 rounds, respiration lente' },
      { name: 'Warrior series', details: '3 séries de chaque variation (I, II, III)' },
      { name: 'Chaturanga holds', details: '5 séries de 20 secondes' },
      { name: 'Chair pose', details: '3 séries de 60 secondes' },
      { name: 'Boat pose', details: '3 séries de 45 secondes' },
      { name: 'Savasana', details: '10 minutes de relaxation finale' }
    ],
    cardio: 'Flux continu',
    tip: 'Respire profondément et reste concentré sur ton alignement!'
  },
  {
    id: 13,
    name: 'Puissance et Explosivité',
    duration: '1h - 1h15',
    type: 'power',
    exercises: [
      { name: 'Échauffement', details: '10 min avec drills de sprint' },
      { name: 'Power cleans', details: '5 séries de 5 répétitions' },
      { name: 'Box jumps', details: '4 séries de 8 répétitions' },
      { name: 'Medicine ball slams', details: '3 séries de 12 répétitions' },
      { name: 'Sprints', details: '6 séries de 50 mètres' },
      { name: 'Plyometric push-ups', details: '3 séries de 8 répétitions' }
    ],
    cardio: '10 minutes de marche de récupération',
    tip: 'Explosivité = vitesse + force. Sois rapide et puissant!'
  },
  {
    id: 14,
    name: 'Active Recovery',
    duration: '45 min - 1h',
    type: 'recovery',
    exercises: [
      { name: 'Marche légère', details: '20 minutes à rythme décontracté' },
      { name: 'Vélo léger', details: '15 minutes sans résistance' },
      { name: 'Stretching complet', details: '15 minutes de tous les groupes musculaires' },
      { name: 'Foam rolling', details: '10 minutes sur les zones tendues' },
      { name: 'Respiration', details: '5 minutes d\'exercices de respiration profonde' }
    ],
    cardio: 'Faible intensité',
    tip: 'La récupération fait partie de l\'entraînement. Prends soin de ton corps!'
  },
  {
    id: 15,
    name: 'Superset Challenge',
    duration: '1h - 1h15',
    type: 'superset',
    exercises: [
      { name: 'Échauffement', details: '10 min de rameur' },
      { name: 'Superset 1', details: 'Squats + Pull-ups (4 séries de 10/8)' },
      { name: 'Superset 2', details: 'Bench press + Rowing (4 séries de 10)' },
      { name: 'Superset 3', details: 'Lunges + Shoulder press (3 séries de 12)' },
      { name: 'Superset 4', details: 'Leg curls + Leg extensions (3 séries de 15)' },
      { name: 'Finisher', details: 'Burpees (100 reps aussi vite que possible)' }
    ],
    cardio: '10 minutes d\'étirements',
    tip: 'Pas de repos entre les exercices du superset, 90 sec entre les sets!'
  }
]

// Fonction pour générer un plan hebdomadaire aléatoire
export function generateWeeklyPlan(sessionsPerWeek, previousWorkoutIds = []) {
  // S'assurer que le nombre de séances est valide
  const numSessions = Math.min(Math.max(sessionsPerWeek, 2), 5)

  // Filtrer les workouts déjà utilisés récemment (éviter répétition)
  let availableWorkouts = workoutsDatabase.filter(w => !previousWorkoutIds.includes(w.id))

  // Si pas assez de workouts disponibles, réinitialiser
  if (availableWorkouts.length < numSessions) {
    availableWorkouts = [...workoutsDatabase]
  }

  // Mélanger aléatoirement
  const shuffled = availableWorkouts.sort(() => Math.random() - 0.5)

  // Prendre le nombre requis
  const selectedWorkouts = shuffled.slice(0, numSessions)

  // Assigner des jours
  return selectedWorkouts.map((workout, index) => ({
    ...workout,
    dayNumber: index + 1,
    dayName: `Jour ${index + 1}`
  }))
}
