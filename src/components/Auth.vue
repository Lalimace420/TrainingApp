<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>{{ isLogin ? 'Connexion' : 'Inscription' }}</h1>

      <form @submit.prevent="handleAuth">
        <div class="form-group">
          <label>Email</label>
          <input
            type="email"
            v-model="email"
            required
            placeholder="votre@email.com"
          >
        </div>

        <div class="form-group">
          <label>Mot de passe</label>
          <input
            type="password"
            v-model="password"
            required
            placeholder="••••••••"
            minlength="6"
          >
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'S\'inscrire') }}
        </button>
      </form>

      <p class="toggle-auth">
        {{ isLogin ? 'Pas encore de compte?' : 'Déjà un compte?' }}
        <a @click="isLogin = !isLogin">
          {{ isLogin ? 'S\'inscrire' : 'Se connecter' }}
        </a>
      </p>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="success" class="success-message">
        {{ success }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { supabase } from '../supabase'

export default {
  name: 'Auth',
  emits: ['authenticated'],
  setup(props, { emit }) {
    const isLogin = ref(true)
    const email = ref('')
    const password = ref('')
    const loading = ref(false)
    const error = ref('')
    const success = ref('')

    const handleAuth = async () => {
      loading.value = true
      error.value = ''
      success.value = ''

      try {
        if (isLogin.value) {
          // Connexion
          const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email: email.value,
            password: password.value,
          })

          if (signInError) throw signInError

          emit('authenticated', data.user)
        } else {
          // Inscription
          const { data, error: signUpError } = await supabase.auth.signUp({
            email: email.value,
            password: password.value,
          })

          if (signUpError) throw signUpError

          success.value = 'Compte créé! Vérifiez votre email pour confirmer votre compte.'

          // Si l'email confirmation est désactivée, on peut se connecter directement
          if (data.user && data.session) {
            emit('authenticated', data.user)
          }
        }
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    return {
      isLogin,
      email,
      password,
      loading,
      error,
      success,
      handleAuth
    }
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-card {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
}

.auth-card h1 {
  margin: 0 0 30px 0;
  color: #333;
  text-align: center;
  font-size: 28px;
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
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-auth {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.toggle-auth a {
  color: #667eea;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
}

.toggle-auth a:hover {
  text-decoration: underline;
}

.error-message {
  margin-top: 15px;
  padding: 12px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  text-align: center;
}

.success-message {
  margin-top: 15px;
  padding: 12px;
  background: #efe;
  border: 1px solid #cfc;
  border-radius: 8px;
  color: #3c3;
  text-align: center;
}
</style>
