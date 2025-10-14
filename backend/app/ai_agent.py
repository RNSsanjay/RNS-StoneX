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
        """Generate AI move using optimized strategic logic"""
        try:
            # Use enhanced strategic logic (much faster than LLM calls)
            ai_move = self._strategic_move(opponent_last_move, game_history or [])

            # Update mood based on move
            self._update_mood(ai_move, opponent_last_move)

            return ai_move

        except Exception as e:
            print(f"AI Agent error: {e}")
            # Fast fallback
            return self._fallback_strategy(opponent_last_move, game_history or [])
    
    def _prepare_game_context(self, opponent_last_move: Optional[str], game_history: List[Dict]) -> str:
        """Prepare optimized context for AI decision making (kept for future LLM integration)"""
        if not game_history:
            return "First round - no history"

        # Fast analysis of last 5 moves
        recent_moves = [round_data.get("player1_move", "") for round_data in game_history[-5:]]
        valid_moves = [m for m in recent_moves if m in ["rock", "paper", "scissors"]]

        if not valid_moves:
            return f"Last move: {opponent_last_move or 'none'}"

        # Quick frequency count
        counts = {"rock": valid_moves.count("rock"),
                 "paper": valid_moves.count("paper"),
                 "scissors": valid_moves.count("scissors")}

        return f"Moves: {valid_moves}, Counts: {counts}, Last: {opponent_last_move or 'none'}"
    
    def _strategic_move(self, opponent_last_move: Optional[str], game_history: List[Dict]) -> str:
        """Enhanced strategic AI move with improved pattern recognition and faster execution"""
        if not game_history:
            return random.choice(["rock", "paper", "scissors"])

        # Fast analysis of recent moves (last 7 rounds for better pattern detection)
        recent_moves = [round_data.get("player1_move", "") for round_data in game_history[-7:]]
        valid_moves = [move for move in recent_moves if move in ["rock", "paper", "scissors"]]

        if not valid_moves:
            return random.choice(["rock", "paper", "scissors"])

        # Calculate move frequencies and transitions
        move_counts = {"rock": 0, "paper": 0, "scissors": 0}
        transitions = {"rock": {"rock": 0, "paper": 0, "scissors": 0},
                      "paper": {"rock": 0, "paper": 0, "scissors": 0},
                      "scissors": {"rock": 0, "paper": 0, "scissors": 0}}

        prev_move = None
        for move in valid_moves:
            move_counts[move] += 1
            if prev_move:
                transitions[prev_move][move] += 1
            prev_move = move

        # Predict opponent's next move using multiple strategies
        predicted_moves = []

        # Strategy 1: Counter most frequent move (40% weight)
        if max(move_counts.values()) > 0:
            most_common = max(move_counts, key=move_counts.get)
            counters = {"rock": "paper", "paper": "scissors", "scissors": "rock"}
            predicted_moves.extend([counters[most_common]] * 4)

        # Strategy 2: Markov chain prediction (30% weight)
        if prev_move and sum(transitions[prev_move].values()) > 0:
            next_move = max(transitions[prev_move], key=transitions[prev_move].get)
            predicted_moves.extend([next_move] * 3)

        # Strategy 3: Counter last move (20% weight)
        if opponent_last_move:
            counters = {"rock": "paper", "paper": "scissors", "scissors": "rock"}
            predicted_moves.extend([counters[opponent_last_move]] * 2)

        # Strategy 4: Random for unpredictability (10% weight)
        predicted_moves.extend(random.choices(["rock", "paper", "scissors"], k=1))

        # Choose the most predicted move
        if predicted_moves:
            ai_move = max(set(predicted_moves), key=predicted_moves.count)
        else:
            ai_move = random.choice(["rock", "paper", "scissors"])

        # Add some randomness to prevent being too predictable (15% chance)
        if random.random() < 0.15:
            ai_move = random.choice(["rock", "paper", "scissors"])

        return ai_move
    
    def _fallback_strategy(self, opponent_last_move: Optional[str], game_history: List[Dict]) -> str:
        """Enhanced fallback strategy with better counter-play"""
        if not opponent_last_move:
            return random.choice(["rock", "paper", "scissors"])

        # Analyze recent history for fallback
        if game_history:
            recent_opponent_moves = [round_data.get("player1_move", "") for round_data in game_history[-3:]]
            recent_ai_moves = [round_data.get("player2_move", "") for round_data in game_history[-3:]]

            # Check if opponent is countering our moves
            counter_pattern = 0
            for i in range(len(recent_opponent_moves)):
                if i < len(recent_ai_moves):
                    ai_move = recent_ai_moves[i]
                    opp_move = recent_opponent_moves[i]
                    if opp_move in ["rock", "paper", "scissors"] and ai_move in ["rock", "paper", "scissors"]:
                        counters = {"rock": "paper", "paper": "scissors", "scissors": "rock"}
                        if opp_move == counters.get(ai_move):
                            counter_pattern += 1

            # If opponent is countering us, mix it up
            if counter_pattern >= 2:
                return random.choice(["rock", "paper", "scissors"])

        # Standard counter-strategy with higher success rate
        counters = {
            "rock": "paper",
            "paper": "scissors",
            "scissors": "rock"
        }

        # 80% chance to counter, 20% random for unpredictability
        if random.random() < 0.8:
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