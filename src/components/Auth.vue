<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>{{ isLogin ? 'Connexion' : 'Inscription' }}</h1>

      <form @submit.prevent="handleAuth">
        <div class="form-group">
          <label>Nom d'utilisateur</label>
          <input
            type="text"
            v-model="username"
            required
            placeholder="ton_username"
            pattern="[a-zA-Z0-9_-]+"
            title="Lettres, chiffres, tirets et underscores seulement"
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
import bcrypt from 'bcryptjs'

export default {
  name: 'Auth',
  emits: ['authenticated'],
  setup(_props, { emit }) {
    const isLogin = ref(true)
    const username = ref('')
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
          // CONNEXION
          // 1. Chercher l'utilisateur par username
          const { data: users, error: fetchError } = await supabase
            .from('custom_users')
            .select('*')
            .eq('username', username.value)
            .single()

          if (fetchError || !users) {
            throw new Error('Ce compte n\'existe pas. Clique sur "S\'inscrire" pour créer un compte.')
          }

          // 2. Vérifier le mot de passe
          const isPasswordValid = await bcrypt.compare(password.value, users.password_hash)
          if (!isPasswordValid) {
            throw new Error('Mot de passe incorrect')
          }

          // 3. Connecter l'utilisateur
          const user = {
            id: users.id,
            username: users.username
          }

          // Sauvegarder en localStorage pour la persistance
          

          emit('authenticated', user)
        } else {
          // INSCRIPTION
          // 1. Vérifier si le username existe déjà
          const { data: existingUser } = await supabase
            .from('custom_users')
            .select('username')
            .eq('username', username.value)
            .single()

          if (existingUser) {
            throw new Error('Ce nom d\'utilisateur existe déjà')
          }

          // 2. Hasher le mot de passe
          const passwordHash = await bcrypt.hash(password.value, 10)

          // 3. Créer le nouveau compte
          const { data: newUser, error: insertError } = await supabase
            .from('custom_users')
            .insert({
              username: username.value,
              password_hash: passwordHash
            })
            .select()
            .single()

          if (insertError) throw insertError

          success.value = 'Compte créé avec succès!'

          // 4. Connecter automatiquement
          const user = {
            id: newUser.id,
            username: newUser.username
          }

          

          setTimeout(() => {
            emit('authenticated', user)
          }, 1000)
        }
      } catch (err) {
        error.value = err.message || 'Une erreur est survenue'
      } finally {
        loading.value = false
      }
    }

    return {
      isLogin,
      username,
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
  background-size: 200% 200%;
  animation: gradientShift 15s ease infinite;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.auth-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: backgroundMove 20s linear infinite;
  pointer-events: none;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes backgroundMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

.auth-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 50px 45px;
  border-radius: 25px;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.25), 0 10px 25px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 420px;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: cardAppear 0.6s ease-out;
}

@keyframes cardAppear {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.auth-card h1 {
  margin: 0 0 35px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.3px;
}

.form-group input {
  width: 100%;
  padding: 15px 18px;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background: #fafafa;
  font-family: inherit;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.form-group input::placeholder {
  color: #bbb;
}

.btn-primary {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-size: 200% 200%;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-top: 10px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4), 0 4px 10px rgba(118, 75, 162, 0.2);
  background-position: 100% 0;
}

.btn-primary:active:not(:disabled) {
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.toggle-auth {
  text-align: center;
  margin-top: 25px;
  color: #666;
  font-size: 15px;
}

.toggle-auth a {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  cursor: pointer;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
  position: relative;
}

.toggle-auth a:hover {
  opacity: 0.8;
}

.toggle-auth a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.toggle-auth a:hover::after {
  width: 100%;
}

.error-message {
  margin-top: 20px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  border: none;
  border-radius: 12px;
  color: white;
  text-align: center;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.success-message {
  margin-top: 20px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  border: none;
  border-radius: 12px;
  color: white;
  text-align: center;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  animation: successPulse 0.6s ease;
}

@keyframes successPulse {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
