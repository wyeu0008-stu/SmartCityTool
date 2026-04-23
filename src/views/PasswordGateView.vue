<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ACCESS_PASSWORD, grantPasswordAccess } from '../auth/passwordAccess'

const props = defineProps({
  target: {
    type: String,
    required: true
  },
  redirectTo: {
    type: String,
    required: true
  }
})

const router = useRouter()
const password = ref('')
const error = ref('')

const environmentLabel = computed(() => {
  return props.target === 'dev' ? 'Development Environment' : 'Old Version'
})

function submitPassword() {
  if (password.value === ACCESS_PASSWORD) {
    grantPasswordAccess(props.target)
    router.replace(props.redirectTo)
    return
  }

  error.value = 'Incorrect password. Please try again.'
  password.value = ''
}
</script>

<template>
  <main class="password-page">
    <section class="password-panel" aria-labelledby="password-title">
      <p class="eyebrow">Protected Area</p>
      <h1 id="password-title">{{ environmentLabel }}</h1>
      <p class="intro">Enter the access password to continue.</p>

      <form class="password-form" @submit.prevent="submitPassword">
        <label for="access-password">Password</label>
        <input
          id="access-password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          autofocus
        />
        <p v-if="error" class="error-message" role="alert">{{ error }}</p>
        <button type="submit">Enter</button>
      </form>
    </section>
  </main>
</template>

<style scoped>
.password-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: linear-gradient(180deg, #f7fbff 0%, #eef5f1 100%);
}

.password-panel {
  width: min(100%, 420px);
  padding: 32px;
  border: 1px solid #dfe8f5;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 18px 40px rgba(43, 77, 130, 0.12);
}

.eyebrow {
  margin: 0 0 10px;
  color: #2f6f4f;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: #1f2d3d;
  font-size: 2rem;
}

.intro {
  margin: 12px 0 24px;
  color: #5a6b7b;
}

.password-form {
  display: grid;
  gap: 10px;
}

label {
  color: #334960;
  font-weight: 700;
}

input {
  width: 100%;
  min-height: 46px;
  padding: 10px 12px;
  border: 1px solid #cfd9e5;
  border-radius: 8px;
  color: #1f2d3d;
}

input:focus {
  outline: 3px solid rgba(47, 111, 79, 0.18);
  border-color: #2f6f4f;
}

.error-message {
  margin: 2px 0;
  color: #c34f4f;
}

button {
  min-height: 46px;
  margin-top: 8px;
  border: none;
  border-radius: 8px;
  background: #2f6f4f;
  color: #ffffff;
  font-weight: 800;
  cursor: pointer;
}
</style>
