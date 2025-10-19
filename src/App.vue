<template>
  <div class="app">
    <header>
      <h1>Mon Plan d'Entraînement</h1>
      <div class="stats">
        <div class="stat-card">
          <span class="stat-label">Poids actuel</span>
          <span class="stat-value">187 lbs</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Objectif</span>
          <span class="stat-value">Perte de poids + Muscle</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Cette semaine</span>
          <span class="stat-value">{{ completedThisWeek }}/3 séances</span>
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
            :key="index"
            class="workout-card"
            :class="{ completed: isWorkoutCompleted(index) }"
          >
            <div class="workout-header">
              <h3>{{ workout.day }}</h3>
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
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      activeTab: 'training',
      currentWeek: 1,
      completedWorkouts: this.loadCompletedWorkouts(),
      workouts: [
        {
          day: 'Jour 1 - Corps Complet',
          duration: '1h - 1h30',
          exercises: [
            { name: 'Échauffement', details: '10 min de marche rapide ou vélo' },
            { name: 'Squats', details: '3 séries de 12 répétitions' },
            { name: 'Pompes (sur genoux si nécessaire)', details: '3 séries de 10 répétitions' },
            { name: 'Fentes', details: '3 séries de 10 par jambe' },
            { name: 'Planche', details: '3 séries de 30 secondes' },
            { name: 'Rowing avec haltères', details: '3 séries de 12 répétitions' }
          ],
          cardio: '15 minutes de marche rapide ou vélo',
          tip: 'Concentre-toi sur la forme plutôt que sur le poids. Mieux vaut bien faire avec moins de poids!'
        },
        {
          day: 'Jour 2 - Cardio + Abdos',
          duration: '1h - 1h15',
          exercises: [
            { name: 'Échauffement', details: '5 min de marche' },
            { name: 'Course/Marche rapide', details: '30 minutes (alterne 2 min rapide, 1 min lent)' },
            { name: 'Crunchs', details: '3 séries de 15 répétitions' },
            { name: 'Planche latérale', details: '3 séries de 20 sec par côté' },
            { name: 'Mountain climbers', details: '3 séries de 20 répétitions' },
            { name: 'Bicycle crunches', details: '3 séries de 20 répétitions' }
          ],
          cardio: '10 minutes de retour au calme',
          tip: 'Le cardio est essentiel pour brûler les graisses. Ne saute pas cette séance!'
        },
        {
          day: 'Jour 3 - Force + Cardio',
          duration: '1h - 1h30',
          exercises: [
            { name: 'Échauffement', details: '10 min de vélo' },
            { name: 'Développé couché ou pompes', details: '3 séries de 10 répétitions' },
            { name: 'Squats avec poids', details: '3 séries de 12 répétitions' },
            { name: 'Curl biceps', details: '3 séries de 12 répétitions' },
            { name: 'Extension triceps', details: '3 séries de 12 répétitions' },
            { name: 'Soulevé de terre (léger)', details: '3 séries de 10 répétitions' }
          ],
          cardio: '20 minutes de vélo ou elliptique',
          tip: 'Repose-toi 48h entre les séances de force pour permettre aux muscles de récupérer!'
        }
      ],
      meals: [
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
    }
  },
  computed: {
    completedThisWeek() {
      const weekKey = `week_${this.currentWeek}`
      return this.completedWorkouts[weekKey]?.filter(Boolean).length || 0
    }
  },
  methods: {
    loadCompletedWorkouts() {
      const saved = localStorage.getItem('completedWorkouts')
      return saved ? JSON.parse(saved) : {}
    },
    saveCompletedWorkouts() {
      localStorage.setItem('completedWorkouts', JSON.stringify(this.completedWorkouts))
    },
    isWorkoutCompleted(workoutIndex) {
      const weekKey = `week_${this.currentWeek}`
      return this.completedWorkouts[weekKey]?.[workoutIndex] || false
    },
    toggleWorkout(workoutIndex) {
      const weekKey = `week_${this.currentWeek}`
      if (!this.completedWorkouts[weekKey]) {
        this.completedWorkouts[weekKey] = []
      }
      this.completedWorkouts[weekKey][workoutIndex] = !this.completedWorkouts[weekKey][workoutIndex]
      this.saveCompletedWorkouts()
    },
    changeWeek(delta) {
      this.currentWeek += delta
      if (this.currentWeek < 1) this.currentWeek = 1
    }
  }
}
</script>
