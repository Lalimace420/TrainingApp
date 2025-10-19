<template>
  <div class="progress-container">
    <div class="progress-header">
      <h2>Ma Progression</h2>
      <button @click="showAddWeight = true" class="btn-add">+ Ajouter une pesée</button>
    </div>

    <!-- Stats rapides -->
    <div class="quick-stats">
      <div class="stat-box">
        <span class="stat-label">Poids de départ</span>
        <span class="stat-value">{{ startWeight || '---' }} lbs</span>
      </div>
      <div class="stat-box">
        <span class="stat-label">Poids actuel</span>
        <span class="stat-value">{{ currentWeight || '---' }} lbs</span>
      </div>
      <div class="stat-box">
        <span class="stat-label">Objectif</span>
        <span class="stat-value">{{ targetWeight || '---' }} lbs</span>
      </div>
      <div class="stat-box" :class="{ positive: totalLoss > 0, negative: totalLoss < 0 }">
        <span class="stat-label">Perte totale</span>
        <span class="stat-value">{{ totalLoss > 0 ? '-' : '+' }}{{ Math.abs(totalLoss) }} lbs</span>
      </div>
    </div>

    <!-- Graphique -->
    <div class="chart-container">
      <h3>Évolution du poids</h3>
      <div v-if="weightEntries.length > 0" class="chart">
        <div class="chart-grid">
          <!-- Lignes horizontales -->
          <div v-for="i in 5" :key="'grid-' + i" class="grid-line" :style="{ bottom: ((i - 1) * 25) + '%' }">
            <span class="grid-label">{{ getGridValue(i) }} lbs</span>
          </div>
        </div>

        <!-- Points et ligne -->
        <svg class="chart-svg" :viewBox="`0 0 ${svgWidth} ${svgHeight}`">
          <!-- Ligne de l'objectif -->
          <line
            v-if="targetWeight"
            :x1="0"
            :y1="getYPosition(targetWeight)"
            :x2="svgWidth"
            :y2="getYPosition(targetWeight)"
            stroke="#4caf50"
            stroke-width="2"
            stroke-dasharray="5,5"
            opacity="0.5"
          />

          <!-- Ligne du graphique -->
          <polyline
            v-if="weightEntries.length > 1"
            :points="getPolylinePoints()"
            fill="none"
            stroke="#667eea"
            stroke-width="3"
          />

          <!-- Points -->
          <g v-for="(entry, index) in weightEntries" :key="entry.id">
            <circle
              :cx="getXPosition(index)"
              :cy="getYPosition(entry.weight)"
              r="6"
              fill="#667eea"
              stroke="white"
              stroke-width="2"
            />
            <!-- Tooltip au survol -->
            <title>{{ entry.date }}: {{ entry.weight }} lbs</title>
          </g>
        </svg>

        <!-- Labels des dates -->
        <div class="chart-labels">
          <span v-for="entry in weightEntries" :key="'label-' + entry.id" class="chart-label">
            {{ formatDate(entry.date) }}
          </span>
        </div>
      </div>

      <div v-else class="no-data">
        <p>📊 Aucune donnée pour le moment</p>
        <p>Commence à enregistrer ton poids pour voir ta progression!</p>
      </div>
    </div>

    <!-- Historique -->
    <div class="history-container">
      <h3>Historique des pesées</h3>
      <div v-if="weightEntries.length > 0" class="history-list">
        <div v-for="entry in weightEntries" :key="entry.id" class="history-item">
          <div class="history-date">{{ formatDateLong(entry.date) }}</div>
          <div class="history-weight">{{ entry.weight }} lbs</div>
          <div v-if="entry.difference" class="history-diff" :class="{ positive: entry.difference < 0, negative: entry.difference > 0 }">
            {{ entry.difference > 0 ? '+' : '' }}{{ entry.difference.toFixed(1) }} lbs
          </div>
          <button @click="deleteEntry(entry.id)" class="btn-delete">✕</button>
        </div>
      </div>
      <div v-else class="no-data-small">
        Aucune pesée enregistrée
      </div>
    </div>

    <!-- Modal pour ajouter un poids -->
    <div v-if="showAddWeight" class="modal-overlay" @click="showAddWeight = false">
      <div class="modal-content" @click.stop>
        <h3>Ajouter une pesée</h3>
        <form @submit.prevent="addWeightEntry">
          <div class="form-group">
            <label>Date</label>
            <input v-model="newEntry.date" type="date" required>
          </div>
          <div class="form-group">
            <label>Poids (lbs)</label>
            <input v-model.number="newEntry.weight" type="number" step="0.1" required>
          </div>
          <div class="form-actions">
            <button type="button" @click="showAddWeight = false" class="btn-cancel">Annuler</button>
            <button type="submit" class="btn-submit">Ajouter</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'

export default {
  name: 'ProgressChart',
  props: {
    userId: {
      type: String,
      required: true
    },
    initialWeight: {
      type: Number,
      default: null
    },
    targetWeight: {
      type: Number,
      default: null
    }
  },
  emits: ['weight-updated'],
  setup(props, { emit }) {
    const weightEntries = ref([])
    const showAddWeight = ref(false)
    const newEntry = ref({
      date: new Date().toISOString().split('T')[0],
      weight: null
    })

    const svgWidth = 800
    const svgHeight = 300
    const padding = 40

    // Computed
    const startWeight = computed(() => {
      if (weightEntries.value.length > 0) {
        return weightEntries.value[0].weight
      }
      return props.initialWeight
    })

    const currentWeight = computed(() => {
      if (weightEntries.value.length > 0) {
        return weightEntries.value[weightEntries.value.length - 1].weight
      }
      return props.initialWeight
    })

    const totalLoss = computed(() => {
      if (startWeight.value && currentWeight.value) {
        return (startWeight.value - currentWeight.value).toFixed(1)
      }
      return 0
    })

    const minWeight = computed(() => {
      if (weightEntries.value.length === 0) return props.targetWeight || 150
      const weights = weightEntries.value.map(e => e.weight)
      if (props.targetWeight) weights.push(props.targetWeight)
      return Math.min(...weights) - 5
    })

    const maxWeight = computed(() => {
      if (weightEntries.value.length === 0) return props.initialWeight || 200
      const weights = weightEntries.value.map(e => e.weight)
      if (props.initialWeight) weights.push(props.initialWeight)
      return Math.max(...weights) + 5
    })

    // Méthodes
    const loadWeightEntries = async () => {
      try {
        const { data, error } = await supabase
          .from('weight_entries')
          .select('*')
          .eq('user_id', props.userId)
          .order('date', { ascending: true })

        if (error) throw error

        // Calculer les différences
        weightEntries.value = data.map((entry, index) => {
          if (index === 0) {
            return { ...entry, difference: null }
          }
          return {
            ...entry,
            difference: entry.weight - data[index - 1].weight
          }
        })
      } catch (err) {
        console.error('Error loading weight entries:', err)
      }
    }

    const addWeightEntry = async () => {
      try {
        const { error } = await supabase
          .from('weight_entries')
          .insert({
            user_id: props.userId,
            date: newEntry.value.date,
            weight: newEntry.value.weight
          })

        if (error) throw error

        // Mettre à jour le poids actuel dans le profil
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            current_weight: newEntry.value.weight,
            updated_at: new Date().toISOString()
          })
          .eq('id', props.userId)

        if (profileError) console.error('Error updating profile weight:', profileError)

        // Émettre l'événement pour mettre à jour le profil dans App.vue
        emit('weight-updated', newEntry.value.weight)

        await loadWeightEntries()
        showAddWeight.value = false
        newEntry.value = {
          date: new Date().toISOString().split('T')[0],
          weight: null
        }
      } catch (err) {
        console.error('Error adding weight entry:', err)
        alert('Erreur lors de l\'ajout de la pesée')
      }
    }

    const deleteEntry = async (id) => {
      if (!confirm('Supprimer cette pesée?')) return

      try {
        const { error } = await supabase
          .from('weight_entries')
          .delete()
          .eq('id', id)

        if (error) throw error

        await loadWeightEntries()
      } catch (err) {
        console.error('Error deleting entry:', err)
        alert('Erreur lors de la suppression')
      }
    }

    const getYPosition = (weight) => {
      const range = maxWeight.value - minWeight.value
      const normalizedWeight = (weight - minWeight.value) / range
      return svgHeight - (normalizedWeight * (svgHeight - 2 * padding)) - padding
    }

    const getXPosition = (index) => {
      const step = (svgWidth - 2 * padding) / Math.max(weightEntries.value.length - 1, 1)
      return padding + (index * step)
    }

    const getPolylinePoints = () => {
      return weightEntries.value
        .map((entry, index) => `${getXPosition(index)},${getYPosition(entry.weight)}`)
        .join(' ')
    }

    const getGridValue = (i) => {
      const range = maxWeight.value - minWeight.value
      return (minWeight.value + (range * (i - 1) / 4)).toFixed(0)
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return `${date.getDate()}/${date.getMonth() + 1}`
    }

    const formatDateLong = (dateString) => {
      const date = new Date(dateString)
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      return date.toLocaleDateString('fr-FR', options)
    }

    onMounted(() => {
      loadWeightEntries()
    })

    return {
      weightEntries,
      showAddWeight,
      newEntry,
      startWeight,
      currentWeight,
      totalLoss,
      svgWidth,
      svgHeight,
      addWeightEntry,
      deleteEntry,
      getYPosition,
      getXPosition,
      getPolylinePoints,
      getGridValue,
      formatDate,
      formatDateLong
    }
  }
}
</script>

<style scoped>
.progress-container {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08), 0 2px 5px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.progress-header h2 {
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.btn-add {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-size: 200% 200%;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
  letter-spacing: 0.3px;
}

.btn-add:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  background-position: 100% 0;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.stat-box {
  background: linear-gradient(135deg, #fafbff 0%, #ffffff 100%);
  padding: 24px;
  border-radius: 16px;
  text-align: center;
  border: 2px solid #e8ecf7;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

.stat-box::before {
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

.stat-box:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
  border-color: #667eea;
}

.stat-box:hover::before {
  opacity: 1;
}

.stat-box.positive {
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 100%);
  border-color: #4caf50;
}

.stat-box.positive::before {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(76, 175, 80, 0.05) 100%);
}

.stat-box.negative {
  background: linear-gradient(135deg, #ffebee 0%, #fff5f5 100%);
  border-color: #f44336;
}

.stat-box.negative::before {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.08) 0%, rgba(244, 67, 54, 0.05) 100%);
}

.stat-label {
  display: block;
  font-size: 13px;
  color: #777;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  position: relative;
  z-index: 1;
}

.stat-value {
  display: block;
  font-size: 26px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
  position: relative;
  z-index: 1;
}

.stat-box.positive .stat-value {
  background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-box.negative .stat-value {
  background: linear-gradient(135deg, #c62828 0%, #f44336 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.chart-container {
  margin-bottom: 30px;
}

.chart-container h3 {
  color: #333;
  margin-bottom: 20px;
}

.chart {
  position: relative;
  background: #fafafa;
  border-radius: 12px;
  padding: 30px 20px 50px 20px;
  min-height: 350px;
}

.chart-grid {
  position: absolute;
  top: 30px;
  left: 20px;
  right: 20px;
  bottom: 50px;
}

.grid-line {
  position: absolute;
  left: 0;
  right: 0;
  border-top: 1px solid #e0e0e0;
}

.grid-label {
  position: absolute;
  left: -60px;
  top: -10px;
  font-size: 12px;
  color: #999;
}

.chart-svg {
  width: 100%;
  height: 300px;
  position: relative;
  z-index: 1;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  padding: 0 20px;
}

.chart-label {
  font-size: 12px;
  color: #666;
}

.no-data {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.no-data p:first-child {
  font-size: 48px;
  margin-bottom: 10px;
}

.history-container h3 {
  color: #333;
  margin-bottom: 15px;
}

.history-list {
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 15px;
  align-items: center;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 10px;
  margin-bottom: 10px;
  transition: all 0.3s;
}

.history-item:hover {
  background: #f0f0f0;
}

.history-date {
  color: #666;
  font-weight: 500;
}

.history-weight {
  font-weight: bold;
  color: #333;
  font-size: 18px;
}

.history-diff {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.history-diff.positive {
  background: #e8f5e9;
  color: #2e7d32;
}

.history-diff.negative {
  background: #ffebee;
  color: #c62828;
}

.btn-delete {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: #f44336;
  color: white;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.btn-delete:hover {
  background: #d32f2f;
  transform: scale(1.1);
}

.no-data-small {
  text-align: center;
  padding: 40px;
  color: #999;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 400px;
  width: 100%;
}

.modal-content h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 15px;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel {
  background: #e0e0e0;
  color: #666;
}

.btn-cancel:hover {
  background: #d0d0d0;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* Dark Mode */
.dark-mode .progress-container {
  background: linear-gradient(135deg, #2a2a3a 0%, #1f1f2e 100%);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.dark-mode .progress-header h2 {
  background: linear-gradient(135deg, #8b9adb 0%, #c298e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark-mode .btn-add {
  background: linear-gradient(135deg, #5468ff 0%, #9b59b6 50%, #e056fd 100%);
  box-shadow: 0 4px 15px rgba(84, 104, 255, 0.3);
}

.dark-mode .btn-add:hover {
  box-shadow: 0 6px 20px rgba(84, 104, 255, 0.4);
}

.dark-mode .stat-box {
  background: linear-gradient(135deg, #1f1f2e 0%, #252538 100%);
  border-color: rgba(255, 255, 255, 0.08);
}

.dark-mode .stat-box::before {
  background: linear-gradient(135deg, rgba(84, 104, 255, 0.08) 0%, rgba(224, 86, 253, 0.08) 100%);
}

.dark-mode .stat-box:hover {
  border-color: #5468ff;
  box-shadow: 0 8px 30px rgba(84, 104, 255, 0.2);
}

.dark-mode .stat-box.positive {
  background: linear-gradient(135deg, #1a3a2a 0%, #152e20 100%);
  border-color: rgba(76, 175, 80, 0.3);
}

.dark-mode .stat-box.negative {
  background: linear-gradient(135deg, #3a1a1a 0%, #2e1515 100%);
  border-color: rgba(244, 67, 54, 0.3);
}

.dark-mode .stat-label {
  color: #b0b0c0;
}

.dark-mode .stat-value {
  background: linear-gradient(135deg, #8b9adb 0%, #c298e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark-mode .stat-box.positive .stat-value {
  background: linear-gradient(135deg, #66bb6a 0%, #81c784 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark-mode .stat-box.negative .stat-value {
  background: linear-gradient(135deg, #ef5350 0%, #e57373 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark-mode .chart-container h3,
.dark-mode .history-container h3 {
  background: linear-gradient(135deg, #8b9adb 0%, #c298e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark-mode .chart {
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.dark-mode .grid-line {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .grid-label {
  color: #888;
}

.dark-mode .chart-label {
  color: #b0b0c0;
}

.dark-mode .no-data {
  color: #888;
}

.dark-mode .history-item {
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.dark-mode .history-item:hover {
  background: #252540;
  border-color: rgba(84, 104, 255, 0.3);
}

.dark-mode .history-date {
  color: #b0b0c0;
}

.dark-mode .history-weight {
  color: #e8e8f0;
}

.dark-mode .no-data-small {
  color: #888;
}

.dark-mode .modal-overlay {
  background: rgba(0, 0, 0, 0.85);
}

.dark-mode .modal-content {
  background: linear-gradient(135deg, #2a2a3a 0%, #1f1f2e 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark-mode .modal-content h3 {
  background: linear-gradient(135deg, #8b9adb 0%, #c298e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark-mode .form-group label {
  color: #b0b0c0;
}

.dark-mode .form-group input {
  background: #1a1a2e;
  border-color: rgba(255, 255, 255, 0.1);
  color: #e8e8f0;
}

.dark-mode .form-group input:focus {
  border-color: #5468ff;
  background: #252540;
}

.dark-mode .btn-cancel {
  background: #3a3a4a;
  color: #b0b0c0;
}

.dark-mode .btn-cancel:hover {
  background: #4a4a5a;
}

.dark-mode .btn-submit {
  background: linear-gradient(135deg, #5468ff 0%, #9b59b6 50%, #e056fd 100%);
}

@media (max-width: 768px) {
  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .history-item {
    grid-template-columns: 1fr auto;
    gap: 10px;
  }

  .history-diff,
  .btn-delete {
    grid-column: 2;
  }
}
</style>
