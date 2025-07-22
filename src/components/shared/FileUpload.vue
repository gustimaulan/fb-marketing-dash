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
          <svg v-else-if="uploadStatus.type === 'info'" class="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
import { ref, computed, onUnmounted } from 'vue'

export default {
  name: 'FileUpload',
  emits: ['upload-success', 'upload-error'],
  setup(props, { emit }) {
    const selectedFile = ref(null)
    const isUploading = ref(false)
    const isProcessing = ref(false)
    const uploadStatus = ref(null)
    const isDragOver = ref(false)
    const processingId = ref(null)
    const pollingInterval = ref(null)

    const statusClasses = computed(() => {
      if (!uploadStatus.value) return ''
      switch (uploadStatus.value.type) {
        case 'success':
          return 'bg-green-50 border border-green-200'
        case 'error':
          return 'bg-red-50 border border-red-200'
        case 'info':
          return 'bg-blue-50 border border-blue-200'
        default:
          return 'bg-gray-50 border border-gray-200'
      }
    })

    const statusTextClasses = computed(() => {
      if (!uploadStatus.value) return ''
      switch (uploadStatus.value.type) {
        case 'success':
          return 'text-green-800'
        case 'error':
          return 'text-red-800'
        case 'info':
          return 'text-blue-800'
        default:
          return 'text-gray-800'
      }
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

    const clearFile = (clearStatusMessage = true) => {
      selectedFile.value = null
      if (clearStatusMessage) {
        clearStatus()
      }
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

    const startPolling = (id) => {
      processingId.value = id
      isProcessing.value = true
      
      // Poll every 5 seconds for up to 10 minutes
      let attempts = 0
      const maxAttempts = 120 // 10 minutes
      
      pollingInterval.value = setInterval(async () => {
        attempts++
        
        try {
          const statusUrl = `${import.meta.env.VITE_LEADS_RATIO_API_URL}/status/${id}`
          const response = await fetch(statusUrl)
          
          if (response.ok) {
            const statusData = await response.json()
            
            if (statusData.status === 'completed') {
              clearInterval(pollingInterval.value)
              isProcessing.value = false
              showStatus('success', `✅ Processing completed! ${statusData.message || 'Your data has been updated.'}`)
              emit('upload-success', { 
                file: selectedFile.value, 
                result: statusData,
                processingId: id
              })
              clearFile(true) // Clear status message
            } else if (statusData.status === 'failed') {
              clearInterval(pollingInterval.value)
              isProcessing.value = false
              showStatus('error', `❌ Processing failed: ${statusData.message || 'Unknown error occurred.'}`)
              emit('upload-error', { 
                file: selectedFile.value, 
                error: statusData.message,
                processingId: id
              })
            } else if (statusData.status === 'processing') {
              // Continue polling, update status message
              showStatus('info', `🔄 Processing... ${statusData.progress || ''}`)
            }
          }
        } catch (error) {
          console.warn('Status check failed:', error)
        }
        
        // Stop polling after max attempts
        if (attempts >= maxAttempts) {
          clearInterval(pollingInterval.value)
          isProcessing.value = false
          showStatus('error', '⏰ Processing timeout. Please check the status manually.')
        }
      }, 5000)
    }

    const stopPolling = () => {
      if (pollingInterval.value) {
        clearInterval(pollingInterval.value)
        pollingInterval.value = null
      }
      isProcessing.value = false
    }

    const startPollingWithCustomUrl = (statusUrl, fileName) => {
      isProcessing.value = true
      
      // Poll every 5 seconds for up to 10 minutes
      let attempts = 0
      const maxAttempts = 120 // 10 minutes
      
      pollingInterval.value = setInterval(async () => {
        attempts++
        
        try {
          const response = await fetch(statusUrl)
          
          if (response.ok) {
            const statusData = await response.json()
            
            if (statusData.status === 'completed' || statusData.success === true) {
              clearInterval(pollingInterval.value)
              isProcessing.value = false
              showStatus('success', `✅ Processing completed for "${fileName}"! ${statusData.message || 'Your data has been updated.'}`)
              emit('upload-success', { 
                file: selectedFile.value, 
                result: statusData,
                fileName: fileName
              })
              clearFile(true) // Clear status message
            } else if (statusData.status === 'failed' || statusData.success === false) {
              clearInterval(pollingInterval.value)
              isProcessing.value = false
              showStatus('error', `❌ Processing failed for "${fileName}": ${statusData.message || 'Unknown error occurred.'}`)
              emit('upload-error', { 
                file: selectedFile.value, 
                error: statusData.message,
                fileName: fileName
              })
            } else if (statusData.status === 'processing' || statusData.progress) {
              // Continue polling, update status message
              const progress = statusData.progress || statusData.message || ''
              showStatus('info', `🔄 Processing "${fileName}"... ${progress}`)
            }
          }
        } catch (error) {
          console.warn('Status check failed:', error)
        }
        
        // Stop polling after max attempts
        if (attempts >= maxAttempts) {
          clearInterval(pollingInterval.value)
          isProcessing.value = false
          showStatus('error', `⏰ Processing timeout for "${fileName}". Please check the status manually.`)
        }
      }, 5000)
    }

    // Alternative: WebSocket-based status checking (uncomment if webhook supports WebSocket)
    /*
    const startWebSocketStatusCheck = (id) => {
      const wsUrl = import.meta.env.VITE_LEADS_RATIO_WS_URL || 'wss://workflows.cekat.ai/ws/status'
      const ws = new WebSocket(`${wsUrl}?id=${id}`)
      
      ws.onopen = () => {
        console.log('WebSocket connected for status updates')
        isProcessing.value = true
      }
      
      ws.onmessage = (event) => {
        try {
          const statusData = JSON.parse(event.data)
          
          if (statusData.status === 'completed') {
            ws.close()
            isProcessing.value = false
            showStatus('success', `✅ Processing completed! ${statusData.message || 'Your data has been updated.'}`)
            emit('upload-success', { file: selectedFile.value, result: statusData, processingId: id })
            clearFile()
          } else if (statusData.status === 'failed') {
            ws.close()
            isProcessing.value = false
            showStatus('error', `❌ Processing failed: ${statusData.message || 'Unknown error occurred.'}`)
            emit('upload-error', { file: selectedFile.value, error: statusData.message, processingId: id })
          } else if (statusData.status === 'processing') {
            showStatus('info', `🔄 Processing... ${statusData.progress || ''}`)
          }
        } catch (error) {
          console.warn('WebSocket message parsing failed:', error)
        }
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        ws.close()
        // Fallback to polling
        startPolling(id)
      }
      
      ws.onclose = () => {
        console.log('WebSocket connection closed')
      }
      
      return ws
    }
    */

    const handleSubmit = async () => {
      if (!selectedFile.value) return

      isUploading.value = true
      isProcessing.value = false
      clearStatus()
      stopPolling()

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
        })

        console.log('Response status:', response.status)
        console.log('Response headers:', Object.fromEntries(response.headers.entries()))

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
        }

        // File uploaded successfully - now check for processing ID
        isUploading.value = false
        
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          try {
            const result = await response.json()
            console.log('n8n webhook response:', result)
            
            // Handle the specific webhook response format
            if (Array.isArray(result) && result.length > 0) {
              const responseData = result[0]
              
              if (responseData.success) {
                // File uploaded successfully - check if we need to poll for processing status
                const fileName = responseData.file?.fileName || selectedFile.value.name
                const fileSize = responseData.file?.fileSize || formatFileSize(selectedFile.value.size)
                
                // Option 1: If webhook provides a processing ID, start polling
                if (responseData.processingId || responseData.id) {
                  const processingId = responseData.processingId || responseData.id
                  showStatus('info', `✅ File "${fileName}" uploaded! Starting to process...`)
                  startPolling(processingId)
                } 
                // Option 2: If webhook provides a status endpoint, use the file info to poll
                else if (responseData.file?.url || responseData.statusUrl) {
                  const statusUrl = responseData.statusUrl || `${responseData.file.url}/status`
                  showStatus('info', `✅ File "${fileName}" uploaded! Checking processing status...`)
                  startPollingWithCustomUrl(statusUrl, fileName)
                }
                // Option 3: Immediate success (no processing needed)
                else {
                  console.log('Showing success status for file:', fileName)
                  showStatus('success', `✅ File "${fileName}" uploaded successfully!`)
                  console.log('Current uploadStatus:', uploadStatus.value)
                  emit('upload-success', { 
                    file: selectedFile.value, 
                    result: responseData,
                    fileInfo: responseData.file
                  })
                  // Don't clear file immediately - let user see the success message
                  setTimeout(() => {
                    clearFile(false) // Don't clear status message
                  }, 2000)
                }
              } else {
                // Upload failed
                showStatus('error', `❌ Upload failed: ${responseData.message || 'Unknown error'}`)
                emit('upload-error', { 
                  file: selectedFile.value, 
                  error: responseData.message 
                })
              }
            } else {
              // Unexpected response format
              showStatus('success', '✅ File uploaded successfully!')
              emit('upload-success', { 
                file: selectedFile.value, 
                result: result
              })
              clearFile(false) // Don't clear status message
            }
          } catch (jsonError) {
            console.warn('Response parsing failed:', jsonError)
            showStatus('success', '✅ File uploaded successfully! Processing in background.')
            clearFile(false) // Don't clear status message
          }
        } else {
          // Text response - try to extract processing ID
          try {
            const textResult = await response.text()
            console.log('n8n webhook text response:', textResult)
            
            // Try to parse as JSON or extract ID from text
            let processingId = null
            let responseData = null
            
            try {
              const parsed = JSON.parse(textResult)
              
              // Handle array format like the webhook response
              if (Array.isArray(parsed) && parsed.length > 0) {
                responseData = parsed[0]
                processingId = responseData.processingId || responseData.id
              } else {
                processingId = parsed.processingId || parsed.id
                responseData = parsed
              }
            } catch (e) {
              // Look for ID in text response
              const idMatch = textResult.match(/processing[_-]?id[:\s]*([a-zA-Z0-9-_]+)/i)
              if (idMatch) processingId = idMatch[1]
            }
            
            if (processingId) {
              const fileName = responseData?.file?.fileName || selectedFile.value.name
              showStatus('info', `✅ File "${fileName}" uploaded! Starting to process...`)
              startPolling(processingId)
            } else if (responseData?.success) {
              // Handle successful upload without processing ID
              const fileName = responseData.file?.fileName || selectedFile.value.name
              showStatus('success', `✅ File "${fileName}" uploaded successfully!`)
              emit('upload-success', { 
                file: selectedFile.value, 
                result: responseData,
                fileInfo: responseData.file
              })
              clearFile(false) // Don't clear status message
            } else {
              showStatus('success', '✅ File uploaded successfully! Processing in background.')
              clearFile(false) // Don't clear status message
            }
          } catch (textError) {
            console.warn('Text response failed:', textError)
            showStatus('success', '✅ File uploaded successfully!')
            clearFile(false) // Don't clear status message
          }
        }

      } catch (error) {
        console.error('Upload error:', error)
        stopPolling()
        
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
      }
    }

    // Cleanup on component unmount
    onUnmounted(() => {
      stopPolling()
    })

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
      handleSubmit,
      stopPolling,
      startPollingWithCustomUrl
    }
  }
}
</script> 