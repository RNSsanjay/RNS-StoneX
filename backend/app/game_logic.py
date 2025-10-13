from typing import Tuple, Optional, List, Dict, Any
import random

class GameLogic:
    """Handles core game logic for Rock Paper Scissors"""
    
    def __init__(self):
        self.valid_moves = ["rock", "paper", "scissors"]
        self.winning_combinations = {
            ("rock", "scissors"),
            ("scissors", "paper"), 
            ("paper", "rock")
        }
    
    def determine_winner(self, move1: str, move2: str) -> str:
        """
        Determine the winner between two moves
        Returns: "player1", "player2", or "tie"
        """
        if not self.is_valid_move(move1) or not self.is_valid_move(move2):
            raise ValueError("Invalid move provided")
        
        if move1 == move2:
            return "tie"
        
        if (move1, move2) in self.winning_combinations:
            return "player1"
        else:
            return "player2"
    
    def is_valid_move(self, move: str) -> bool:
        """Check if a move is valid"""
        return move.lower() in self.valid_moves
    
    def get_counter_move(self, move: str) -> str:
        """Get the move that beats the given move"""
        counters = {
            "rock": "paper",
            "paper": "scissors",
            "scissors": "rock"
        }
        return counters.get(move.lower(), "rock")
    
    def analyze_pattern(self, moves: List[str]) -> Dict[str, Any]:
        """Analyze patterns in a series of moves"""
        if not moves:
            return {"pattern": "none", "prediction": "random"}
        
        # Count frequency
        move_counts = {"rock": 0, "paper": 0, "scissors": 0}
        for move in moves:
            if move in move_counts:
                move_counts[move] += 1
        
        # Find most common
        most_common = max(move_counts, key=move_counts.get)
        
        # Detect sequences
        sequences = self._detect_sequences(moves)
        
        # Predict next move based on patterns
        prediction = self._predict_next_move(moves, move_counts, sequences)
        
        return {
            "move_counts": move_counts,
            "most_common": most_common,
            "sequences": sequences,
            "prediction": prediction,
            "confidence": self._calculate_confidence(moves, prediction)
        }
    
    def _detect_sequences(self, moves: List[str]) -> List[str]:
        """Detect repeating sequences in moves"""
        sequences = []
        
        # Check for alternating patterns
        if len(moves) >= 4:
            if moves[-1] == moves[-3] and moves[-2] == moves[-4]:
                sequences.append("alternating")
        
        # Check for three-move cycles
        if len(moves) >= 6:
            if moves[-3:] == moves[-6:-3]:
                sequences.append("three_cycle")
        
        return sequences
    
    def _predict_next_move(self, moves: List[str], counts: Dict[str, int], sequences: List[str]) -> str:
        """Predict the next move based on analysis"""
        if not moves:
            return random.choice(self.valid_moves)
        
        # If alternating pattern detected
        if "alternating" in sequences and len(moves) >= 2:
            return moves[-2]
        
        # If three-cycle detected
        if "three_cycle" in sequences and len(moves) >= 3:
            cycle = moves[-3:]
            return cycle[len(moves) % 3]
        
        # Default to most common move
        return max(counts, key=counts.get) if any(counts.values()) else random.choice(self.valid_moves)
    
    def _calculate_confidence(self, moves: List[str], prediction: str) -> float:
        """Calculate confidence level for prediction"""
        if not moves:
            return 0.33  # Random chance
        
        # Base confidence on pattern strength
        pattern_strength = 0.33
        
        # Recent move frequency
        recent_moves = moves[-5:] if len(moves) >= 5 else moves
        prediction_count = recent_moves.count(prediction)
        pattern_strength = prediction_count / len(recent_moves) if recent_moves else 0.33
        
        return min(pattern_strength, 0.8)  # Cap at 80%
    
    def get_game_stats(self, history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate comprehensive game statistics"""
        if not history:
            return {"total_rounds": 0, "wins": {"player1": 0, "player2": 0, "ties": 0}}
        
        stats = {
            "total_rounds": len(history),
            "wins": {"player1": 0, "player2": 0, "ties": 0},
            "player1_moves": {"rock": 0, "paper": 0, "scissors": 0},
            "player2_moves": {"rock": 0, "paper": 0, "scissors": 0},
            "longest_streak": {"player": "none", "length": 0}
        }
        
        current_streak = {"player": "none", "length": 0}
        
        for round_data in history:
            result = round_data.get("result", "tie")
            stats["wins"][result] += 1
            
            # Count moves
            p1_move = round_data.get("player1_move", "")
            p2_move = round_data.get("player2_move", "")
            
            if p1_move in stats["player1_moves"]:
                stats["player1_moves"][p1_move] += 1
            if p2_move in stats["player2_moves"]:
                stats["player2_moves"][p2_move] += 1
            
            # Track streaks
            if result != "tie":
                if current_streak["player"] == result:
                    current_streak["length"] += 1
                else:
                    current_streak = {"player": result, "length": 1}
                
                if current_streak["length"] > stats["longest_streak"]["length"]:
                    stats["longest_streak"] = current_streak.copy()
        
        return stats