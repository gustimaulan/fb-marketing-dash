<template>
  <div class="p-3 rounded-lg" :class="bgColor">
    <div class="flex justify-between items-center">
      <div>
        <div class="font-medium" :class="titleColor">{{ title }}</div>
        <div v-if="subtitle" class="text-sm mt-1" :class="subtitleColor">{{ subtitle }}</div>
      </div>
      <div class="text-right">
        <div class="font-bold" :class="valueColor">{{ formattedValue }}</div>
        <div v-if="secondaryValue" class="text-sm mt-1" :class="subtitleColor">
          {{ secondaryValue }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  valueType: {
    type: String,
    default: 'text',
    validator: (value) => ['currency', 'number', 'percentage', 'text'].includes(value)
  },
  subtitle: {
    type: String,
    default: null
  },
  secondaryValue: {
    type: String,
    default: null
  },
  colorScheme: {
    type: String,
    default: 'blue',
    validator: (value) => ['blue', 'green', 'purple', 'orange', 'red', 'gray'].includes(value)
  },
  formatCurrency: {
    type: Function,
    default: (val) => `$${val}`
  },
  formatNumber: {
    type: Function,
    default: (val) => val.toString()
  },
  formatPercentage: {
    type: Function,
    default: (val) => `${val}%`
  }
})

const colorSchemes = {
  blue: {
    bg: 'bg-blue-50 border border-blue-100',
    title: 'text-blue-900',
    value: 'text-blue-900',
    subtitle: 'text-blue-700'
  },
  green: {
    bg: 'bg-green-50 border border-green-100',
    title: 'text-green-900',
    value: 'text-green-900',
    subtitle: 'text-green-700'
  },
  purple: {
    bg: 'bg-purple-50 border border-purple-100',
    title: 'text-purple-900',
    value: 'text-purple-900',
    subtitle: 'text-purple-700'
  },
  orange: {
    bg: 'bg-orange-50 border border-orange-100',
    title: 'text-orange-900',
    value: 'text-orange-900',
    subtitle: 'text-orange-700'
  },
  red: {
    bg: 'bg-red-50 border border-red-100',
    title: 'text-red-900',
    value: 'text-red-900',
    subtitle: 'text-red-700'
  },
  gray: {
    bg: 'bg-gray-50 border border-gray-100',
    title: 'text-gray-900',
    value: 'text-gray-900',
    subtitle: 'text-gray-700'
  }
}

const bgColor = computed(() => colorSchemes[props.colorScheme].bg)
const titleColor = computed(() => colorSchemes[props.colorScheme].title)
const valueColor = computed(() => colorSchemes[props.colorScheme].value)
const subtitleColor = computed(() => colorSchemes[props.colorScheme].subtitle)

const formattedValue = computed(() => {
  if (props.value === null || props.value === undefined) return '-'
  
  switch (props.valueType) {
    case 'currency':
      return props.formatCurrency(props.value)
    case 'number':
      return props.formatNumber(props.value)
    case 'percentage':
      return props.formatPercentage(props.value)
    default:
      return props.value.toString()
  }
})
</script>