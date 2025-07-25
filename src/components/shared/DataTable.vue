<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
    <!-- Table Header -->
    <div v-if="title || $slots.header" class="px-6 py-4 border-b border-gray-200">
      <div class="flex justify-between items-center">
        <h3 v-if="title" class="text-lg font-medium text-gray-900">{{ title }}</h3>
        <slot name="header" />
        
        <!-- Column Controls (if advanced features enabled) -->
        <div v-if="showColumnControls">
          <div class="relative" data-dropdown="columns">
            <button
              @click="showColumnMenu = !showColumnMenu"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              Columns
            </button>
            
            <!-- Column Menu Dropdown -->
            <div v-if="showColumnMenu" class="absolute right-0 z-50 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 max-h-80 overflow-y-auto">
              <div class="py-1">
                <div v-for="column in columns" :key="column.key" class="flex items-center px-4 py-2 hover:bg-gray-50">
                  <input
                    :id="`col-${column.key}`"
                    type="checkbox"
                    :checked="column.visible !== false"
                    :disabled="column.fixed"
                    @change="toggleColumn(column.key)"
                    class="mr-3 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label :for="`col-${column.key}`" class="text-sm flex-1 cursor-pointer" :class="column.fixed ? 'text-gray-400' : 'text-gray-700'">
                    {{ column.label }}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table Container -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <!-- Table Header -->
        <thead class="bg-gray-50" :class="{ 'sticky top-0 z-10': stickyHeader }">
          <tr>
            <th
              v-for="(column, index) in visibleColumns"
              :key="column.key"
              @click="column.sortable !== false ? handleSort(column.key) : null"
              :class="[
                'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider',
                column.sortable !== false ? 'cursor-pointer hover:bg-gray-100 transition-colors' : '',
                column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left',
                index === 0 && stickyFirstColumn ? 'sticky left-0 bg-gray-50 z-20' : ''
              ]"
            >
              <div class="flex items-center" :class="column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : 'justify-between'">
                <span>{{ column.label }}</span>
                <div v-if="column.sortable !== false" class="flex flex-col ml-1">
                  <svg class="w-3 h-3" :class="getSortIconClass(column.key, 'asc')" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd"/>
                  </svg>
                  <svg class="w-3 h-3 -mt-1" :class="getSortIconClass(column.key, 'desc')" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>
            </th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody class="bg-white divide-y divide-gray-200">
          <!-- Loading State -->
          <tr v-if="loading">
            <td :colspan="visibleColumns.length" class="px-6 py-8 text-center text-gray-500">
              <div class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ loadingText || 'Loading data...' }}
              </div>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-else-if="!data || data.length === 0">
            <td :colspan="visibleColumns.length" class="px-6 py-8 text-center text-gray-500">
              <slot name="empty">
                <div class="text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 class="mt-2 text-sm font-medium text-gray-900">{{ emptyTitle || 'No data available' }}</h3>
                  <p class="mt-1 text-sm text-gray-500">{{ emptyMessage || 'No data found for the selected criteria.' }}</p>
                </div>
              </slot>
            </td>
          </tr>

          <!-- Data Rows -->
          <tr
            v-for="(row, rowIndex) in paginatedData"
            :key="getRowKey(row, rowIndex)"
            class="hover:bg-gray-50 transition-colors"
            :class="rowClass"
            @click="$emit('rowClick', row, rowIndex)"
          >
            <td
              v-for="(column, colIndex) in visibleColumns"
              :key="`${getRowKey(row, rowIndex)}-${column.key}`"
              :class="[
                'px-6 py-4 whitespace-nowrap',
                colIndex === 0 && stickyFirstColumn ? 'sticky left-0 bg-white' : '',
                column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left',
                column.cellClass || 'text-gray-700'
              ]"
            >
              <slot :name="`cell-${column.key}`" :row="row" :value="getValue(row, column.key)" :column="column" :index="rowIndex">
                {{ formatCellValue(getValue(row, column.key), column) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="showPagination && totalPages > 1" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, sortedData.length) }} of {{ sortedData.length }} results
      </div>
      <div class="flex items-center space-x-2">
        <button
          @click="currentPage--"
          :disabled="currentPage <= 1"
          class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <div class="flex space-x-1">
          <button
            v-for="page in visiblePageNumbers"
            :key="page"
            @click="currentPage = page"
            :class="[
              'px-3 py-2 text-sm font-medium rounded-md',
              page === currentPage
                ? 'bg-emerald-600 text-white'
                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
            ]"
          >
            {{ page }}
          </button>
        </div>
        
        <button
          @click="currentPage++"
          :disabled="currentPage >= totalPages"
          class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  // Data
  data: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    required: true
  },
  
  // Table Configuration
  title: {
    type: String,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: 'Loading data...'
  },
  emptyTitle: {
    type: String,
    default: 'No data available'
  },
  emptyMessage: {
    type: String,
    default: 'No data found for the selected criteria.'
  },
  
  // Features
  showColumnControls: {
    type: Boolean,
    default: false
  },
  showPagination: {
    type: Boolean,
    default: true
  },
  stickyHeader: {
    type: Boolean,
    default: true
  },
  stickyFirstColumn: {
    type: Boolean,
    default: false
  },
  
  // Pagination
  pageSize: {
    type: Number,
    default: 50
  },
  
  // Styling
  rowClass: {
    type: String,
    default: ''
  },
  
  // Row identification
  rowKey: {
    type: [String, Function],
    default: null
  }
})

const emit = defineEmits(['sort', 'columnToggle', 'rowClick'])

// Local state
const showColumnMenu = ref(false)
const currentPage = ref(1)
const currentSort = ref({ column: null, direction: null })

// Computed properties
const visibleColumns = computed(() => {
  return props.columns.filter(col => col.visible !== false)
})

const sortedData = computed(() => {
  if (!currentSort.value.column || !props.data) return props.data
  
  const column = props.columns.find(col => col.key === currentSort.value.column)
  if (!column) return props.data
  
  return [...props.data].sort((a, b) => {
    const aVal = getValue(a, column.key)
    const bVal = getValue(b, column.key)
    
    // Handle custom sort function
    if (column.sortFn) {
      return currentSort.value.direction === 'asc' 
        ? column.sortFn(aVal, bVal, a, b)
        : column.sortFn(bVal, aVal, b, a)
    }
    
    // Default sorting
    if (aVal < bVal) return currentSort.value.direction === 'asc' ? -1 : 1
    if (aVal > bVal) return currentSort.value.direction === 'asc' ? 1 : -1
    return 0
  })
})

const totalPages = computed(() => {
  return Math.ceil(sortedData.value.length / props.pageSize)
})

const paginatedData = computed(() => {
  if (!props.showPagination) return sortedData.value
  
  const start = (currentPage.value - 1) * props.pageSize
  const end = start + props.pageSize
  return sortedData.value.slice(start, end)
})

const visiblePageNumbers = computed(() => {
  const pages = []
  const totalPagesVal = totalPages.value
  const current = currentPage.value
  
  const start = Math.max(1, current - 2)
  const end = Math.min(totalPagesVal, current + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Methods
const handleSort = (columnKey) => {
  if (currentSort.value.column === columnKey) {
    currentSort.value.direction = currentSort.value.direction === 'asc' ? 'desc' : 'asc'
  } else {
    currentSort.value.column = columnKey
    currentSort.value.direction = 'asc'
  }
  
  currentPage.value = 1
  emit('sort', { column: columnKey, direction: currentSort.value.direction })
}

const toggleColumn = (columnKey) => {
  emit('columnToggle', columnKey)
}

const getSortIconClass = (column, direction) => {
  const isActive = currentSort.value.column === column && currentSort.value.direction === direction
  return isActive ? 'text-emerald-600' : 'text-gray-300'
}

const getValue = (row, key) => {
  return key.split('.').reduce((obj, k) => obj?.[k], row)
}

const getRowKey = (row, index) => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row, index)
  }
  if (typeof props.rowKey === 'string') {
    return getValue(row, props.rowKey)
  }
  return index
}

const formatCellValue = (value, column) => {
  if (column.formatter && typeof column.formatter === 'function') {
    return column.formatter(value)
  }
  return value
}

// Watch for data changes to reset pagination
watch(() => props.data, () => {
  currentPage.value = 1
})
</script>

<style scoped>
.sticky {
  position: sticky;
  left: 0;
  z-index: 10;
}

.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f7fafc;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background-color: #a0aec0;
}
</style>