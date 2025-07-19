# Frontend Code Organization Guide

## 🎯 New Structure Overview

### **Composables** (`/src/composables/`)
Reusable reactive logic across components:

```js
// Before: Importing utils in every component
import { useUtilsStore } from './stores/utils.js'
const utilsStore = useUtilsStore()
const { formatCurrency, formatNumber } = utilsStore

// After: Using composables  
import { useFormatters } from '@/composables/useFormatters'
const { formatCurrency, formatNumber } = useFormatters()
```

### **Configuration** (`/src/config/`)
Centralized app configuration:

```js
import { config } from '@/config'

// Environment-aware settings
const apiTimeout = config.api.timeout
const isDev = config.isDev
```

### **Constants** (`/src/constants/`)
Single source of truth for app constants:

```js
import { DASHBOARD_TABS, CHART_COLORS } from '@/constants'

const activeTab = ref(DASHBOARD_TABS.OVERVIEW)
```

### **Enhanced Path Aliases**
Cleaner imports with specific aliases:

```js
// Before
import Component from '../../components/shared/Component.vue'

// After  
import Component from '@/components/shared/Component.vue'
// or even better
import Component from '@/components/shared/Component.vue'
```

## 🚀 Usage Examples

### **1. Component with Best Practices**

```vue
<script setup>
import { ref } from 'vue'
import { useFormatters } from '@/composables/useFormatters'
import { useComponent } from '@/composables/useComponent'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { DASHBOARD_TABS } from '@/constants'
import { config } from '@/config'

const props = defineProps({
  data: { type: Array, required: true }
})

// Use composables for common functionality
const { formatCurrency, formatNumber } = useFormatters()
const { withErrorHandling } = useComponent('MyComponent', props)
const { error, handleAsyncOperation } = useErrorHandler()

// Async operations with proper error handling
const loadData = () => {
  return handleAsyncOperation(async () => {
    // Your async logic here
    const response = await fetchData()
    return response
  }, 'loadData')
}
</script>
```

### **2. Consistent Error Handling**

```js
import { useErrorHandler } from '@/composables/useErrorHandler'

const { error, handleAsyncOperation } = useErrorHandler()

// Automatic error handling with context
await handleAsyncOperation(
  () => fetchData(),
  'DashboardData'
)
```

### **3. Centralized Logging**

```js
import { logger } from '@/utils/logger'

// Performance tracking
logger.startTimer('dataProcessing')
processData()
logger.endTimer('dataProcessing')

// Contextual logging
logger.apiCall('GET', '/api/dashboard', { dateRange })
logger.cacheOperation('SET', 'dashboard_data')
```

## 📁 File Organization Benefits

### **Before:**
```
src/
├── components/           # Mixed organization
├── stores/dashboard.js   # 865+ lines, multiple concerns
├── utils/               # Scattered utilities
└── style.css           # Global styles
```

### **After:**
```
src/
├── components/          # Well-organized by feature
├── composables/         # Reusable reactive logic
├── config/             # Environment configuration
├── constants/          # App-wide constants
├── stores/             # Focused store modules
├── utils/              # Pure utility functions
└── style.css
```

## 🔧 Migration Tips

1. **Gradual Migration**: Start using composables in new components
2. **Path Aliases**: Update imports as you modify files
3. **Constants**: Replace magic strings/numbers with named constants
4. **Error Handling**: Add error boundaries to critical components
5. **Logging**: Enable performance tracking in development

## 💡 Best Practices

- Use `useFormatters()` instead of directly importing utils store
- Use `useComponent()` for lifecycle management and error boundaries  
- Use `@/` aliases for cleaner imports
- Use constants from `@/constants` instead of magic values
- Use `logger` for consistent, contextual logging
- Use `config` for environment-specific settings

This organization improves:
✅ Code reusability  
✅ Developer experience
✅ Maintainability
✅ Performance monitoring
✅ Error handling consistency
✅ Import path clarity 