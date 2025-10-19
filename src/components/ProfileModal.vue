<template>
  <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ isFirstTime ? 'Bienvenue! Configurons ton profil' : 'Modifier mon profil' }}</h2>
        <button v-if="!isFirstTime" @click="closeModal" class="btn-close">✕</button>
      </div>

      <form @submit.prevent="saveProfile" class="profile-form">
        <div class="form-group">
          <label>Nom complet</label>
          <input v-model="profile.full_name" type="text" placeholder="Votre nom" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Poids actuel (lbs)</label>
            <input v-model.number="profile.current_weight" type="number" step="0.1" required>
          </div>

          <div class="form-group">
            <label>Poids objectif (lbs)</label>
            <input v-model.number="profile.target_weight" type="number" step="0.1" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Taille (cm)</label>
            <input v-model.number="profile.height" type="number" required>
          </div>

          <div class="form-group">
            <label>Âge</label>
            <input v-model.number="profile.age" type="number" required>
          </div>
        </div>

        <div class="form-group">
          <label>Objectif</label>
          <select v-model="profile.goal" required>
            <option value="">Sélectionnez un objectif</option>
            <option value="weight_loss">Perte de poids</option>
            <option value="muscle_gain">Gain de muscle</option>
            <option value="both">Perte de poids + Muscle</option>
            <option value="maintenance">Maintien</option>
          </select>
        </div>

        <div class="form-group">
          <label>Nombre de séances par semaine</label>
          <select v-model.number="profile.sessions_per_week" required>
            <option value="">Sélectionnez le nombre de séances</option>
            <option value="2">2 séances / semaine</option>
            <option value="3">3 séances / semaine</option>
            <option value="4">4 séances / semaine</option>
            <option value="5">5 séances / semaine</option>
          </select>
        </div>

        <button type="submit" class="btn-save" :disabled="loading">
          {{ loading ? 'Sauvegarde...' : 'Sauvegarder' }}
        </button>

        <div v-if="message" class="message" :class="{ error: isError }">
          {{ message }}
        </div>
      </form>

      <button v-if="!isFirstTime" @click="handleLogout" class="btn-logout-modal">
        Déconnexion
      </button>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { supabase } from '../supabase'

export default {
  name: 'ProfileModal',
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    isFirstTime: {
      type: Boolean,
      default: false
    },
    initialProfile: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['close', 'profile-updated', 'logout'],
  setup(props, { emit }) {
    const profile = ref({
      full_name: '',
      current_weight: null,
      target_weight: null,
      height: null,
      age: null,
      goal: '',
      sessions_per_week: null
    })
    const loading = ref(false)
    const message = ref('')
    const isError = ref(false)

    // Charger le profil initial quand il change
    watch(() => props.initialProfile, (newProfile) => {
      if (newProfile && Object.keys(newProfile).length > 0) {
        profile.value = { ...newProfile }
      }
    }, { immediate: true })

    const saveProfile = async () => {
      loading.value = true
      message.value = ''
      isError.value = false

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            ...profile.value,
            updated_at: new Date().toISOString()
          })

        if (error) throw error

        message.value = 'Profil sauvegardé avec succès!'
        emit('profile-updated', profile.value)

        setTimeout(() => {
          message.value = ''
          if (!isError.value) {
            closeModal()
          }
        }, 1500)
      } catch (err) {
        message.value = err.message
        isError.value = true
      } finally {
        loading.value = false
      }
    }

    const closeModal = () => {
      if (!props.isFirstTime) {
        emit('close')
      }
    }

    const handleOverlayClick = () => {
      if (!props.isFirstTime) {
        closeModal()
      }
    }

    const handleLogout = async () => {
      await supabase.auth.signOut()
      emit('logout')
    }

    return {
      profile,
      loading,
      message,
      isError,
      saveProfile,
      closeModal,
      handleOverlayClick,
      handleLogout
    }
  }
}
</script>

<style scoped>
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
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.btn-close:hover {
  background: #f0f0f0;
  color: #333;
}

.profile-form {
  max-width: 100%;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 15px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.btn-save {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-logout-modal {
  width: 100%;
  padding: 12px;
  margin-top: 15px;
  background: transparent;
  color: #f44336;
  border: 2px solid #f44336;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-logout-modal:hover {
  background: #f44336;
  color: white;
}

.message {
  margin-top: 15px;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  background: #e8f5e9;
  color: #2e7d32;
}

.message.error {
  background: #ffebee;
  color: #c62828;
}

@media (max-width: 600px) {
  .modal-content {
    padding: 25px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-header h2 {
    font-size: 20px;
  }
}
</style>
