<template>
  <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-gray-900">Upload Cekat Contacts File</h3>
      <p class="text-sm text-gray-600 mt-1">
        Upload your Cekat Contacts file to update leads ratio data.
      </p>
    </div>

    <!-- File Upload Form -->
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="file-upload" class="block text-sm font-medium text-gray-700 mb-2">
          Select Cekat Contacts File
        </label>
        <div 
          class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors"
          :class="{ 'border-indigo-400 bg-indigo-50': isDragOver }"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
        >
          <div class="space-y-1 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <div class="flex text-sm text-gray-600">
              <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                <span>Upload a file</span>
                <input 
                  id="file-upload" 
                  name="file-upload" 
                  type="file" 
                  class="sr-only" 
                  accept=".csv,.xlsx,.xls"
                  @change="handleFileSelect"
                  :disabled="isUploading"
                />
              </label>
              <p class="pl-1">or drag and drop</p>
            </div>
            <p class="text-xs text-gray-500">CSV, XLSX, or XLS files only</p>
          </div>
        </div>
        
        <!-- Selected File Display -->
        <div v-if="selectedFile" class="mt-3 p-3 bg-gray-50 rounded-md">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm font-medium text-gray-900">{{ selectedFile.name }}</span>
              <span class="text-xs text-gray-500 ml-2">({{ formatFileSize(selectedFile.size) }})</span>
            </div>
            <button 
              type="button" 
              @click="clearFile"
              class="text-red-500 hover:text-red-700"
              :disabled="isUploading"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="!selectedFile || isUploading || isProcessing"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="isUploading || isProcessing" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isUploading ? 'Uploading...' : isProcessing ? 'Processing...' : 'Upload File' }}
        </button>
      </div>
    </form>

    <!-- Processing Status -->
    <div v-if="isProcessing" class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
      <div class="flex items-center">
        <svg class="animate-spin h-5 w-5 text-blue-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <div>
          <p class="text-sm font-medium text-blue-800">Processing your file...</p>
          <p class="text-xs text-blue-600 mt-1">Please wait while we process your Cekat Contacts data</p>
        </div>
      </div>
    </div>

    <!-- Status Messages -->
    <div v-if="uploadStatus" class="mt-4 p-3 rounded-md" :class="statusClasses">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg v-if="uploadStatus.type === 'success'" class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else-if="uploadStatus.type === 'error'" class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium" :class="statusTextClasses">
            {{ uploadStatus.message }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'FileUpload',
  emits: ['upload-success', 'upload-error'],
  setup(props, { emit }) {
    const selectedFile = ref(null)
    const isUploading = ref(false)
    const isProcessing = ref(false)
    const uploadStatus = ref(null)
    const isDragOver = ref(false)

    const statusClasses = computed(() => {
      if (!uploadStatus.value) return ''
      return uploadStatus.value.type === 'success' 
        ? 'bg-green-50 border border-green-200' 
        : 'bg-red-50 border border-red-200'
    })

    const statusTextClasses = computed(() => {
      if (!uploadStatus.value) return ''
      return uploadStatus.value.type === 'success' 
        ? 'text-green-800' 
        : 'text-red-800'
    })

    const validateFile = (file) => {
      // Validate file type
      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]
      
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
        showStatus('error', 'Please select a valid CSV, XLSX, or XLS file.')
        return false
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showStatus('error', 'File size must be less than 10MB.')
        return false
      }

      return true
    }

    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      if (file && validateFile(file)) {
        selectedFile.value = file
        clearStatus()
      }
    }

    const handleDragOver = (event) => {
      event.preventDefault()
      isDragOver.value = true
    }

    const handleDragLeave = (event) => {
      event.preventDefault()
      isDragOver.value = false
    }

    const handleDrop = (event) => {
      event.preventDefault()
      isDragOver.value = false
      
      const files = event.dataTransfer.files
      if (files.length > 0) {
        const file = files[0]
        if (validateFile(file)) {
          selectedFile.value = file
          clearStatus()
        }
      }
    }

    const clearFile = () => {
      selectedFile.value = null
      clearStatus()
      // Reset file input
      const fileInput = document.getElementById('file-upload')
      if (fileInput) fileInput.value = ''
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const showStatus = (type, message) => {
      uploadStatus.value = { type, message }
      setTimeout(() => {
        clearStatus()
      }, 5000)
    }

    const clearStatus = () => {
      uploadStatus.value = null
    }

    const handleSubmit = async () => {
      if (!selectedFile.value) return

      isUploading.value = true
      isProcessing.value = false
      clearStatus()

      try {
        // Create FormData to mimic n8n form submission
        const formData = new FormData()
        formData.append('data', selectedFile.value)
        
        // Add any additional fields that n8n might expect
        formData.append('upload_type', 'cekat_contacts')
        formData.append('timestamp', new Date().toISOString())

        // Get API URL from environment or use default
        const apiUrl = import.meta.env.VITE_LEADS_RATIO_API_URL || 'https://workflows.cekat.ai/webhook/leads-ratio'

        console.log('Uploading to:', apiUrl)
        console.log('File:', selectedFile.value.name, 'Size:', selectedFile.value.size)

        const response = await fetch(apiUrl, {
          method: 'POST',
          body: formData,
          // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
        })

        console.log('Response status:', response.status)
        console.log('Response headers:', Object.fromEntries(response.headers.entries()))

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
        }

        // File uploaded successfully - show immediate success response
        isUploading.value = false
        isProcessing.value = false
        
        // Show immediate success message
        showStatus('success', '✅ File uploaded successfully! Your Cekat Contacts data is being processed in the background.')
        
        // Log the response for debugging (but don't wait for it)
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          try {
            const result = await response.json()
            console.log('n8n webhook response (background):', result)
          } catch (jsonError) {
            console.warn('Background response parsing failed:', jsonError)
          }
        } else {
          try {
            const textResult = await response.text()
            console.log('n8n webhook text response (background):', textResult)
          } catch (textError) {
            console.warn('Background text response failed:', textError)
          }
        }
        
        emit('upload-success', { 
          file: selectedFile.value, 
          result: { 
            success: true, 
            message: 'File uploaded successfully! Processing in background.' 
          } 
        })
        
        // Clear the file after successful upload
        clearFile()

      } catch (error) {
        console.error('Upload error:', error)
        
        // Provide more specific error messages
        let errorMessage = 'Upload failed'
        if (error.name === 'TypeError' && error.message.includes('JSON')) {
          errorMessage = 'Upload completed but received invalid response from server'
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error - please check your connection'
        } else if (error.message.includes('404')) {
          errorMessage = 'Upload endpoint not found - please contact administrator'
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error - please try again later'
        } else {
          errorMessage = `Upload failed: ${error.message}`
        }
        
        showStatus('error', errorMessage)
        emit('upload-error', { file: selectedFile.value, error: error.message })
      } finally {
        isUploading.value = false
        isProcessing.value = false
      }
    }

    return {
      selectedFile,
      isUploading,
      isProcessing,
      uploadStatus,
      isDragOver,
      statusClasses,
      statusTextClasses,
      handleFileSelect,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      clearFile,
      formatFileSize,
      handleSubmit
    }
  }
}
</script> 