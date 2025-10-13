# RNS StoneX Backend

Professional Stone Paper Scissors game backend built with FastAPI.

## Features
- AI opponent powered by Langchain and Gemini 2.0 Flash
- Hand gesture recognition API
- Real-time game state management
- WebSocket support for multiplayer games

## Setup
1. Create virtual environment: `python -m venv venv`
2. Activate: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Linux/Mac)
3. Install dependencies: `pip install -r requirements.txt`
4. Run: `uvicorn app.main:app --reload`

## Environment Variables
- GOOGLE_API_KEY: Your Google API key for Gemini model