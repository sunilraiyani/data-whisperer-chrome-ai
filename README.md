
# Data Whisperer

An AI-powered application that lets users analyze spreadsheet data by sharing their screen and asking questions in natural language.

## Overview

Data Whisperer combines screen sharing technology with OCR (Optical Character Recognition) and AI to allow users to ask questions about spreadsheet data visible on their screen.

## Features

- **Screen Sharing**: Capture what's on your screen in real-time
- **OCR Technology**: Convert visual data from spreadsheets into text
- **Natural Language Queries**: Ask questions about your data in plain English
- **AI-Powered Analysis**: Get instant insights and answers about your data

## Architecture

The application is split into two parts:

1. **Frontend**: React application with screen sharing capabilities
2. **Backend**: Python server with OCR and AI analysis capabilities

## Setup Instructions

### Frontend

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

### Backend

Follow the setup instructions in the `backend/README.md` file.

## Usage

1. Start both the frontend and backend servers
2. Open the frontend in your browser
3. Share your screen showing a spreadsheet
4. Ask questions about your data in the chat interface
5. Receive conversational answers based on AI analysis

## Requirements

- Modern web browser with screen sharing capabilities
- Python 3.8+ for the backend
- Tesseract OCR installed on your system
- OpenAI API key
