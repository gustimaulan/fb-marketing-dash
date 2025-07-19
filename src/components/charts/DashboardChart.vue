<template>
  <div class="bg-white w-full rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
    <div class="mb-6">
      <h2 class="text-lg font-medium text-gray-900">Performance Trends</h2>
      <p v-if="statusText" class="text-xs text-gray-500 mt-1">{{ statusText }}</p>
    </div>
    <div class="w-full h-96 flex justify-center items-center">
      <canvas ref="chartRef"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  },
  selectedProducts: {
    type: Array,
    required: true
  },
  productOptions: {
    type: Array,
    required: true
  }
})

const chartRef = ref(null)
let chartInstance = null

const statusText = ref('')

const renderChart = () => {
  if (!chartRef.value || !Object.keys(props.chartData).length) {
    return
  }
  
  // Additional safety check for canvas element
  if (!chartRef.value.getContext) {
    return
  }
  
  // Update status text based on product selection
  if (props.selectedProducts.length === 0) {
    statusText.value = 'No products selected'
  } else if (props.selectedProducts.length === props.productOptions.length) {
    statusText.value = 'Showing trends for all products'
  } else {
    statusText.value = `Showing trends for ${props.selectedProducts.length} of ${props.productOptions.length} selected products`
  }
  
  if (chartInstance) {
    chartInstance.destroy()
  }
  
  const dates = Object.keys(props.chartData).sort()
  
  // Format dates for Jakarta timezone display - safer approach
  const formattedDates = dates.map(dateStr => {
    try {
      // Handle YYYY-MM-DD format properly to avoid timezone issues
      const [year, month, day] = dateStr.split('-')
      
      // Validate date components
      if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) {
        console.warn('Invalid date format:', dateStr)
        return dateStr // Return original string if invalid
      }
      
      // Create date using UTC to avoid timezone issues
      const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)))
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date created:', dateStr)
        return dateStr // Return original string if invalid
      }
      
      return new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        month: 'short',
        day: 'numeric'
      }).format(date)
    } catch (error) {
      console.warn('Error formatting date:', dateStr, error)
      return dateStr // Return original string on error
    }
  })
  
  const spendData = dates.map(date => props.chartData[date].spend)
  const purchaseValueData = dates.map(date => props.chartData[date].purchase_value)
  const conversationsData = dates.map(date => props.chartData[date].conversations)
  const purchasesData = dates.map(date => props.chartData[date].purchases)
  
  const ctx = chartRef.value.getContext('2d')
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: formattedDates,
      datasets: [
        {
          label: 'Spend',
          data: spendData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          yAxisID: 'y'
        },
        {
          label: 'Purchase Value',
          data: purchaseValueData,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          yAxisID: 'y'
        },
        {
          label: 'Conversations',
          data: conversationsData,
          borderColor: 'rgb(139, 92, 246)',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          yAxisID: 'y1'
        },
        {
          label: 'Purchases',
          data: purchasesData,
          borderColor: 'rgb(249, 115, 22)',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Date'
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Currency (IDR)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Count'
          },
          grid: {
            drawOnChartArea: false,
          },
        }
      }
    }
  })
}

watch([() => props.chartData, () => props.selectedProducts], async () => {
  await nextTick()
  renderChart()
}, { deep: true })

onMounted(async () => {
  await nextTick()
  renderChart()
})
</script> 