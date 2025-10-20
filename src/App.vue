<template>
  <div class="app" :class="{ 'dark-mode': darkMode }">
    <!-- Afficher Auth si non connecté -->
    <Auth v-if="!user" @authenticated="handleAuthenticated" />

    <!-- Modal de configuration du profil pour la première fois -->
    <ProfileModal
      v-else-if="user && isFirstTimeUser"
      :isOpen="true"
      :isFirstTime="true"
      :initialProfile="userProfile"
      @close="() => {}"
      @profile-updated="handleProfileUpdated"
      @logout="handleLogout"
    />

    <!-- Afficher l'app si connecté ET profil configuré -->
    <template v-else-if="user && !isFirstTimeUser">
      <!-- Modal de profil (pour modifications) -->
      <ProfileModal
        :isOpen="showProfileModal"
        :isFirstTime="false"
        :initialProfile="userProfile"
        @close="showProfileModal = false"
        @profile-updated="handleProfileUpdated"
        @logout="handleLogout"
      />

      <header>
        <div class="header-top">
          <h1>Mon Plan d'Entraînement</h1>
          <div class="header-buttons">
            <button @click="toggleDarkMode" class="btn-dark-mode" :title="darkMode ? 'Mode clair' : 'Mode sombre'">
              {{ darkMode ? '☀️' : '🌙' }}
            </button>
            <button @click="showProfileModal = true" class="btn-edit-profile">
              Modifier
            </button>
            <button @click="handleLogout" class="btn-logout-header">
              Déconnexion
            </button>
          </div>
        </div>
        <div class="stats">
          <div class="stat-card">
            <span class="stat-label">Poids actuel</span>
            <span class="stat-value">{{ userProfile.current_weight || '---' }} lbs</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Objectif</span>
            <span class="stat-value">{{ getGoalLabel(userProfile.goal) }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Cette semaine</span>
            <span class="stat-value">{{ completedThisWeek }} séances</span>
          </div>
        </div>
      </header>

      <main>
        <div class="tabs">
          <button
            @click="activeTab = 'training'"
            :class="{ active: activeTab === 'training' }"
          >
            Entraînement
          </button>
          <button
            @click="activeTab = 'progress'"
            :class="{ active: activeTab === 'progress' }"
          >
            Progrès
          </button>
          <button
            @click="activeTab = 'exercises'"
            :class="{ active: activeTab === 'exercises' }"
          >
            Exercices
          </button>
          <button
            @click="activeTab = 'meals'"
            :class="{ active: activeTab === 'meals' }"
          >
            Repas
          </button>
        </div>

        <!-- Onglet Entraînement -->
        <div v-if="activeTab === 'training'" class="content">
          <div class="week-selector">
            <button @click="changeWeek(-1)">← Semaine précédente</button>
            <h2>Semaine {{ currentWeek }}</h2>
            <button @click="changeWeek(1)">Semaine suivante →</button>
          </div>

          <div class="workouts">
            <div
              v-for="(workout, index) in workouts"
              :key="workout.id"
              class="workout-card"
              :class="{ completed: isWorkoutCompleted(index) }"
            >
              <div class="workout-header">
                <h3>{{ workout.dayName }} - {{ workout.name }}</h3>
                <label class="checkbox-container">
                  <input
                    type="checkbox"
                    :checked="isWorkoutCompleted(index)"
                    @change="toggleWorkout(index)"
                  >
                  <span class="checkmark"></span>
                </label>
              </div>
              <p class="workout-duration">{{ workout.duration }}</p>

              <div class="exercises">
                <h4>Exercices:</h4>
                <ul>
                  <li v-for="(exercise, i) in workout.exercises" :key="i">
                    <strong>{{ exercise.name }}</strong> - {{ exercise.details }}
                  </li>
                </ul>
              </div>

              <div v-if="workout.cardio" class="cardio">
                <h4>Cardio:</h4>
                <p>{{ workout.cardio }}</p>
              </div>

              <div class="tips">
                <strong>💡 Conseil:</strong> {{ workout.tip }}
              </div>
            </div>
          </div>
        </div>

        <!-- Onglet Progrès -->
        <div v-if="activeTab === 'progress'" class="content">
          <ProgressChart
            v-if="user"
            :userId="user.id"
            :initialWeight="userProfile.current_weight"
            :targetWeight="userProfile.target_weight"
            @weight-updated="handleWeightUpdated"
          />
        </div>

        <!-- Onglet Exercices -->
        <div v-if="activeTab === 'exercises'" class="content">
          <ExerciseGuide />
        </div>

        <!-- Onglet Repas -->
        <div v-if="activeTab === 'meals'" class="content">
          <div class="meal-intro">
            <h2>Plan de Repas Simple</h2>
            <p>Des repas faciles à préparer pour soutenir ton entraînement et ta perte de poids!</p>
          </div>

          <div class="meals">
            <div v-for="(meal, index) in meals" :key="index" class="meal-card">
              <h3>{{ meal.name }}</h3>
              <div class="meal-options">
                <div v-for="(option, i) in meal.options" :key="i" class="meal-option">
                  <h4>Option {{ i + 1 }}</h4>
                  <ul>
                    <li v-for="(item, j) in option.items" :key="j">{{ item }}</li>
                  </ul>
                  <p class="prep-time">⏱️ {{ option.prepTime }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="nutrition-tips">
            <h3>Conseils Nutrition</h3>
            <ul>
              <li>Boire au moins 2L d'eau par jour</li>
              <li>Manger des protéines à chaque repas (poulet, thon, oeufs, yogourt grec)</li>
              <li>Éviter les boissons sucrées et l'alcool</li>
              <li>Prendre une collation protéinée après l'entraînement</li>
              <li>Préparer tes repas à l'avance le dimanche pour la semaine</li>
            </ul>
          </div>
        </div>
      </main>
    </template>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { supabase } from './supabase'
import Auth from './components/Auth.vue'
import ProfileModal from './components/ProfileModal.vue'
import ProgressChart from './components/ProgressChart.vue'
import ExerciseGuide from './components/ExerciseGuide.vue'
import { generateWeeklyPlan } from './workouts-data.js'

export default {
  name: 'App',
  components: {
    Auth,
    ProfileModal,
    ProgressChart,
    ExerciseGuide
  },
  setup() {
    const user = ref(null)
    const userProfile = ref({
      full_name: '',
      current_weight: null,
      target_weight: null,
      height: null,
      age: null,
      goal: '',
      sessions_per_week: null
    })
    const activeTab = ref('training')
    const currentWeek = ref(1)
    const completedWorkouts = ref({})
    const showProfileModal = ref(false)
    const isFirstTimeUser = ref(false)
    const weeklyWorkouts = ref([])
    const weeklyPlans = ref({})
    const darkMode = ref(false)

    // Générer ou récupérer le plan de la semaine
    const getWeeklyWorkouts = () => {
      // Ne pas générer si le profil n'est pas encore configuré
      if (!userProfile.value.sessions_per_week) {
        return []
      }

      const weekKey = `week_${currentWeek.value}`

      // Si le plan existe déjà pour cette semaine, l'utiliser
      if (weeklyPlans.value[weekKey]) {
        return weeklyPlans.value[weekKey]
      }

      // Sinon, générer un nouveau plan
      const sessionsPerWeek = userProfile.value.sessions_per_week
      const previousWeek = `week_${currentWeek.value - 1}`
      const previousWorkoutIds = weeklyPlans.value[previousWeek]?.map(w => w.id) || []

      const newPlan = generateWeeklyPlan(sessionsPerWeek, previousWorkoutIds)
      weeklyPlans.value[weekKey] = newPlan

      // Sauvegarder dans localStorage
      localStorage.setItem('weeklyPlans', JSON.stringify(weeklyPlans.value))

      return newPlan
    }

    // Computed pour les workouts de la semaine actuelle
    const workouts = computed(() => {
      return getWeeklyWorkouts()
    })

    const meals = [
      {
        name: 'Petit-déjeuner',
        options: [
          {
            items: [
              '3 oeufs brouillés',
              '2 rôties de pain complet',
              '1 banane',
              '1 verre de lait ou café'
            ],
            prepTime: '10 minutes'
          },
          {
            items: [
              'Gruau instantané (1 sachet)',
              '1 scoop de protéine en poudre',
              '1 pomme coupée',
              'Cannelle au goût'
            ],
            prepTime: '5 minutes'
          },
          {
            items: [
              'Yogourt grec (200g)',
              'Granola (1/2 tasse)',
              'Fruits congelés',
              '1 cuillère de beurre d\'arachide'
            ],
            prepTime: '2 minutes'
          }
        ]
      },
      {
        name: 'Dîner',
        options: [
          {
            items: [
              '2 boîtes de thon',
              'Pain pita ou tortilla',
              'Laitue, tomate, concombre',
              '1 pomme'
            ],
            prepTime: '5 minutes'
          },
          {
            items: [
              'Poulet rôti du supermarché (1/4 de poulet)',
              'Salade César en sac',
              '1 pain complet'
            ],
            prepTime: '3 minutes'
          },
          {
            items: [
              'Wrap au poulet: tortilla + poulet pré-cuit + fromage + laitue',
              'Bâtonnets de carotte',
              '1 yogourt'
            ],
            prepTime: '5 minutes'
          }
        ]
      },
      {
        name: 'Souper',
        options: [
          {
            items: [
              'Poitrines de poulet au four (assaisonnées)',
              'Riz minute (micro-ondes)',
              'Légumes surgelés au micro-ondes',
              'Sauce teriyaki'
            ],
            prepTime: '25 minutes'
          },
          {
            items: [
              'Pâtes (spaghetti)',
              'Boeuf haché cuit + sauce tomate en pot',
              'Brocoli vapeur (sac surgelé)'
            ],
            prepTime: '20 minutes'
          },
          {
            items: [
              'Saumon surgelé au four',
              'Patates douces au micro-ondes',
              'Salade verte en sac + vinaigrette'
            ],
            prepTime: '20 minutes'
          }
        ]
      },
      {
        name: 'Collations',
        options: [
          {
            items: [
              'Shake protéiné',
              '1 banane',
              'Poignée d\'amandes'
            ],
            prepTime: '2 minutes'
          },
          {
            items: [
              'Yogourt grec',
              'Granola',
              'Fruits'
            ],
            prepTime: '2 minutes'
          },
          {
            items: [
              '2 oeufs cuits durs (préparer à l\'avance)',
              'Fromage en ficelle',
              '1 pomme'
            ],
            prepTime: '1 minute'
          }
        ]
      }
    ]

    // Computed
    const completedThisWeek = computed(() => {
      const weekKey = `week_${currentWeek.value}`
      const sessionsPerWeek = userProfile.value.sessions_per_week || 3
      const completed = completedWorkouts.value[weekKey]?.filter(Boolean).length || 0
      return `${completed}/${sessionsPerWeek}`
    })

    // Méthodes
    const loadCompletedWorkouts = () => {
      const saved = localStorage.getItem('completedWorkouts')
      return saved ? JSON.parse(saved) : {}
    }

    const saveCompletedWorkouts = () => {
      localStorage.setItem('completedWorkouts', JSON.stringify(completedWorkouts.value))
    }

    const isWorkoutCompleted = (workoutIndex) => {
      const weekKey = `week_${currentWeek.value}`
      return completedWorkouts.value[weekKey]?.[workoutIndex] || false
    }

    const toggleWorkout = (workoutIndex) => {
      const weekKey = `week_${currentWeek.value}`
      if (!completedWorkouts.value[weekKey]) {
        completedWorkouts.value[weekKey] = []
      }
      completedWorkouts.value[weekKey][workoutIndex] = !completedWorkouts.value[weekKey][workoutIndex]
      saveCompletedWorkouts()
    }

    const changeWeek = (delta) => {
      currentWeek.value += delta
      if (currentWeek.value < 1) currentWeek.value = 1
    }

    const getGoalLabel = (goal) => {
      const labels = {
        'weight_loss': 'Perte de poids',
        'muscle_gain': 'Gain de muscle',
        'both': 'Perte de poids + Muscle',
        'maintenance': 'Maintien'
      }
      return labels[goal] || 'Non défini'
    }

    const handleAuthenticated = async (authenticatedUser) => {
      user.value = authenticatedUser
      await loadUserProfile()
    }

    const loadUserProfile = async () => {
      try {
        // Charger depuis Supabase
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.value.id)
          .single()

        if (error && error.code !== 'PGRST116') throw error

        if (data) {
          userProfile.value = {
            full_name: data.full_name || '',
            current_weight: data.current_weight || null,
            target_weight: data.target_weight || null,
            height: data.height || null,
            age: data.age || null,
            goal: data.goal || '',
            sessions_per_week: data.sessions_per_week || null
          }
          // Si le profil n'a pas de données, c'est la première fois
          isFirstTimeUser.value = !data.full_name || !data.goal || !data.sessions_per_week
        } else {
          // Pas de profil = première fois
          isFirstTimeUser.value = true
        }
      } catch (err) {
        console.error('Error loading profile:', err)
        // En cas d'erreur, considérer comme première fois
        isFirstTimeUser.value = true
      }
    }

    const handleProfileUpdated = (updatedProfile) => {
      userProfile.value = { ...updatedProfile }
      isFirstTimeUser.value = false
      showProfileModal.value = false

      // Régénérer les workouts de la semaine courante avec le nouveau nombre de séances
      const weekKey = `week_${currentWeek.value}`
      delete weeklyPlans.value[weekKey]  // Supprimer le plan existant
      weeklyWorkouts.value = getWeeklyWorkouts()  // Régénérer
    }

    const handleWeightUpdated = (newWeight) => {
      userProfile.value.current_weight = newWeight
    }

    const toggleDarkMode = () => {
      darkMode.value = !darkMode.value
      localStorage.setItem('darkMode', darkMode.value)
    }

    const handleLogout = () => {
      
      user.value = null
      userProfile.value = {
        full_name: '',
        current_weight: null,
        target_weight: null,
        height: null,
        age: null,
        goal: '',
        sessions_per_week: null
      }
      showProfileModal.value = false
      isFirstTimeUser.value = false
    }

    // Vérifier si l'utilisateur est déjà connecté au chargement
    onMounted(async () => {
      completedWorkouts.value = loadCompletedWorkouts()

      // Charger les plans hebdomadaires sauvegardés
      const savedPlans = localStorage.getItem('weeklyPlans')
      if (savedPlans) {
        weeklyPlans.value = JSON.parse(savedPlans)
      }

      // Charger le dark mode sauvegardé
      const savedDarkMode = localStorage.getItem('darkMode')
      if (savedDarkMode === 'true') {
        darkMode.value = true
      }
    })

    // Watcher pour regénérer les workouts quand on change de semaine ou de nombre de séances
    watch([currentWeek, () => userProfile.value.sessions_per_week], () => {
      weeklyWorkouts.value = getWeeklyWorkouts()
    })

    return {
      user,
      userProfile,
      activeTab,
      currentWeek,
      completedWorkouts,
      workouts,
      meals,
      completedThisWeek,
      isWorkoutCompleted,
      toggleWorkout,
      changeWeek,
      getGoalLabel,
      handleAuthenticated,
      handleProfileUpdated,
      handleWeightUpdated,
      handleLogout,
      showProfileModal,
      isFirstTimeUser,
      darkMode,
      toggleDarkMode
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  transition: background 0.3s;
}

.app {
  min-height: 100vh;
}

/* Dark Mode */
.dark-mode {
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  color: #e0e0e0;
}

.dark-mode body {
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
}

header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-size: 200% 200%;
  animation: headerGradient 10s ease infinite;
  color: white;
  padding: 35px 20px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(102, 126, 234, 0.2);
  position: relative;
  overflow: hidden;
}

header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%);
  pointer-events: none;
}

@keyframes headerGradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 15px;
}

h1 {
  margin: 0;
  font-size: 32px;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.btn-dark-mode,
.btn-edit-profile,
.btn-logout-header {
  padding: 10px 20px;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
}

.btn-dark-mode {
  background: rgba(255, 255, 255, 0.25);
  font-size: 20px;
  padding: 10px 15px;
  min-width: 50px;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.btn-dark-mode:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

.btn-edit-profile {
  background: rgba(255, 255, 255, 0.2);
}

.btn-edit-profile:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: white;
  transform: translateY(-2px);
}

.btn-logout-header {
  background: rgba(244, 67, 54, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.btn-logout-header:hover {
  background: rgba(244, 67, 54, 0.5);
  border-color: white;
  transform: translateY(-2px);
}

.stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  max-width: 900px;
  margin: 0 auto;
}

.stat-card {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(15px);
  padding: 18px 30px;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 160px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.3);
}

.stat-label {
  font-size: 13px;
  opacity: 0.95;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.stat-value {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 12px;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08), 0 2px 5px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.tabs button {
  flex: 1;
  padding: 14px 24px;
  border: none;
  background: transparent;
  color: #777;
  font-size: 16px;
  font-weight: 700;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  letter-spacing: 0.3px;
}

.tabs button:hover:not(.active) {
  background: rgba(102, 126, 234, 0.08);
  color: #667eea;
  transform: translateY(-2px);
}

.tabs button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-size: 200% 200%;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3), 0 2px 5px rgba(118, 75, 162, 0.2);
  animation: activeTabGradient 8s ease infinite;
}

@keyframes activeTabGradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.content {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.week-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 25px 30px;
  border-radius: 20px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08), 0 2px 5px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.week-selector button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
  letter-spacing: 0.3px;
}

.week-selector button:hover {
  background: linear-gradient(135deg, #5568d3 0%, #6a3f8a 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(102, 126, 234, 0.35);
}

.week-selector button:active {
  transform: translateY(0);
}

.week-selector h2 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.workouts {
  display: grid;
  gap: 20px;
}

.workout-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08), 0 2px 5px rgba(0, 0, 0, 0.04);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 2px solid transparent;
  border-left: 6px solid #667eea;
  position: relative;
  overflow: hidden;
}

.workout-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.workout-card:hover::before {
  opacity: 1;
}

.workout-card.completed {
  border-left-color: #4caf50;
  background: linear-gradient(135deg, #f1f8f4 0%, #e8f5e9 100%);
  border-color: rgba(76, 175, 80, 0.2);
}

.workout-card:hover {
  transform: translateY(-5px) scale(1.01);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: rgba(102, 126, 234, 0.3);
}

.workout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.workout-header h3 {
  color: #333;
  font-size: 22px;
}

.checkbox-container {
  position: relative;
  cursor: pointer;
  user-select: none;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  display: block;
  width: 30px;
  height: 30px;
  background: #e0e0e0;
  border-radius: 6px;
  transition: all 0.3s;
}

.checkbox-container input:checked ~ .checkmark {
  background: #4caf50;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 11px;
  top: 7px;
  width: 6px;
  height: 12px;
  border: solid white;
  border-width: 0 3px 3px 0;
  transform: rotate(45deg);
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.workout-duration {
  color: #666;
  margin-bottom: 20px;
  font-size: 15px;
}

.exercises h4,
.cardio h4 {
  color: #667eea;
  margin-bottom: 12px;
  font-size: 18px;
}

.exercises ul {
  list-style: none;
  margin-bottom: 20px;
}

.exercises li {
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.exercises li:last-child {
  border-bottom: none;
}

.cardio {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #f0f0f0;
}

.cardio p {
  color: #555;
}

.tips {
  margin-top: 20px;
  padding: 15px;
  background: #fff8e1;
  border-radius: 10px;
  border-left: 4px solid #ffc107;
  color: #555;
}

/* Meals Section */
.meal-intro {
  background: white;
  padding: 25px;
  border-radius: 15px;
  margin-bottom: 25px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.meal-intro h2 {
  color: #333;
  margin-bottom: 10px;
}

.meal-intro p {
  color: #666;
  font-size: 16px;
}

.meals {
  display: grid;
  gap: 20px;
  margin-bottom: 25px;
}

.meal-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08), 0 2px 5px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.meal-card h3 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 25px;
  font-size: 26px;
  font-weight: 800;
  text-align: center;
  letter-spacing: -0.5px;
}

.meal-options {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.meal-option {
  background: linear-gradient(135deg, #fafbff 0%, #ffffff 100%);
  padding: 24px;
  border-radius: 16px;
  border: 2px solid #e8ecf7;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

.meal-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(240, 147, 251, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.meal-option:hover {
  border-color: #667eea;
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.meal-option:hover::before {
  opacity: 1;
}

.meal-option h4 {
  color: #764ba2;
  margin-bottom: 12px;
  font-size: 18px;
}

.meal-option ul {
  list-style: none;
  margin-bottom: 15px;
}

.meal-option li {
  padding: 8px 0;
  padding-left: 20px;
  position: relative;
  color: #555;
}

.meal-option li:before {
  content: "✓";
  position: absolute;
  left: 0;
  color: #4caf50;
  font-weight: bold;
}

.prep-time {
  color: #666;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.nutrition-tips {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.nutrition-tips h3 {
  color: #333;
  margin-bottom: 15px;
  font-size: 22px;
}

.nutrition-tips ul {
  list-style: none;
}

.nutrition-tips li {
  padding: 12px 0;
  padding-left: 30px;
  position: relative;
  color: #555;
  border-bottom: 1px solid #f0f0f0;
}

.nutrition-tips li:last-child {
  border-bottom: none;
}

.nutrition-tips li:before {
  content: "💪";
  position: absolute;
  left: 0;
}

/* ============================================
   DARK MODE STYLES
   ============================================ */

.dark-mode header {
  background: linear-gradient(135deg, #5468ff 0%, #9b59b6 100%);
  background-size: 200% 200%;
  animation: headerGradient 10s ease infinite;
  box-shadow: 0 4px 25px rgba(84, 104, 255, 0.3);
}

.dark-mode .tabs {
  background: rgba(42, 42, 58, 0.8);
  backdrop-filter: blur(15px);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .tabs button {
  color: #a0a0b0;
}

.dark-mode .tabs button:hover:not(.active) {
  background: rgba(84, 104, 255, 0.15);
  color: #8b9adb;
}

.dark-mode .tabs button.active {
  background: linear-gradient(135deg, #5468ff 0%, #9b59b6 100%);
  background-size: 200% 200%;
  color: white;
  box-shadow: 0 4px 15px rgba(84, 104, 255, 0.4);
}

.dark-mode .week-selector {
  background: rgba(42, 42, 58, 0.8);
  backdrop-filter: blur(15px);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .week-selector h2 {
  background: linear-gradient(135deg, #8b9adb 0%, #c298e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark-mode .week-selector button {
  background: linear-gradient(135deg, #5468ff 0%, #9b59b6 100%);
  box-shadow: 0 4px 15px rgba(84, 104, 255, 0.3);
}

.dark-mode .week-selector button:hover {
  background: linear-gradient(135deg, #6878ff 0%, #af6dca 100%);
  box-shadow: 0 6px 20px rgba(84, 104, 255, 0.4);
}

.dark-mode .workout-card {
  background: linear-gradient(135deg, #2a2a3a 0%, #1f1f2e 100%);
  border-color: rgba(255, 255, 255, 0.05);
  border-left-color: #5468ff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.dark-mode .workout-card::before {
  background: linear-gradient(135deg, rgba(84, 104, 255, 0.1) 0%, rgba(155, 89, 182, 0.1) 100%);
}

.dark-mode .workout-card.completed {
  background: linear-gradient(135deg, #1a3a2a 0%, #152e20 100%);
  border-left-color: #4caf50;
  border-color: rgba(76, 175, 80, 0.2);
}

.dark-mode .workout-card:hover {
  border-color: rgba(84, 104, 255, 0.4);
  box-shadow: 0 8px 35px rgba(84, 104, 255, 0.2);
}

.dark-mode .workout-card h3 {
  color: #e8e8f0;
}

.dark-mode .workout-duration {
  color: #b0b0c0;
}

.dark-mode .exercises li {
  border-bottom-color: rgba(255, 255, 255, 0.08);
  color: #d0d0e0;
}

.dark-mode .exercises h4,
.dark-mode .cardio h4 {
  background: linear-gradient(135deg, #8b9adb 0%, #c298e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark-mode .cardio p {
  color: #d0d0e0;
}

.dark-mode .tips {
  background: linear-gradient(135deg, #3a3020 0%, #2a2518 100%);
  border-left-color: #ffc107;
  color: #f0e0b0;
  box-shadow: 0 4px 15px rgba(255, 193, 7, 0.1);
}

.dark-mode .meal-intro,
.dark-mode .meal-card,
.dark-mode .nutrition-tips {
  background: linear-gradient(135deg, #2a2a3a 0%, #1f1f2e 100%);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.dark-mode .meal-intro h2,
.dark-mode .meal-card h3,
.dark-mode .nutrition-tips h3 {
  background: linear-gradient(135deg, #8b9adb 0%, #c298e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark-mode .meal-intro p {
  color: #b0b0c0;
}

.dark-mode .meal-option {
  background: linear-gradient(135deg, #1f1f2e 0%, #252538 100%);
  border-color: rgba(255, 255, 255, 0.08);
}

.dark-mode .meal-option::before {
  background: linear-gradient(135deg, rgba(84, 104, 255, 0.08) 0%, rgba(224, 86, 253, 0.08) 100%);
}

.dark-mode .meal-option:hover {
  border-color: #5468ff;
  box-shadow: 0 8px 30px rgba(84, 104, 255, 0.2);
}

.dark-mode .meal-option h4 {
  color: #c298e0;
}

.dark-mode .meal-option li {
  color: #d0d0e0;
}

.dark-mode .prep-time {
  color: #b0b0c0;
}

.dark-mode .nutrition-tips li {
  color: #d0d0e0;
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

@media (max-width: 768px) {
  h1 {
    font-size: 24px;
  }

  .header-top {
    flex-direction: column;
    text-align: center;
    padding: 0;
  }

  .header-buttons {
    width: 100%;
    justify-content: center;
  }

  .btn-edit-profile,
  .btn-logout-header {
    flex: 1;
    max-width: 150px;
  }

  .stats {
    flex-direction: column;
  }

  .stat-card {
    width: 100%;
  }

  .week-selector {
    flex-direction: column;
    gap: 15px;
  }

  .week-selector button {
    width: 100%;
  }

  .meal-options {
    grid-template-columns: 1fr;
  }
}
</style>
