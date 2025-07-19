<template>
  <div class="space-y-3">
    <!-- Label -->
    <label class="block text-sm font-medium text-gray-700">Date Range</label>
    
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <!-- Date Range Dropdown -->
      <div class="relative flex-1 max-w-xs" data-dropdown="date-range">
        <button
          @click="showDropdown = !showDropdown"
          class="w-full px-3 py-2 text-sm font-medium rounded-md transition-colors bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-between"
        >
          <span>{{ getCurrentDateRangeLabel() }}</span>
          <svg class="w-4 h-4 ml-2 transition-transform" :class="{ 'rotate-180': showDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div
          v-if="showDropdown"
          class="absolute z-20 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-64 overflow-y-auto"
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
      <div v-if="dateRange === 'custom'" class="flex items-center gap-2 min-w-0 p-3 bg-emerald-50 border border-emerald-200 rounded-md">
        <div class="flex-1 min-w-0">
          <label class="block text-xs font-medium text-emerald-700 mb-1">From</label>
          <input
            :value="startDate"
            type="date"
            class="block w-full rounded-md border-emerald-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm bg-white"
            @change="handleStartDateChange"
            aria-label="Start date"
          />
        </div>
        <div class="flex-1 min-w-0">
          <label class="block text-xs font-medium text-emerald-700 mb-1">To</label>
          <input
            :value="endDate"
            type="date"
            class="block w-full rounded-md border-emerald-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm bg-white"
            @change="handleEndDateChange"
            aria-label="End date"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

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

const emit = defineEmits(['selectDateRange', 'update:startDate', 'update:endDate', 'customDateChange', 'setCustomDateRange'])

const showDropdown = ref(false)

const dateRanges = [
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'last7days', label: 'Last 7 days' },
  { key: 'last30days', label: 'Last 30 days' },
  { key: 'thisweek', label: 'This week' },
  { key: 'lastweek', label: 'Last week' },
  { key: 'thismonth', label: 'This month' },
  { key: 'lastmonth', label: 'Last month' },
  { key: 'custom', label: 'Custom Range' }
]

const getCurrentDateRangeLabel = () => {
  const rangeLabels = {
    'yesterday': 'Yesterday',
    'last7days': 'Last 7 days',
    'last30days': 'Last 30 days',
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
  const newStartDate = event.target.value
  emit('update:startDate', newStartDate)
  emit('setCustomDateRange', newStartDate, props.endDate)
  emit('customDateChange')
}

const handleEndDateChange = (event) => {
  const newEndDate = event.target.value
  emit('update:endDate', newEndDate)
  emit('setCustomDateRange', props.startDate, newEndDate)
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