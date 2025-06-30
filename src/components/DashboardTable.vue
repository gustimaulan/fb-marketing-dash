<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
    <!-- Table Header with Controls -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-900">Campaign Data</h3>
                 <div>
           <!-- Column Visibility Toggle -->
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
                         <div
               v-if="showColumnMenu"
               class="absolute right-0 z-50 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 max-h-80 overflow-y-auto"
             >
              <div class="py-1">
                <div
                  v-for="[key, config] in sortedColumnEntries"
                  :key="key"
                  class="flex items-center px-4 py-2 hover:bg-gray-50"
                  :class="{ 'bg-gray-50': config.fixed }"
                >
                  <input
                    :id="`col-${key}`"
                    type="checkbox"
                    :checked="config.visible"
                    :disabled="config.fixed"
                    @change="toggleColumn(key)"
                    class="mr-3 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label
                    :for="`col-${key}`"
                    class="text-sm flex-1 cursor-pointer"
                    :class="config.fixed ? 'text-gray-400' : 'text-gray-700'"
                  >
                    {{ config.name }}
                  </label>
                  
                  <!-- Column Reorder Buttons -->
                  <div v-if="!config.fixed" class="flex flex-col">
                    <button
                      @click="moveColumn(key, 'up')"
                      :disabled="isFirstMovableColumn(key)"
                      class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="Move up"
                    >
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd"/>
                      </svg>
                    </button>
                    <button
                      @click="moveColumn(key, 'down')"
                      :disabled="isLastMovableColumn(key)"
                      class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="Move down"
                    >
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table Container with Horizontal Scroll -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <!-- Table Header -->
        <thead class="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th
              v-for="(column, index) in visibleColumns"
              :key="column.key"
              @click="handleSort(column.key)"
              :class="[
                'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors',
                index === 0 ? 'sticky left-0 bg-gray-50 z-20' : '',
                column.key !== 'label' ? 'text-right' : ''
              ]"
            >
              <div class="flex items-center justify-between">
                <span>{{ column.name }}</span>
                <div class="flex flex-col ml-1">
                  <svg
                    class="w-3 h-3"
                    :class="getSortIconClass(column.key, 'asc')"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd"/>
                  </svg>
                  <svg
                    class="w-3 h-3 -mt-1"
                    :class="getSortIconClass(column.key, 'desc')"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>
            </th>
          </tr>
        </thead>

        <!-- Table Body with Virtual Scrolling for Large Datasets -->
        <tbody class="bg-white divide-y divide-gray-200">
          <!-- Loading State -->
          <tr v-if="sortedData.length === 0">
            <td :colspan="visibleColumns.length" class="px-6 py-8 text-center text-gray-500">
              <div class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading data...
              </div>
            </td>
          </tr>

          <!-- Data Rows -->
          <tr
            v-for="(row, rowIndex) in paginatedData"
            :key="`${row.label}-${rowIndex}`"
            class="hover:bg-gray-50 transition-colors"
          >
            <td
              v-for="(column, colIndex) in visibleColumns"
              :key="`${row.label}-${column.key}`"
              :class="[
                'px-6 py-4 whitespace-nowrap',
                colIndex === 0 ? 'sticky left-0 bg-white font-medium text-gray-900' : 'text-right text-gray-700',
                column.key === 'label' ? 'text-left' : ''
              ]"
            >
                             {{ formatValue(row[column.key], column.key) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1 && sortedData.length > pageSize" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

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

const emit = defineEmits(['handleSort', 'moveColumn', 'toggleColumn'])

// Local state
const showColumnMenu = ref(false)
const currentPage = ref(1)
const pageSize = ref(50) // Show 50 rows per page

// Computed properties
const sortedColumnEntries = computed(() => {
  return Object.entries(props.columnConfig)
    .sort(([,a], [,b]) => a.order - b.order)
})

const movableColumns = computed(() => {
  return sortedColumnEntries.value.filter(([, config]) => !config.fixed)
})

const totalPages = computed(() => {
  return Math.ceil(props.sortedData.length / pageSize.value)
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return props.sortedData.slice(start, end)
})

const visiblePageNumbers = computed(() => {
  const pages = []
  const totalPagesVal = totalPages.value
  const current = currentPage.value
  
  // Show up to 5 page numbers around current page
  const start = Math.max(1, current - 2)
  const end = Math.min(totalPagesVal, current + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Methods
const handleSort = (column) => {
  emit('handleSort', column)
  currentPage.value = 1 // Reset to first page after sorting
}

const moveColumn = (columnKey, direction) => {
  emit('moveColumn', columnKey, direction)
}

const toggleColumn = (key) => {
  // For now, just emit the event to parent
  emit('toggleColumn', key)
}

const getSortIconClass = (column, direction) => {
  const isActive = props.currentSort.column === column && props.currentSort.direction === direction
  return isActive ? 'text-emerald-600' : 'text-gray-300'
}

const isFirstMovableColumn = (key) => {
  const index = movableColumns.value.findIndex(([k]) => k === key)
  return index === 0
}

const isLastMovableColumn = (key) => {
  const index = movableColumns.value.findIndex(([k]) => k === key)
  return index === movableColumns.value.length - 1
}



// Close dropdown when clicking outside
const closeDropdown = (event) => {
  const dropdown = event.target.closest('[data-dropdown="columns"]')
  if (!dropdown) {
    showColumnMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
/* Ensure sticky column stays in place during horizontal scroll */
.sticky {
  position: sticky;
  left: 0;
  z-index: 10;
}

/* Smooth scrolling for table */
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