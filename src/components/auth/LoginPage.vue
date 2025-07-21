<template>
  <div class="min-h-screen bg-white flex items-center justify-center p-4">
    <div class="w-full max-w-sm border border-gray-300 rounded-lg p-8 shadow-md">
      <!-- Title -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-semibold text-gray-900">Meta Marketing Dashboard</h1>
        <p class="text-sm text-gray-500">
          Login using your odoo account
        </p>
      </div>
      
      <!-- Simple Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <!-- Email Field -->
        <div>
          <input
            ref="emailInput"
            v-model="email"
            type="email"
            placeholder="Email"
            required
            :disabled="isLoading"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200"
            @keydown.enter="focusPassword"
          />
        </div>

        <!-- Password Field -->
        <div>
          <input
            ref="passwordInput"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Password"
            required
            :disabled="isLoading"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200"
            @keydown.enter="handleLogin"
          />
        </div>

        <!-- Show/Hide Password Toggle -->
        <div class="flex justify-end">
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="text-sm text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200"
          >
            {{ showPassword ? 'Hide' : 'Show' }}
          </button>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="text-sm text-red-600 text-center bg-red-50 px-3 py-2 rounded-lg">
          {{ error }}
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isLoading || !email.trim() || !password.trim()"
          class="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
        >
          <span v-if="isLoading" class="inline-flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </span>
          <span v-else>Sign in</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../../stores/auth.js'

// Reactive data
const email = ref('')
const password = ref('')
const showPassword = ref(false)

// Template refs
const emailInput = ref(null)
const passwordInput = ref(null)

// Use auth store
const authStore = useAuthStore()
const { isLoading, error } = storeToRefs(authStore)

// Computed properties
const isFormValid = computed(() => email.value && password.value)

// Methods
const handleLogin = async () => {
  if (!isFormValid.value) return
  
  const result = await authStore.login(email.value, password.value)
  
  if (result.success) {
    // Login successful - the auth store will handle the redirect
    console.log('Login successful')
  } else {
    // Error is already set in the store
    console.error('Login failed:', result.error)
  }
}

const focusPassword = () => {
  if (passwordInput.value) {
    passwordInput.value.focus()
  }
}

// Watch for error changes to clear form on success
watch(() => authStore.isAuthenticated, (isAuth) => {
  if (isAuth) {
    // Clear form on successful login
    email.value = ''
    password.value = ''
    showPassword.value = false
  }
})

// Clear error when user starts typing
watch([email, password], () => {
  if (error.value) {
    authStore.clearError()
  }
})

// Auto-focus email input on mount
onMounted(() => {
  if (emailInput.value) {
    emailInput.value.focus()
  }
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style> 