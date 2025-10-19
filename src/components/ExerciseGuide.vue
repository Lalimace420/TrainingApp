<template>
  <div class="exercise-guide">
    <h2>Guide des Exercices</h2>
    <p class="intro">Apprends à bien exécuter chaque exercice pour maximiser tes résultats et éviter les blessures.</p>

    <!-- Barre de recherche -->
    <div class="search-box">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher un exercice..."
        class="search-input"
      >
    </div>

    <!-- Filtres par catégorie -->
    <div class="filters">
      <button
        v-for="category in categories"
        :key="category.id"
        @click="selectedCategory = category.id"
        :class="{ active: selectedCategory === category.id }"
        class="filter-btn"
      >
        {{ category.name }}
      </button>
    </div>

    <!-- Liste des exercices -->
    <div class="exercises-list">
      <div
        v-for="exercise in filteredExercises"
        :key="exercise.id"
        class="exercise-card"
      >
        <div class="exercise-header">
          <h3>{{ exercise.name }}</h3>
          <span class="difficulty" :class="exercise.difficulty">
            {{ getDifficultyLabel(exercise.difficulty) }}
          </span>
        </div>

        <div class="exercise-body">
          <div class="exercise-info">
            <span class="tag">{{ getCategoryName(exercise.category) }}</span>
            <span class="muscles">🎯 {{ exercise.muscles }}</span>
          </div>

          <div class="exercise-description">
            <h4>Comment faire:</h4>
            <ol>
              <li v-for="(step, index) in exercise.steps" :key="index">{{ step }}</li>
            </ol>
          </div>

          <div v-if="exercise.tips" class="exercise-tips">
            <h4>💡 Conseils:</h4>
            <ul>
              <li v-for="(tip, index) in exercise.tips" :key="index">{{ tip }}</li>
            </ul>
          </div>

          <div v-if="exercise.common_mistakes" class="exercise-mistakes">
            <h4>⚠️ Erreurs à éviter:</h4>
            <ul>
              <li v-for="(mistake, index) in exercise.common_mistakes" :key="index">{{ mistake }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredExercises.length === 0" class="no-results">
      <p>🔍 Aucun exercice trouvé</p>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'ExerciseGuide',
  setup() {
    const searchQuery = ref('')
    const selectedCategory = ref('all')

    const categories = [
      { id: 'all', name: 'Tous' },
      { id: 'chest', name: 'Pectoraux' },
      { id: 'back', name: 'Dos' },
      { id: 'legs', name: 'Jambes' },
      { id: 'shoulders', name: 'Épaules' },
      { id: 'arms', name: 'Bras' },
      { id: 'core', name: 'Abdos/Core' },
      { id: 'cardio', name: 'Cardio' }
    ]

    const exercises = [
      {
        id: 1,
        name: 'Squats',
        category: 'legs',
        muscles: 'Quadriceps, Fessiers, Ischio-jambiers',
        difficulty: 'beginner',
        steps: [
          'Debout, pieds écartés largeur des épaules',
          'Garde le dos droit et la poitrine sortie',
          'Descends en poussant les fesses vers l\'arrière comme si tu t\'assoyais',
          'Descends jusqu\'à ce que tes cuisses soient parallèles au sol',
          'Pousse sur tes talons pour remonter'
        ],
        tips: [
          'Garde tes genoux alignés avec tes orteils',
          'Ne laisse pas tes genoux dépasser tes orteils',
          'Regarde droit devant toi, pas en bas'
        ],
        common_mistakes: [
          'Genoux qui rentrent vers l\'intérieur',
          'Dos courbé ou penché trop en avant',
          'Se lever sur la pointe des pieds'
        ]
      },
      {
        id: 2,
        name: 'Pompes (Push-ups)',
        category: 'chest',
        muscles: 'Pectoraux, Triceps, Épaules',
        difficulty: 'beginner',
        steps: [
          'Position de planche, mains légèrement plus larges que les épaules',
          'Corps aligné de la tête aux pieds',
          'Descends en pliant les coudes jusqu\'à ce que ta poitrine touche presque le sol',
          'Pousse pour remonter en tendant complètement les bras'
        ],
        tips: [
          'Garde ton core engagé (abdos contractés)',
          'Respire: inspire en descendant, expire en montant',
          'Commence sur les genoux si c\'est trop difficile'
        ],
        common_mistakes: [
          'Fesses trop hautes ou trop basses',
          'Coudes trop écartés (>45°)',
          'Ne pas descendre assez bas'
        ]
      },
      {
        id: 3,
        name: 'Planche (Plank)',
        category: 'core',
        muscles: 'Abdominaux, Lombaires, Épaules',
        difficulty: 'beginner',
        steps: [
          'Position de planche sur les avant-bras',
          'Coudes alignés sous les épaules',
          'Corps droit de la tête aux talons',
          'Engage ton core et tes fessiers',
          'Maintiens la position sans bouger'
        ],
        tips: [
          'Ne laisse pas tes hanches tomber',
          'Respire normalement, ne retiens pas ta respiration',
          'Regarde le sol entre tes mains'
        ],
        common_mistakes: [
          'Fesses trop hautes',
          'Hanches qui s\'affaissent',
          'Retenir sa respiration'
        ]
      },
      {
        id: 4,
        name: 'Fentes (Lunges)',
        category: 'legs',
        muscles: 'Quadriceps, Fessiers, Ischio-jambiers',
        difficulty: 'intermediate',
        steps: [
          'Debout, fais un grand pas en avant',
          'Descends en fléchissant les deux genoux à 90°',
          'Le genou arrière doit presque toucher le sol',
          'Pousse sur le talon avant pour revenir debout',
          'Alterne les jambes'
        ],
        tips: [
          'Garde le buste droit',
          'Le genou avant ne doit pas dépasser les orteils',
          'Engage ton core pour l\'équilibre'
        ],
        common_mistakes: [
          'Pas assez long (genoux qui dépassent)',
          'Buste penché en avant',
          'Ne pas descendre assez bas'
        ]
      },
      {
        id: 5,
        name: 'Développé Couché (Bench Press)',
        category: 'chest',
        muscles: 'Pectoraux, Triceps, Épaules antérieures',
        difficulty: 'intermediate',
        steps: [
          'Allongé sur le banc, pieds à plat au sol',
          'Saisir la barre légèrement plus large que les épaules',
          'Descendre la barre vers la poitrine de façon contrôlée',
          'Toucher la poitrine puis pousser vers le haut',
          'Verrouiller les coudes en haut'
        ],
        tips: [
          'Garde les omoplates serrées',
          'Arche légèrement le bas du dos',
          'Utilise un spotter pour la sécurité'
        ],
        common_mistakes: [
          'Décoller les fesses du banc',
          'Rebondir la barre sur la poitrine',
          'Prise trop large ou trop serrée'
        ]
      },
      {
        id: 6,
        name: 'Tractions (Pull-ups)',
        category: 'back',
        muscles: 'Grand dorsal, Biceps, Trapèzes',
        difficulty: 'advanced',
        steps: [
          'Suspends-toi à une barre, mains en pronation (paumes vers l\'avant)',
          'Mains légèrement plus larges que les épaules',
          'Tire-toi vers le haut jusqu\'à ce que ton menton dépasse la barre',
          'Descends de façon contrôlée jusqu\'à bras tendus'
        ],
        tips: [
          'Tire avec ton dos, pas avec tes bras',
          'Évite de te balancer',
          'Utilise une bande élastique si nécessaire'
        ],
        common_mistakes: [
          'Utiliser l\'élan pour monter',
          'Ne pas descendre complètement',
          'Hausser les épaules vers les oreilles'
        ]
      },
      {
        id: 7,
        name: 'Rowing avec Haltères',
        category: 'back',
        muscles: 'Grand dorsal, Trapèzes, Biceps',
        difficulty: 'intermediate',
        steps: [
          'Penche-toi en avant, dos droit, haltère dans une main',
          'Autre main en appui sur un banc',
          'Tire l\'haltère vers ta hanche en gardant le coude près du corps',
          'Squeeze ton omoplate en haut du mouvement',
          'Redescends de façon contrôlée'
        ],
        tips: [
          'Ne tourne pas le torse',
          'Pense à tirer avec ton coude, pas ta main',
          'Garde le dos plat tout le long'
        ],
        common_mistakes: [
          'Dos courbé',
          'Rotation du torse',
          'Utiliser trop de poids et tricher'
        ]
      },
      {
        id: 8,
        name: 'Burpees',
        category: 'cardio',
        muscles: 'Corps entier, Cardio',
        difficulty: 'intermediate',
        steps: [
          'Debout, pieds écartés largeur des hanches',
          'Descends en squat et pose les mains au sol',
          'Saute ou recule les pieds en position de planche',
          'Fais une pompe (optionnel)',
          'Ramène les pieds vers les mains',
          'Saute en l\'air avec les bras levés'
        ],
        tips: [
          'Garde un rythme constant',
          'Respire de façon régulière',
          'Modifie selon ton niveau (sans saut, sans pompe)'
        ],
        common_mistakes: [
          'Aller trop vite et perdre la forme',
          'Ne pas faire la planche complète',
          'Retenir sa respiration'
        ]
      },
      {
        id: 9,
        name: 'Curl Biceps',
        category: 'arms',
        muscles: 'Biceps',
        difficulty: 'beginner',
        steps: [
          'Debout, haltères dans chaque main, bras le long du corps',
          'Paumes vers l\'avant',
          'Fléchis les coudes pour monter les haltères vers les épaules',
          'Garde les coudes fixes près du corps',
          'Redescends de façon contrôlée'
        ],
        tips: [
          'Ne bouge que tes avant-bras',
          'Ne t\'aide pas avec le dos',
          'Contracte en haut, étire en bas'
        ],
        common_mistakes: [
          'Balancer le corps',
          'Bouger les coudes',
          'Descendre trop vite'
        ]
      },
      {
        id: 10,
        name: 'Extension Triceps',
        category: 'arms',
        muscles: 'Triceps',
        difficulty: 'beginner',
        steps: [
          'Debout ou assis, haltère au-dessus de la tête',
          'Tiens l\'haltère à deux mains',
          'Descends l\'haltère derrière ta tête en fléchissant les coudes',
          'Garde les coudes pointés vers le haut',
          'Remonte en tendant les bras'
        ],
        tips: [
          'Garde les coudes immobiles et serrés',
          'Ne cambre pas le dos',
          'Descends jusqu\'à sentir l\'étirement'
        ],
        common_mistakes: [
          'Coudes qui s\'écartent',
          'Cambrer le dos',
          'Utiliser trop de poids'
        ]
      },
      {
        id: 11,
        name: 'Élévations Latérales',
        category: 'shoulders',
        muscles: 'Deltoïdes (épaules)',
        difficulty: 'beginner',
        steps: [
          'Debout, haltères dans chaque main le long du corps',
          'Lève les bras sur les côtés jusqu\'à hauteur des épaules',
          'Coudes légèrement fléchis',
          'Pause en haut',
          'Redescends lentement'
        ],
        tips: [
          'Ne monte pas plus haut que les épaules',
          'Garde les coudes légèrement pliés',
          'Contrôle la descente'
        ],
        common_mistakes: [
          'Utiliser l\'élan',
          'Monter trop haut',
          'Hausser les épaules'
        ]
      },
      {
        id: 12,
        name: 'Mountain Climbers',
        category: 'cardio',
        muscles: 'Abdos, Cardio, Épaules',
        difficulty: 'intermediate',
        steps: [
          'Position de planche haute (bras tendus)',
          'Ramène un genou vers la poitrine',
          'Retourne le pied en position de planche',
          'Alterne rapidement les jambes',
          'Garde le dos droit pendant tout le mouvement'
        ],
        tips: [
          'Augmente la vitesse progressivement',
          'Engage ton core',
          'Respire de façon régulière'
        ],
        common_mistakes: [
          'Fesses trop hautes',
          'Aller trop vite et perdre la forme',
          'Ne pas ramener le genou assez haut'
        ]
      }
    ]

    const filteredExercises = computed(() => {
      let result = exercises

      // Filtrer par catégorie
      if (selectedCategory.value !== 'all') {
        result = result.filter(ex => ex.category === selectedCategory.value)
      }

      // Filtrer par recherche
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(ex =>
          ex.name.toLowerCase().includes(query) ||
          ex.muscles.toLowerCase().includes(query)
        )
      }

      return result
    })

    const getCategoryName = (categoryId) => {
      const category = categories.find(c => c.id === categoryId)
      return category ? category.name : categoryId
    }

    const getDifficultyLabel = (difficulty) => {
      const labels = {
        beginner: 'Débutant',
        intermediate: 'Intermédiaire',
        advanced: 'Avancé'
      }
      return labels[difficulty] || difficulty
    }

    return {
      searchQuery,
      selectedCategory,
      categories,
      exercises,
      filteredExercises,
      getCategoryName,
      getDifficultyLabel
    }
  }
}
</script>

<style scoped>
.exercise-guide {
  max-width: 1200px;
  margin: 0 auto;
}

.exercise-guide h2 {
  color: #333;
  margin-bottom: 10px;
  font-size: 28px;
}

.intro {
  color: #666;
  margin-bottom: 30px;
  font-size: 16px;
}

.search-box {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 15px 20px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 10px 20px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  color: #666;
}

.filter-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.filter-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.exercises-list {
  display: grid;
  gap: 20px;
}

.exercise-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.exercise-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.exercise-header h3 {
  color: #333;
  margin: 0;
  font-size: 22px;
}

.difficulty {
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
}

.difficulty.beginner {
  background: #e8f5e9;
  color: #2e7d32;
}

.difficulty.intermediate {
  background: #fff3e0;
  color: #f57c00;
}

.difficulty.advanced {
  background: #ffebee;
  color: #c62828;
}

.exercise-info {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.tag {
  padding: 5px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 15px;
  font-size: 13px;
  font-weight: 600;
}

.muscles {
  color: #666;
  font-size: 14px;
}

.exercise-description h4,
.exercise-tips h4,
.exercise-mistakes h4 {
  color: #667eea;
  margin-bottom: 12px;
  font-size: 16px;
}

.exercise-description ol {
  margin-left: 20px;
  color: #555;
  line-height: 1.8;
}

.exercise-description ol li {
  margin-bottom: 8px;
}

.exercise-tips,
.exercise-mistakes {
  margin-top: 20px;
  padding: 15px;
  border-radius: 10px;
}

.exercise-tips {
  background: #f0f7ff;
  border-left: 4px solid #2196f3;
}

.exercise-mistakes {
  background: #fff3e0;
  border-left: 4px solid #ff9800;
}

.exercise-tips ul,
.exercise-mistakes ul {
  margin-left: 20px;
  color: #555;
  line-height: 1.8;
}

.exercise-tips ul li,
.exercise-mistakes ul li {
  margin-bottom: 5px;
}

.no-results {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 18px;
}

@media (max-width: 768px) {
  .exercise-guide h2 {
    font-size: 24px;
  }

  .filters {
    gap: 5px;
  }

  .filter-btn {
    padding: 8px 15px;
    font-size: 14px;
  }

  .exercise-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .exercise-info {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
