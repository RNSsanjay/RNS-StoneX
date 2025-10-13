from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime

class GameMove(BaseModel):
    move: str  # "rock", "paper", "scissors"
    player_id: Optional[str] = None
    confidence: Optional[float] = None

class Player(BaseModel):
    id: str
    name: str
    score: int = 0
    is_ai: bool = False

class GameResult(BaseModel):
    winner: Optional[str]  # "player1", "player2", "tie"
    player1_move: str
    player2_move: str
    round_number: int

class GameState(BaseModel):
    id: str
    mode: str  # "single", "multiplayer"
    status: str  # "waiting", "active", "finished"
    player1_score: int = 0
    player2_score: int = 0
    round_number: int = 0
    history: List[Dict[str, Any]] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

class HandGesture(BaseModel):
    gesture: str
    confidence: float
    landmarks: List[List[float]]

class AIResponse(BaseModel):
    move: str
    reasoning: Optional[str] = None
    animation_state: Optional[str] = None
    confidence: float