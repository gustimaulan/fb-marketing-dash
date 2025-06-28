<template>
  <div class="relative">
    <button
      @click="showMenu = !showMenu"
      class="w-full px-3 py-2 text-sm font-medium rounded-md transition-colors bg-purple-600 text-white hover:bg-purple-700 flex items-center justify-between"
    >
      <span>
        Product Filter
        <span v-if="appliedProducts.length > 0" class="text-purple-200">
          ({{ appliedProducts.length }})
        </span>
        <span v-if="hasUnappliedChanges" class="text-yellow-300 ml-1">*</span>
      </span>
      <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    
    <div
      v-if="showMenu"
      @click.stop
      class="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-96 overflow-hidden"
    >
      <div class="p-3 border-b border-gray-200">
        <div class="flex flex-col items-center justify-start mb-2">
          <h4 class="font-medium text-left text-gray-900">Select Products</h4>
          <p class="text-xs text-left text-gray-500">
            {{ tempSelectedProducts.length === productOptions.length ? 'All products selected' : `${tempSelectedProducts.length} of ${productOptions.length} selected` }}
          </p>
          <div class="flex w-full justify-start space-x-2 mt-2">
            <button
              @click="selectAll"
              class="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
            >
              All
            </button>
            <button
              @click="clearAll"
              class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
            Clear
            </button>
          </div>
        </div>
      </div>
      
      <div class="max-h-48 overflow-y-auto">
        <label
          v-for="product in productOptions"
          :key="product"
          class="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
        >
          <input
            type="checkbox"
            :checked="tempSelectedProducts.includes(product)"
            @change="toggleTempProduct(product)"
            class="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-3"
          />
          <span class="text-sm text-gray-700">{{ product }}</span>
        </label>
      </div>
      
      <div class="p-3 border-t border-gray-200 bg-gray-50">
        <div class="flex space-x-2">
          <button
            @click="applyFilter"
            :disabled="tempSelectedProducts.length === 0"
            class="flex-1 px-3 py-2 text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Apply Filter
          </button>
          <button
            @click="cancelChanges"
            class="px-3 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
        <p v-if="tempSelectedProducts.length === 0" class="text-xs text-red-500 mt-1">
          At least one product must be selected
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
  selectedProducts: {
    type: Array,
    required: true
  },
  productOptions: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['applyFilter'])

const showMenu = ref(false)
const tempSelectedProducts = ref([])
const appliedProducts = ref([])

// Initialize temp selection with current applied selection
watch(() => props.selectedProducts, (newVal) => {
  appliedProducts.value = [...newVal]
  tempSelectedProducts.value = [...newVal]
}, { immediate: true })

// Check if there are unapplied changes
const hasUnappliedChanges = computed(() => {
  if (tempSelectedProducts.value.length !== appliedProducts.value.length) return true
  return !tempSelectedProducts.value.every(product => appliedProducts.value.includes(product))
})

const toggleTempProduct = (product) => {
  const index = tempSelectedProducts.value.indexOf(product)
  if (index === -1) {
    tempSelectedProducts.value.push(product)
  } else {
    tempSelectedProducts.value.splice(index, 1)
  }
}

const selectAll = () => {
  tempSelectedProducts.value = [...props.productOptions]
}

const clearAll = () => {
  tempSelectedProducts.value = []
}

const applyFilter = () => {
  if (tempSelectedProducts.value.length === 0) return
  
  appliedProducts.value = [...tempSelectedProducts.value]
  emit('applyFilter', [...tempSelectedProducts.value])
  showMenu.value = false
}

const cancelChanges = () => {
  tempSelectedProducts.value = [...appliedProducts.value]
  showMenu.value = false
}

// Close menu when clicking outside
const closeMenu = (event) => {
  if (!event.target.closest('.relative')) {
    // Reset temp selection to applied selection when closing without applying
    tempSelectedProducts.value = [...appliedProducts.value]
    showMenu.value = false
  }
}

// Add global click listener
document.addEventListener('click', closeMenu)
</script> 