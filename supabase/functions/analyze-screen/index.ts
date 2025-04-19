
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createWorker } from 'https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/worker.min.js'

serve(async (req) => {
  try {
    const { image } = await req.json()
    
    // Initialize Tesseract worker
    const worker = await createWorker()
    await worker.loadLanguage('eng')
    await worker.initialize('eng')
    
    // Perform OCR on the image
    const { data: { text } } = await worker.recognize(image)
    await worker.terminate()
    
    // Extract tabular data (assuming CSV-like format)
    const rows = text.split('\n')
      .map(row => row.split(/\s+/))
      .filter(row => row.length > 1) // Remove empty rows
    
    // Convert text data to numeric where possible
    const numericData = rows.map(row =>
      row.map(cell => isNaN(Number(cell)) ? cell : Number(cell))
    )
    
    // Basic statistical analysis
    const stats = numericData.slice(1).reduce((acc, row) => {
      row.forEach((value, index) => {
        if (typeof value === 'number') {
          if (!acc[index]) {
            acc[index] = { sum: 0, count: 0, min: value, max: value }
          }
          acc[index].sum += value
          acc[index].count++
          acc[index].min = Math.min(acc[index].min, value)
          acc[index].max = Math.max(acc[index].max, value)
        }
      })
      return acc
    }, [])
    
    // Calculate averages and format results
    const columns = rows[0]
    const analysis = columns.map((col, i) => ({
      column: col,
      ...(stats[i] ? {
        average: stats[i].sum / stats[i].count,
        min: stats[i].min,
        max: stats[i].max,
        count: stats[i].count
      } : { type: 'text' })
    }))
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          text,
          rawData: rows,
          analysis
        }
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }
})
