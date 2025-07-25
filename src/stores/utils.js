import { defineStore } from 'pinia'

export const useUtilsStore = defineStore('utils', () => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      timeZone: 'Asia/Jakarta'
    }).format(value)
  }

  const formatNumber = (value, decimals = 0) => {
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      timeZone: 'Asia/Jakarta'
    }).format(value)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString))
  }

  const formatPercentage = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '0%'
    return `${(value * 100).toFixed(1)}%`
  }

  const formatValue = (value, column) => {
    if (value === null || value === undefined) return '-'
    
    switch (column) {
      case 'spend':
      case 'cost_per_conversation':
      case 'purchase_value':
      case 'cost_per_add_to_cart':
      case 'cost_per_purchase':
        return formatCurrency(value)
      case 'frequency':
      case 'cpm':
      case 'ctr':
      case 'roas':
        return formatNumber(value, 2)
      case 'reach':
      case 'impressions':
      case 'conversations':
      case 'purchases':
      case 'add_to_cart':
        return formatNumber(value)
      case 'label':
        // Check if the label is a date (when grouped by date)
        if (typeof value === 'string') {
          // Handle ISO date format (2025-07-19T00:00:00.000Z)
          if (value.includes('T') && value.includes('Z')) {
            const date = new Date(value)
            if (!isNaN(date.getTime())) {
              return date.toISOString().split('T')[0] // Return yyyy-mm-dd
            }
          }
          // Handle simple yyyy-mm-dd format
          if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return value
          }
        }
        return value
      default:
        return value
    }
  }

  return {
    formatCurrency,
    formatNumber,
    formatDate,
    formatPercentage,
    formatValue
  }
}) 