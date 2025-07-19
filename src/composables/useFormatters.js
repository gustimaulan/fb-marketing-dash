import { useUtilsStore } from '../stores/utils.js'

export function useFormatters() {
  const utilsStore = useUtilsStore()
  
  const {
    formatCurrency,
    formatNumber,
    formatDate,
    formatPercentage,
    formatValue
  } = utilsStore

  return {
    formatCurrency,
    formatNumber,
    formatDate,
    formatPercentage,
    formatValue
  }
} 