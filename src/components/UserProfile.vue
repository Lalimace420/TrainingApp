<template>
  <div class="profile-container">
    <div class="profile-header">
      <h2>Mon Profil</h2>
      <button @click="handleLogout" class="btn-logout">Déconnexion</button>
    </div>

    <form @submit.prevent="saveProfile" class="profile-form">
      <div class="form-group">
        <label>Nom complet</label>
        <input v-model="profile.full_name" type="text" placeholder="Votre nom">
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Poids actuel (lbs)</label>
          <input v-model.number="profile.current_weight" type="number" step="0.1">
        </div>

        <div class="form-group">
          <label>Poids objectif (lbs)</label>
          <input v-model.number="profile.target_weight" type="number" step="0.1">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Taille (cm)</label>
          <input v-model.number="profile.height" type="number">
        </div>

        <div class="form-group">
          <label>Âge</label>
          <input v-model.number="profile.age" type="number">
        </div>
      </div>

      <div class="form-group">
        <label>Objectif</label>
        <select v-model="profile.goal">
          <option value="">Sélectionnez un objectif</option>
          <option value="weight_loss">Perte de poids</option>
          <option value="muscle_gain">Gain de muscle</option>
          <option value="both">Perte de poids + Muscle</option>
          <option value="maintenance">Maintien</option>
        </select>
      </div>

      <button type="submit" class="btn-save" :disabled="loading">
        {{ loading ? 'Sauvegarde...' : 'Sauvegarder' }}
      </button>

      <div v-if="message" class="message" :class="{ error: isError }">
        {{ message }}
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'

export default {
  name: 'UserProfile',
  emits: ['logout', 'profile-updated'],
  setup(props, { emit }) {
    const profile = ref({
      full_name: '',
      current_weight: null,
      target_weight: null,
      height: null,
      age: null,
      goal: ''
    })
    const loading = ref(false)
    const message = ref('')
    const isError = ref(false)

    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') throw error

        if (data) {
          profile.value = {
            full_name: data.full_name || '',
            current_weight: data.current_weight || null,
            target_weight: data.target_weight || null,
            height: data.height || null,
            age: data.age || null,
            goal: data.goal || ''
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err)
      }
    }

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
        }, 3000)
      } catch (err) {
        message.value = err.message
        isError.value = true
      } finally {
        loading.value = false
      }
    }

    const handleLogout = async () => {
      await supabase.auth.signOut()
      emit('logout')
    }

    onMounted(() => {
      loadProfile()
    })

    return {
      profile,
      loading,
      message,
      isError,
      saveProfile,
      handleLogout
    }
  }
}
</script>

<style scoped>
.profile-container {
  background: white;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.profile-header h2 {
  margin: 0;
  color: #333;
}

.btn-logout {
  padding: 8px 16px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
}

.btn-logout:hover {
  background: #d32f2f;
}

.profile-form {
  max-width: 600px;
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
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #4a90e2;
}

.btn-save {
  width: 100%;
  padding: 12px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-save:hover:not(:disabled) {
  background: #357abd;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
