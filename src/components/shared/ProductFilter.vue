<template>
  <div class="space-y-1">
    <!-- Label -->
    <label class="block text-sm font-medium text-gray-700">Product Filter</label>
    
    <div class="relative">
      <button
        @click="showMenu = !showMenu"
        class="w-full px-3 py-2 text-sm font-medium rounded-md transition-colors bg-purple-600 text-white hover:bg-purple-700 flex items-center justify-between min-w-0"
      >
        <span class="truncate">
          Product Filter
          <span v-if="appliedProducts.length > 0" class="text-purple-200 ml-1">
            ({{ appliedProducts.length }})
          </span>
          <span v-if="hasUnappliedChanges" class="text-yellow-300 ml-1">*</span>
        </span>
        <svg class="w-4 h-4 ml-2 flex-shrink-0 transition-transform" :class="{ 'rotate-180': showMenu }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div
        v-if="showMenu"
        @click.stop
        class="absolute z-20 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-96 overflow-hidden"
        style="min-width: 280px;"
      >
        <!-- Filter Header -->
        <div class="p-4 border-b border-gray-200 bg-gray-50">
          <div class="space-y-3">
            <div>
              <h4 class="font-medium text-gray-900">Select Products</h4>
              <p class="text-xs text-gray-500 mt-1">
                {{ tempSelectedProducts.length === productOptions.length ? 'All products selected' : `${tempSelectedProducts.length} of ${productOptions.length} selected` }}
              </p>
            </div>
            
            <div class="flex space-x-2">
              <button
                @click="selectAll"
                class="flex-1 text-xs px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors font-medium"
              >
                Select All
              </button>
              <button
                @click="clearAll"
                class="flex-1 text-xs px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
        
        <!-- Product List -->
        <div class="max-h-48 overflow-y-auto">
          <div class="p-2">
            <label
              v-for="product in productOptions"
              :key="product"
              class="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                :checked="tempSelectedProducts.includes(product)"
                @change="toggleProduct(product, $event)"
                class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <span class="ml-3 text-sm text-gray-700 flex-1 min-w-0 truncate" :title="product">{{ product }}</span>
            </label>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="p-3 border-t border-gray-200 bg-gray-50 flex justify-end space-x-2">
          <button
            @click="cancelChanges"
            class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="applyFilter"
            :disabled="!hasUnappliedChanges"
            :class="[
              'px-3 py-2 text-sm font-medium rounded-md transition-colors',
              hasUnappliedChanges
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            ]"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

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

const toggleProduct = (product, event) => {
  if (event.target.checked) {
    tempSelectedProducts.value.push(product)
  } else {
    tempSelectedProducts.value = tempSelectedProducts.value.filter(p => p !== product)
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