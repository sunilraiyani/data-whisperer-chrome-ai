// Keep track of the video stream
let videoElement: HTMLVideoElement | null = null
let captureInterval: NodeJS.Timeout | null = null
let latestImageData: string | null = null

// Initialize the screen analysis system
export const initScreenAnalysis = (video: HTMLVideoElement) => {
  // Store the video element
  videoElement = video
  
  // Set up continuous frame capture at regular intervals (adjust as needed)
  if (captureInterval) {
    clearInterval(captureInterval)
  }
  
  captureInterval = setInterval(() => {
    if (videoElement && videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
      captureCurrentFrame()
    }
  }, 2000) // Capture every 2 seconds
}

// Stop the screen analysis
export const stopScreenAnalysis = () => {
  if (captureInterval) {
    clearInterval(captureInterval)
    captureInterval = null
  }
  videoElement = null
  latestImageData = null
}

// Capture the current frame
const captureCurrentFrame = () => {
  if (!videoElement) return
  
  try {
    // Create a canvas to capture the video frame
    const canvas = document.createElement('canvas')
    canvas.width = videoElement.videoWidth
    canvas.height = videoElement.videoHeight
    const ctx = canvas.getContext('2d')
    
    if (!ctx) throw new Error('Could not get canvas context')
    
    // Draw the current video frame to canvas
    ctx.drawImage(videoElement, 0, 0)
    
    // Convert to base64
    latestImageData = canvas.toDataURL('image/png')
  } catch (error) {
    console.error('Error capturing frame:', error)
  }
}

// Process a user query with the latest frame
export const processQuery = async (query: string) => {
  try {
    if (!latestImageData) {
      throw new Error('No screen data available. Please make sure screen sharing is active.')
    }
    
    // Send to our Edge Function
    const response = await fetch('/functions/v1/analyze-screen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        image: latestImageData,
        query: query 
      })
    })
    
    if (!response.ok) throw new Error('Analysis failed')
    
    return await response.json()
  } catch (error) {
    console.error('Error processing query:', error)
    throw error
  }
}

// Legacy function to maintain backward compatibility
export const analyzeScreenshot = async (videoElement: HTMLVideoElement) => {
  try {
    // Create a canvas to capture the video frame
    const canvas = document.createElement('canvas')
    canvas.width = videoElement.videoWidth
    canvas.height = videoElement.videoHeight
    const ctx = canvas.getContext('2d')
    
    if (!ctx) throw new Error('Could not get canvas context')
    
    // Draw the current video frame to canvas
    ctx.drawImage(videoElement, 0, 0)
    
    // Convert to base64
    const imageData = canvas.toDataURL('image/png')
    
    // Send to our Edge Function
    const response = await fetch('/functions/v1/analyze-screen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageData })
    })
    
    if (!response.ok) throw new Error('Analysis failed')
    
    return await response.json()
  } catch (error) {
    console.error('Error analyzing screen:', error)
    throw error
  }
}
