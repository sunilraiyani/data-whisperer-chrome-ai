
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pytesseract
from PIL import Image
import io
import os
import pandas as pd
import openai
import json
import base64
from typing import Optional
import numpy as np
import cv2

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set OpenAI API key
openai.api_key = os.environ.get("OPENAI_API_KEY")

def extract_table_from_image(image_data):
    """Extract tabular data from an image using OCR."""
    try:
        # If image_data is a base64 string
        if isinstance(image_data, str) and image_data.startswith('data:image'):
            # Extract the base64 content
            image_data = image_data.split(",")[1]
            image_data = base64.b64decode(image_data)
            
        # Convert to PIL Image
        image = Image.open(io.BytesIO(image_data))
        
        # Perform OCR using pytesseract
        text = pytesseract.image_to_string(image)
        
        # Clean and structure the table data
        lines = [line.strip() for line in text.strip().split('\n') if line.strip()]
        
        # Try to detect CSV-like structure
        if any(',' in line for line in lines):
            # Process as CSV
            rows = [line.split(',') for line in lines]
        else:
            # Process as space-separated values
            rows = [line.split() for line in lines]
        
        # Ensure consistent column count
        max_cols = max(len(row) for row in rows)
        normalized_rows = [row + [''] * (max_cols - len(row)) for row in rows]
        
        # Create pandas DataFrame
        headers = normalized_rows[0]
        data = normalized_rows[1:]
        df = pd.DataFrame(data, columns=headers)
        
        return df, text
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting table: {str(e)}")

def query_with_openai(table_text, raw_text, query):
    """Use OpenAI to convert natural language to pandas query and generate response."""
    try:
        # Generate pandas code
        code_response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": """You are a data analysis assistant. Convert natural language queries to pandas operations.
                    The data is represented as a table in CSV format. Your job is to:
                    1. Generate Python code using pandas to analyze the data according to the user's query
                    2. Return only the code, no explanations"""
                },
                {
                    "role": "user",
                    "content": f"Table data:\n{table_text}\n\nQuery: {query}\n\nWrite only the pandas code to answer this query:"
                }
            ],
            max_tokens=1000
        )
        
        pandas_code = code_response.choices[0].message.content.strip()
        
        # Set up the environment for code execution
        local_vars = {'pd': pd, 'np': np}
        
        # Create DataFrame from the text
        lines = table_text.strip().split('\n')
        if any(',' in line for line in lines):
            df = pd.read_csv(io.StringIO(table_text))
        else:
            rows = [line.split() for line in lines]
            headers = rows[0]
            data = rows[1:]
            df = pd.DataFrame(data, columns=headers)
            
        local_vars['df'] = df
        
        # Execute the pandas code
        try:
            # Add a line to capture the result
            if not pandas_code.strip().endswith(';'):
                if 'print' not in pandas_code:
                    if not any(line.strip().startswith('result =') for line in pandas_code.split('\n')):
                        pandas_code += "\nresult = df"
            
            exec(pandas_code, globals(), local_vars)
            
            # Get the result
            if 'result' in local_vars:
                result = local_vars['result']
                # Convert the result to a string representation
                if isinstance(result, pd.DataFrame):
                    result_str = result.to_string()
                else:
                    result_str = str(result)
            else:
                # If no explicit result, use the modified dataframe
                result_str = local_vars['df'].to_string()
        except Exception as e:
            # If executing code fails, fallback to simple analysis
            result_str = f"Error executing pandas code: {str(e)}\n"
            # Perform basic analysis
            df = local_vars['df']
            result_str += f"Basic stats:\n{df.describe().to_string()}"
        
        # Convert to conversational response
        conv_response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful data analysis assistant that explains data insights in a conversational, easy-to-understand way."
                },
                {
                    "role": "user",
                    "content": f"Original query: \"{query}\"\n\nRaw data:\n{raw_text}\n\nAnalysis results:\n{result_str}\n\nConvert these technical results into a conversational response that answers the query in a friendly, easy-to-understand way."
                }
            ],
            max_tokens=1000
        )
        
        return conv_response.choices[0].message.content.strip()
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing with OpenAI: {str(e)}")

@app.post("/analyze")
async def analyze_data(
    image: Optional[UploadFile] = File(None),
    base64_image: Optional[str] = Form(None),
    query: str = Form(...)
):
    """Analyze data from an image and respond to a natural language query."""
    try:
        # Get image data either from file upload or base64 string
        if image:
            image_data = await image.read()
        elif base64_image:
            image_data = base64_image
        else:
            raise HTTPException(status_code=400, detail="No image provided")
        
        # Extract table from image
        df, raw_text = extract_table_from_image(image_data)
        
        # Convert DataFrame to CSV string for OpenAI
        table_text = df.to_csv(index=False)
        
        # Process the query with OpenAI
        response = query_with_openai(table_text, raw_text, query)
        
        return {
            "success": True,
            "data": {
                "rawText": raw_text,
                "response": response
            }
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
