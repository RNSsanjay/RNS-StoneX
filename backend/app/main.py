from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import json
import uuid
import random
from datetime import datetime

from .models import GameState, Player, GameMove, GameResult
from .ai_agent import AIAgent
from .game_logic import GameLogic
from .gesture_recognition import HandGestureRecognizer

app = FastAPI(
    title="RNS StoneX API",
    description="Professional Stone Paper Scissors Game Backend",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Game state management
active_games: Dict[str, GameState] = {}
ai_agent = AIAgent()
game_logic = GameLogic()
gesture_recognizer = HandGestureRecognizer()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.get("/")
async def root():
    return {"message": "RNS StoneX Game API is running!", "version": "1.0.0"}

@app.post("/api/game/create")
async def create_game(game_mode: str = "single"):
    """Create a new game session"""
    game_id = str(uuid.uuid4())
    game_state = GameState(
        id=game_id,
        mode=game_mode,
        status="waiting",
        created_at=datetime.now()
    )
    active_games[game_id] = game_state
    return {"game_id": game_id, "status": "created"}

@app.get("/api/game/{game_id}")
async def get_game_state(game_id: str):
    """Get current game state"""
    if game_id not in active_games:
        raise HTTPException(status_code=404, detail="Game not found")
    return active_games[game_id]

@app.post("/api/game/{game_id}/move")
async def make_move(game_id: str, move: GameMove):
    """Make a move in the game"""
    if game_id not in active_games:
        raise HTTPException(status_code=404, detail="Game not found")
    
    game_state = active_games[game_id]
    
    if game_state.mode == "single":
        # AI opponent move
        ai_move = await ai_agent.make_move(move.move, game_state.history)
        result = game_logic.determine_winner(move.move, ai_move)
        
        # Update game state
        game_state.player1_score += 1 if result == "player1" else 0
        game_state.player2_score += 1 if result == "player2" else 0
        game_state.round_number += 1
        game_state.history.append({
            "round": game_state.round_number,
            "player1_move": move.move,
            "player2_move": ai_move,
            "result": result,
            "timestamp": datetime.now()
        })
        
        return {
            "player_move": move.move,
            "ai_move": ai_move,
            "result": result,
            "score": {
                "player": game_state.player1_score,
                "ai": game_state.player2_score
            }
        }
    
    return {"message": "Multiplayer mode not yet implemented"}

@app.post("/api/ai/get-move")
async def get_ai_move(history: Optional[List] = None):
    """Get AI move based on game history"""
    # Extract last opponent move from history if available
    opponent_last_move = None
    if history and len(history) > 0:
        opponent_last_move = history[-1].get("player1_move")
    
    move = await ai_agent.make_move(opponent_last_move, history or [])
    return {"move": move, "animation": ai_agent.get_animation_data()}

@app.post("/api/gesture/recognize")
async def recognize_gesture(image_data: dict):
    """Recognize gesture from image data using MediaPipe"""
    try:
        image_base64 = image_data.get("image")
        if not image_base64:
            return {
                "gesture": "none",
                "confidence": 0.0,
                "detected": False,
                "error": "No image data provided"
            }
        
        # Use the actual gesture recognizer
        result = gesture_recognizer.recognize_gesture(image_base64)
        
        return {
            "gesture": result["gesture"],
            "confidence": result["confidence"],
            "detected": result["detected"],
            "landmarks": result.get("landmarks", []),
            "message": f"Detected {result['gesture']} with {result['confidence']:.2f} confidence"
        }
        
    except Exception as e:
        return {
            "gesture": "error",
            "confidence": 0.0,
            "detected": False,
            "error": str(e)
        }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "RNS StoneX API is running"}

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["type"] == "game_move":
                # Handle real-time game moves
                await manager.broadcast(json.dumps({
                    "type": "move_update",
                    "client_id": client_id,
                    "move": message["move"],
                    "timestamp": datetime.now().isoformat()
                }))
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(json.dumps({
            "type": "client_disconnect",
            "client_id": client_id
        }))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)