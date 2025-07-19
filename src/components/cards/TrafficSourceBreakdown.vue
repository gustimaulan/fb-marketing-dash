<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Traffic Source Performance</h3>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Traffic Source Chart -->
      <div class="h-64">
        <canvas ref="chartRef"></canvas>
      </div>
      
      <!-- Traffic Source Table -->
      <div class="overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orders
              </th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                AOV
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <template v-for="source in trafficSources" :key="source.source">
              <!-- Main source row -->
              <tr class="hover:bg-gray-50" :class="source.breakdown ? 'cursor-pointer' : ''">
                <td class="px-4 py-3 text-sm">
                  <div class="flex items-center">
                    <div class="w-3 h-3 rounded-full mr-3" :style="{ backgroundColor: getSourceColor(source.source) }"></div>
                    <span class="font-medium">{{ formatSourceName(source.source) }}</span>
                    <span v-if="source.breakdown" class="ml-2 text-xs text-gray-500">
                      ({{ source.breakdown.facebook.orders + source.breakdown.instagram.orders }} total)
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-900 text-right">
                  {{ formatNumber(source.orders) }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-900 text-right">
                  {{ formatCurrency(source.revenue) }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-900 text-right">
                  {{ formatCurrency(source.avgOrderValue) }}
                </td>
              </tr>
              
              <!-- Facebook breakdown rows (always show for Facebook Advertising) -->
              <template v-if="source.breakdown && source.source === 'Facebook Advertising'">
                <tr class="bg-blue-50 text-xs">
                  <td class="px-4 py-2 text-sm">
                    <div class="flex items-center pl-6">
                      <div class="w-2 h-2 rounded-full mr-2" style="background-color: #1877f2;"></div>
                      <span class="text-gray-600">Facebook</span>
                    </div>
                  </td>
                  <td class="px-4 py-2 text-sm text-gray-700 text-right">
                    {{ formatNumber(source.breakdown.facebook.orders) }}
                  </td>
                  <td class="px-4 py-2 text-sm text-gray-700 text-right">
                    {{ formatCurrency(source.breakdown.facebook.revenue) }}
                  </td>
                  <td class="px-4 py-2 text-sm text-gray-700 text-right">
                    {{ source.breakdown.facebook.orders > 0 ? formatCurrency(source.breakdown.facebook.revenue / source.breakdown.facebook.orders) : '-' }}
                  </td>
                </tr>
                <tr class="bg-blue-50 text-xs">
                  <td class="px-4 py-2 text-sm">
                    <div class="flex items-center pl-6">
                      <div class="w-2 h-2 rounded-full mr-2" style="background-color: #E4405F;"></div>
                      <span class="text-gray-600">Instagram</span>
                    </div>
                  </td>
                  <td class="px-4 py-2 text-sm text-gray-700 text-right">
                    {{ formatNumber(source.breakdown.instagram.orders) }}
                  </td>
                  <td class="px-4 py-2 text-sm text-gray-700 text-right">
                    {{ formatCurrency(source.breakdown.instagram.revenue) }}
                  </td>
                  <td class="px-4 py-2 text-sm text-gray-700 text-right">
                    {{ source.breakdown.instagram.orders > 0 ? formatCurrency(source.breakdown.instagram.revenue / source.breakdown.instagram.orders) : '-' }}
                  </td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  trafficSources: {
    type: Array,
    required: true
  },
  formatCurrency: {
    type: Function,
    required: true
  },
  formatNumber: {
    type: Function,
    required: true
  }
})

const chartRef = ref(null)
let chartInstance = null

const sourceColorMap = {
  'Facebook Advertising': '#1877f2',
  'fb_ads': '#1877f2',
  'ig_ads': '#E4405F',
  'Google Maps': '#4285f4',
  'google_maps': '#4285f4',
  'Referral': '#34a853',
  'referral': '#34a853',
  'Loyal': '#fbbc05',
  'loyal': '#fbbc05',
  'Web Paid Ads': '#ea4335',
  'web_paid_ads': '#ea4335',
  'All B2b': '#9c27b0',
  'all_b2b': '#9c27b0',
  'Tiktok Ads': '#000000',
  'tiktok_ads': '#000000',
  'Ig Organic': '#E4405F',
  'ig_organic': '#E4405F',
  'Unknown/Direct': '#6c757d',
  'unknown': '#6c757d',
  'false': '#6c757d'
}

const getSourceColor = (source) => {
  return sourceColorMap[source] || '#6c757d'
}

const formatSourceName = (source) => {
  // Source names are now already formatted from the API
  return source
}

const createChart = () => {
  if (!chartRef.value || !props.trafficSources.length) return

  // Additional safety check for canvas element
  if (!chartRef.value.getContext) {
    console.warn('Canvas ref not ready yet')
    return
  }

  const ctx = chartRef.value.getContext('2d')
  
  // Take top 8 sources for better visibility
  const topSources = props.trafficSources.slice(0, 8)
  
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: topSources.map(s => formatSourceName(s.source)),
      datasets: [{
        data: topSources.map(s => s.revenue),
        backgroundColor: topSources.map(s => getSourceColor(s.source)),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const source = topSources[context.dataIndex]
              return [
                `${context.label}: ${props.formatCurrency(source.revenue)}`,
                `Orders: ${source.orders}`,
                `AOV: ${props.formatCurrency(source.avgOrderValue)}`
              ]
            }
          }
        }
      }
    }
  })
}

onMounted(async () => {
  await nextTick()
  createChart()
})

watch(() => props.trafficSources, async () => {
  if (chartInstance) {
    chartInstance.destroy()
  }
  await nextTick()
  createChart()
}, { deep: true })
</script> 