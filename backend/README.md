
# Data Whisperer Backend

This is the Python backend server for the Data Whisperer application. It provides OCR and data analysis capabilities through a REST API.

## Setup Instructions

### Prerequisites

- Python 3.8+ installed
- Tesseract OCR installed on your system
- OpenAI API key

### Installing Tesseract OCR

#### Windows
1. Download the installer from [https://github.com/UB-Mannheim/tesseract/wiki](https://github.com/UB-Mannheim/tesseract/wiki)
2. Run the installer
3. Add the Tesseract installation directory to your PATH environment variable

#### macOS
```
brew install tesseract
```

#### Linux (Ubuntu/Debian)
```
sudo apt-get install tesseract-ocr
```

### Python Environment Setup

1. Navigate to the backend directory
2. Create a virtual environment (recommended):
   ```
   python -m venv venv
   ```
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`
4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

### Configuration

1. Copy `.env.example` to `.env`
2. Add your OpenAI API key to the `.env` file:
   ```
   OPENAI_API_KEY=your_key_here
   ```

## Running the Server

```
python -m app
```

The server will be available at http://localhost:8000.

## API Endpoints

### POST /analyze
Analyzes an image containing tabular data and responds to a natural language query.

#### Request Parameters
- `image`: Image file upload (optional)
- `base64_image`: Base64-encoded image string (optional, used if no file uploaded)
- `query`: Natural language query about the data

#### Response
```json
{
  "success": true,
  "data": {
    "rawText": "Raw OCR text from the image",
    "response": "Conversational answer to the query"
  }
}
```

## Docker Support

You can also run the backend using Docker:

```
docker build -t data-whisperer-backend .
docker run -p 8000:8000 --env-file .env data-whisperer-backend
```
