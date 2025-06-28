<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-medium text-gray-900">Campaign Data</h2>
        
        <!-- Column Management -->
        <div class="relative">
          <button
            @click="showColumnMenu = !showColumnMenu"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Columns
            <svg class="ml-2 -mr-0.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div
            v-if="showColumnMenu"
            @click.stop
            class="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg border border-gray-200 z-10"
          >
            <div class="py-2 max-h-96 overflow-y-auto">
              <div
                v-for="([key, config]) in Object.entries(columnConfig).sort((a, b) => a[1].order - b[1].order)"
                :key="key"
                class="flex items-center justify-between px-4 py-2 hover:bg-gray-50"
              >
                <label class="flex items-center">
                  <input
                    v-model="config.visible"
                    type="checkbox"
                    :disabled="config.fixed"
                    class="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">{{ config.name }}</span>
                </label>
                <div v-if="!config.fixed" class="flex space-x-1">
                  <button
                    @click="$emit('moveColumn', key, 'up')"
                    class="p-1 text-gray-400 hover:text-gray-600"
                    :disabled="isFirstMoveableColumn(key)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    @click="$emit('moveColumn', key, 'down')"
                    class="p-1 text-gray-400 hover:text-gray-600"
                    :disabled="isLastMoveableColumn(key)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="(column, index) in visibleColumns"
              :key="column.key"
              @click="$emit('handleSort', column.key)"
              :class="[
                'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100',
                index === 0 ? 'sticky-column' : ''
              ]"
            >
              <div class="flex items-center">
                {{ column.name }}
                <span
                  :class="[
                    'sort-arrow ml-1 text-gray-400',
                    currentSort.column === column.key ? 'text-rose-600' : '',
                    currentSort.column === column.key && currentSort.direction === 'asc' ? 'asc' : ''
                  ]"
                >
                  ▼
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(row, rowIndex) in sortedData" :key="rowIndex" class="hover:bg-gray-50">
            <td
              v-for="(column, colIndex) in visibleColumns"
              :key="column.key"
              :class="[
                'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
                colIndex === 0 ? 'sticky-column font-medium' : ''
              ]"
            >
              {{ formatValue(row[column.key], column.key) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  sortedData: {
    type: Array,
    required: true
  },
  columnConfig: {
    type: Object,
    required: true
  },
  visibleColumns: {
    type: Array,
    required: true
  },
  currentSort: {
    type: Object,
    required: true
  },
  formatValue: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['handleSort', 'moveColumn'])

const showColumnMenu = ref(false)

// Helper functions to determine if column can be moved
const getMoveableColumns = () => {
  return Object.entries(props.columnConfig)
    .filter(([, config]) => !config.fixed)
    .sort(([, a], [, b]) => a.order - b.order)
}

const isFirstMoveableColumn = (columnKey) => {
  const moveableColumns = getMoveableColumns()
  return moveableColumns.length > 0 && moveableColumns[0][0] === columnKey
}

const isLastMoveableColumn = (columnKey) => {
  const moveableColumns = getMoveableColumns()
  return moveableColumns.length > 0 && moveableColumns[moveableColumns.length - 1][0] === columnKey
}

// Close column menu when clicking outside
const closeColumnMenu = (event) => {
  if (!event.target.closest('.relative')) {
    showColumnMenu.value = false
  }
}

// Add global click listener
document.addEventListener('click', closeColumnMenu)
</script>

<style scoped>
.sticky-column {
  position: sticky;
  left: 0;
  background-color: white;
  z-index: 1;
}

.sort-arrow {
  transition: transform 0.2s;
}

.sort-arrow.asc {
  transform: rotate(180deg);
}
</style> 