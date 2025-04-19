
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
