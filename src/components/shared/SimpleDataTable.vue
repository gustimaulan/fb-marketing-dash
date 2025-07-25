<template>
  <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <h3 v-if="title" class="text-xl font-bold text-gray-900 mb-6">{{ title }}</h3>
    
    <DataTable
      :data="data"
      :columns="columns"
      :loading="loading"
      :empty-title="emptyTitle"
      :empty-message="emptyMessage"
      :show-pagination="showPagination"
      :show-column-controls="false"
      :sticky-header="false"
      :page-size="pageSize"
      @row-click="$emit('rowClick', $event)"
    >
      <template v-for="(_, slot) in $slots" #[slot]="scope">
        <slot :name="slot" v-bind="scope" />
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import DataTable from './DataTable.vue'

defineProps({
  title: String,
  data: Array,
  columns: Array,
  loading: Boolean,
  emptyTitle: String,
  emptyMessage: String,
  showPagination: { type: Boolean, default: false },
  pageSize: { type: Number, default: 10 }
})

defineEmits(['rowClick'])
</script>