<template>
  <div class="relative inline-block">
    <div 
      @mouseenter="showTooltip = true" 
      @mouseleave="showTooltip = false"
      @click="showTooltip = !showTooltip"
      class="cursor-help inline-flex items-center"
    >
      <slot name="trigger">
        <div class="w-5 h-5 ml-1 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110">
          <svg class="w-3 h-3 text-blue-600 hover:text-blue-700" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
          </svg>
        </div>
      </slot>
    </div>
    
    <!-- Tooltip Content -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 scale-95 translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-2"
    >
      <div
        v-show="showTooltip"
        :class="[
          'absolute z-[9999] px-4 py-3 text-sm bg-black text-white rounded-lg shadow-2xl max-w-sm border border-gray-600',
          positionClass
        ]"
        style="background-color: rgba(0, 0, 0, 0.95); backdrop-filter: blur(4px);"
      >
        <!-- Arrow -->
        <div 
          :class="[
            'absolute w-3 h-3 transform rotate-45 border border-gray-600',
            arrowClass
          ]"
          style="background-color: rgba(0, 0, 0, 0.95);"
        ></div>
        
        <!-- Content -->
        <div class="relative z-10">
          <div v-if="title" class="font-bold mb-2 text-white text-base">{{ title }}</div>
          <div class="text-gray-100 leading-relaxed">{{ content }}</div>
          <div v-if="example" class="text-sm text-yellow-200 mt-2 border-t border-gray-600 pt-2">
            <span class="font-semibold">💡 Contoh:</span> {{ example }}
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    required: true
  },
  example: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    default: 'top',
    validator: (value) => ['top', 'bottom', 'left', 'right'].includes(value)
  }
})

const showTooltip = ref(false)

const positionClass = computed(() => {
  switch (props.position) {
    case 'bottom':
      return 'top-full left-1/2 transform -translate-x-1/2 mt-2'
    case 'left':
      return 'right-full top-1/2 transform -translate-y-1/2 mr-2'
    case 'right':
      return 'left-full top-1/2 transform -translate-y-1/2 ml-2'
    case 'top':
    default:
      return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
  }
})

const arrowClass = computed(() => {
  switch (props.position) {
    case 'bottom':
      return '-top-1.5 left-1/2 transform -translate-x-1/2'
    case 'left':
      return 'top-1/2 -right-1.5 transform -translate-y-1/2'
    case 'right':
      return 'top-1/2 -left-1.5 transform -translate-y-1/2'
    case 'top':
    default:
      return '-bottom-1.5 left-1/2 transform -translate-x-1/2'
  }
})

// Close tooltip when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    showTooltip.value = false
  }
}

// Add event listener when tooltip is shown
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Custom tooltip styles */
</style> 