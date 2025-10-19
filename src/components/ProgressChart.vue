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
  setup(props) {
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
  background: white;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.progress-header h2 {
  margin: 0;
  color: #333;
}

.btn-add {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.stat-box {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  border: 2px solid #e0e0e0;
}

.stat-box.positive {
  background: #e8f5e9;
  border-color: #4caf50;
}

.stat-box.negative {
  background: #ffebee;
  border-color: #f44336;
}

.stat-label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #333;
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
