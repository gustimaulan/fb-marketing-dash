<template>
  <div class="flex items-center gap-2 flex-wrap">
    <!-- Date Range Dropdown -->
    <div class="relative" data-dropdown="date-range">
      <button
        @click="showDropdown = !showDropdown"
        class="w-full px-3 py-2 text-sm font-medium rounded-md transition-colors bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-between"
      >
        <span>{{ getCurrentDateRangeLabel() }}</span>
        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div
        v-if="showDropdown"
        class="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200"
      >
        <div class="py-1">
          <button
            v-for="range in dateRanges"
            :key="range.key"
            @click="selectRange(range.key, $event)"
            :class="[
              'block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors',
              dateRange === range.key
                ? 'bg-emerald-50 text-emerald-700 font-medium'
                : 'text-gray-700'
            ]"
          >
            {{ range.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Custom Date Range Inputs -->
    <div class="flex items-center gap-2">
      <input
        :value="startDate"
        type="date"
        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
        @change="handleStartDateChange"
      />
      <span class="text-gray-500">to</span>
      <input
        :value="endDate"
        type="date"
        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
        @change="handleEndDateChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  dateRange: {
    type: String,
    required: true
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['selectDateRange', 'update:startDate', 'update:endDate', 'customDateChange'])

const showDropdown = ref(false)

const dateRanges = [
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'last7days', label: 'Last 7 days' },
  { key: 'thisweek', label: 'This week' },
  { key: 'lastweek', label: 'Last week' },
  { key: 'thismonth', label: 'This month' },
  { key: 'lastmonth', label: 'Last month' }
]

const getCurrentDateRangeLabel = () => {
  const rangeLabels = {
    'yesterday': 'Yesterday',
    'last7days': 'Last 7 days',
    'thisweek': 'This week',
    'lastweek': 'Last week',
    'thismonth': 'This month',
    'lastmonth': 'Last month',
    'custom': 'Custom Range'
  }
  return rangeLabels[props.dateRange] || 'Select Date Range'
}

const selectRange = (rangeKey, event) => {
  console.log('DateRangePicker: selectRange called with:', rangeKey)
  event?.stopPropagation()
  emit('selectDateRange', rangeKey)
  showDropdown.value = false
}

const handleStartDateChange = (event) => {
  emit('update:startDate', event.target.value)
  emit('customDateChange')
}

const handleEndDateChange = (event) => {
  emit('update:endDate', event.target.value)
  emit('customDateChange')
}

// Close dropdown when clicking outside
const closeDropdown = (event) => {
  // Check if click is inside the dropdown component
  const dropdown = event.target.closest('[data-dropdown="date-range"]')
  if (!dropdown) {
    showDropdown.value = false
  }
}

// Lifecycle hooks for proper event listener management
onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdown)
})
</script> 