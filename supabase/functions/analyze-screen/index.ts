
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createWorker } from 'https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/worker.min.js'

// Configure OpenAI
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

// Set up Supabase client (used for secrets and potentially storing processed data)
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_ANON_KEY') || '',
  { global: { headers: { Authorization: `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}` } } }
)

const queryDataWithPandas = async (tableText: string, query: string) => {
  try {
    // Use OpenAI to convert the natural language query to a pandas-like operation
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a data analysis assistant. Convert natural language queries to pandas-like operations.
            The data is represented as a table in CSV format. Your job is to:
            1. Generate Python code using pandas to analyze the data according to the user's query
            2. Return only the code, no explanations`
          },
          {
            role: 'user',
            content: `Table data:\n${tableText}\n\nQuery: ${query}\n\nWrite only the pandas code to answer this query:`
          }
        ],
        max_tokens: 1000
      })
    })

    const result = await response.json()
    const pandasCode = result.choices[0].message.content.trim()
    
    // Here we would execute the pandas code in a real implementation
    // For our demo, we'll simulate this by analyzing the data directly in JS
    
    const rows = tableText.split('\n').map(row => row.split(',').map(cell => cell.trim()))
    const headers = rows[0]
    const data = rows.slice(1)
    
    // Perform basic analysis based on the query (simplified simulation of pandas)
    let analysisResult = "Analysis results:\n"
    
    // Simplified analysis based on common query types
    if (query.toLowerCase().includes('average') || query.toLowerCase().includes('mean')) {
      // Calculate average for numeric columns
      headers.forEach((header, idx) => {
        const values = data.map(row => parseFloat(row[idx])).filter(val => !isNaN(val))
        if (values.length > 0) {
          const avg = values.reduce((sum, val) => sum + val, 0) / values.length
          analysisResult += `Average ${header}: ${avg.toFixed(2)}\n`
        }
      })
    } else if (query.toLowerCase().includes('maximum') || query.toLowerCase().includes('highest')) {
      // Find maximum values
      headers.forEach((header, idx) => {
        const values = data.map(row => parseFloat(row[idx])).filter(val => !isNaN(val))
        if (values.length > 0) {
          const max = Math.max(...values)
          analysisResult += `Maximum ${header}: ${max}\n`
        }
      })
    } else if (query.toLowerCase().includes('minimum') || query.toLowerCase().includes('lowest')) {
      // Find minimum values
      headers.forEach((header, idx) => {
        const values = data.map(row => parseFloat(row[idx])).filter(val => !isNaN(val))
        if (values.length > 0) {
          const min = Math.min(...values)
          analysisResult += `Minimum ${header}: ${min}\n`
        }
      })
    } else {
      // Default to providing summary statistics
      analysisResult += "Summary statistics:\n"
      headers.forEach((header, idx) => {
        const values = data.map(row => parseFloat(row[idx])).filter(val => !isNaN(val))
        if (values.length > 0) {
          const sum = values.reduce((acc, val) => acc + val, 0)
          const avg = sum / values.length
          const min = Math.min(...values)
          const max = Math.max(...values)
          analysisResult += `${header}: avg=${avg.toFixed(2)}, min=${min}, max=${max}, count=${values.length}\n`
        }
      })
    }
    
    // Use OpenAI to convert the analysis results to a conversational response
    const conversationalResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful data analysis assistant that explains data insights in a conversational, easy-to-understand way.'
          },
          {
            role: 'user',
            content: `Original query: "${query}"\n\nAnalysis results:\n${analysisResult}\n\nConvert these technical results into a conversational response that answers the query in a friendly, easy-to-understand way.`
          }
        ],
        max_tokens: 1000
      })
    })

    const conversationalResult = await conversationalResponse.json()
    return conversationalResult.choices[0].message.content.trim()
  } catch (error) {
    console.error('Error processing with OpenAI:', error)
    return `Error analyzing data: ${error.message}`
  }
}

serve(async (req) => {
  try {
    const { image, query } = await req.json()
    
    // Initialize Tesseract worker for OCR
    const worker = await createWorker()
    await worker.loadLanguage('eng')
    await worker.initialize('eng')
    
    // Perform OCR on the image
    const { data: { text } } = await worker.recognize(image)
    await worker.terminate()
    
    // Extract tabular data (assuming CSV-like format)
    const cleanedText = text.replace(/\s+/g, ',').replace(/,+/g, ',').trim()
    
    let response
    if (query) {
      // If a query was provided, process it with OpenAI/pandas
      const analysisResponse = await queryDataWithPandas(cleanedText, query)
      response = {
        success: true,
        data: {
          rawText: text,
          cleanedText,
          response: analysisResponse
        }
      }
    } else {
      // If no query, just return the OCR results
      response = {
        success: true,
        data: {
          rawText: text,
          cleanedText
        }
      }
    }
    
    return new Response(
      JSON.stringify(response),
      { headers: { 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }
})
