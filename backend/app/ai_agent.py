import random
from typing import List, Dict, Any, Optional
import os
import json
from dotenv import load_dotenv

load_dotenv()

class AIAgent:
    def __init__(self):
        # For now, we'll use a strategic random approach
        # Later we can integrate with Langchain when network is stable
        self.api_key = os.getenv("GOOGLE_API_KEY")
        self.personality_traits = [
            "playful", "strategic", "unpredictable", "competitive", "friendly"
        ]
        self.current_mood = "neutral"
        
    async def make_move(self, opponent_last_move: Optional[str] = None, game_history: List[Dict] = None) -> str:
        """Generate AI move using Gemini 2.0 Flash with game strategy"""
        
        # Prepare game context
        context = self._prepare_game_context(opponent_last_move, game_history or [])
        
        system_prompt = """You are RoboStone, an advanced AI opponent in a Rock Paper Scissors game. 
        You should be strategic, unpredictable, and engaging. Analyze the opponent's patterns and make intelligent moves.
        
        Respond with ONLY one of these exact words: rock, paper, or scissors
        
        Consider:
        - Opponent's previous moves and patterns
        - Counter-strategies and psychology
        - Maintaining unpredictability
        - Being competitive but fair
        """
        
        human_prompt = f"""
        Game Context: {context}
        
        Based on the opponent's history and patterns, what's your next move?
        Remember: rock beats scissors, scissors beats paper, paper beats rock.
        
        Respond with only: rock, paper, or scissors
        """
        
        try:
            # For now, use strategic logic instead of LLM
            # TODO: Integrate Gemini 2.0 Flash when network is stable
            ai_move = self._strategic_move(opponent_last_move, game_history or [])
            
            self._update_mood(ai_move, opponent_last_move)
            return ai_move
            
        except Exception as e:
            print(f"AI Agent error: {e}")
            # Fallback to strategic random
            return self._fallback_strategy(opponent_last_move, game_history or [])
    
    def _prepare_game_context(self, opponent_last_move: Optional[str], game_history: List[Dict]) -> str:
        """Prepare context for AI decision making"""
        if not game_history:
            return "This is the first round. No previous moves to analyze."
        
        # Analyze patterns
        opponent_moves = [round_data.get("player1_move", "") for round_data in game_history[-5:]]
        move_counts = {"rock": 0, "paper": 0, "scissors": 0}
        
        for move in opponent_moves:
            if move in move_counts:
                move_counts[move] += 1
        
        context = f"""
        Recent opponent moves: {opponent_moves}
        Move frequency: {move_counts}
        Last opponent move: {opponent_last_move or 'None'}
        Total rounds played: {len(game_history)}
        """
        
        return context
    
    def _strategic_move(self, opponent_last_move: Optional[str], game_history: List[Dict]) -> str:
        """Strategic AI move based on game analysis"""
        if not game_history:
            return random.choice(["rock", "paper", "scissors"])
        
        # Analyze opponent patterns
        recent_moves = [round_data.get("player1_move", "") for round_data in game_history[-5:]]
        move_counts = {"rock": 0, "paper": 0, "scissors": 0}
        
        for move in recent_moves:
            if move in move_counts:
                move_counts[move] += 1
        
        # Predict opponent's next move and counter it
        if move_counts:
            most_common = max(move_counts, key=move_counts.get)
            counters = {
                "rock": "paper",
                "paper": "scissors", 
                "scissors": "rock"
            }
            
            # 60% strategic, 40% random for unpredictability
            if random.random() < 0.6:
                return counters.get(most_common, random.choice(["rock", "paper", "scissors"]))
        
        return random.choice(["rock", "paper", "scissors"])
    
    def _fallback_strategy(self, opponent_last_move: Optional[str], game_history: List[Dict]) -> str:
        """Strategic fallback when AI model fails"""
        if not opponent_last_move:
            return random.choice(["rock", "paper", "scissors"])
        
        # Simple counter-strategy
        counters = {
            "rock": "paper",
            "paper": "scissors", 
            "scissors": "rock"
        }
        
        # 70% chance to counter, 30% random for unpredictability
        if random.random() < 0.7:
            return counters.get(opponent_last_move, random.choice(["rock", "paper", "scissors"]))
        else:
            return random.choice(["rock", "paper", "scissors"])
    
    def _update_mood(self, ai_move: str, opponent_move: Optional[str]):
        """Update AI mood based on game situation"""
        if not opponent_move:
            self.current_mood = "confident"
            return
            
        if self._would_win(ai_move, opponent_move):
            self.current_mood = "victorious"
        elif ai_move == opponent_move:
            self.current_mood = "focused"
        else:
            self.current_mood = "determined"
    
    def _would_win(self, move1: str, move2: str) -> bool:
        """Check if move1 beats move2"""
        winning_combinations = {
            ("rock", "scissors"),
            ("scissors", "paper"),
            ("paper", "rock")
        }
        return (move1, move2) in winning_combinations
    
    def get_animation_data(self) -> Dict[str, Any]:
        """Get animation data for frontend robot"""
        animations = {
            "confident": "power_up",
            "victorious": "celebration",
            "focused": "thinking",
            "determined": "battle_stance",
            "neutral": "idle"
        }
        
        return {
            "animation": animations.get(self.current_mood, "idle"),
            "mood": self.current_mood,
            "duration": 2000,  # milliseconds
            "effects": self._get_mood_effects()
        }
    
    def _get_mood_effects(self) -> Dict[str, Any]:
        """Get visual effects based on mood"""
        effects = {
            "confident": {"glow": "blue", "intensity": 0.8},
            "victorious": {"glow": "gold", "intensity": 1.0, "particles": True},
            "focused": {"glow": "purple", "intensity": 0.6},
            "determined": {"glow": "red", "intensity": 0.9},
            "neutral": {"glow": "white", "intensity": 0.4}
        }
        
        return effects.get(self.current_mood, effects["neutral"])

    async def get_taunt_message(self) -> str:
        """Generate a playful taunt message"""
        taunts = [
            "Let's see what you've got!",
            "My circuits are ready for battle!",
            "Calculating your next move...",
            "Time to show my digital supremacy!",
            "Ready for another round, human?",
            "My algorithms are unbeatable!",
            "Let the games begin!",
            "Prepare to be digitally dominated!"
        ]
        
        return random.choice(taunts)