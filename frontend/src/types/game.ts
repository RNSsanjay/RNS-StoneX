export interface GameMove {
  move: 'rock' | 'paper' | 'scissors';
  player_id?: string;
  confidence?: number;
}

export interface GameState {
  id: string;
  mode: 'single' | 'multiplayer';
  status: 'waiting' | 'active' | 'finished';
  player1_score: number;
  player2_score: number;
  round_number: number;
  history: GameRound[];
  created_at: string;
  updated_at?: string;
}

export interface GameRound {
  round: number;
  player1_move: string;
  player2_move: string;
  result: 'player1' | 'player2' | 'tie';
  timestamp: string;
}

export interface AIResponse {
  move: 'rock' | 'paper' | 'scissors';
  reasoning?: string;
  animation_state?: string;
  confidence: number;
}

export interface HandGesture {
  gesture: 'rock' | 'paper' | 'scissors' | 'none';
  confidence: number;
  detected: boolean;
  landmarks?: number[][];
}

export interface Player {
  id: string;
  name: string;
  score: number;
  is_ai: boolean;
}

export interface GameResult {
  player_move: string;
  ai_move?: string;
  opponent_move?: string;
  result: 'player1' | 'player2' | 'tie';
  score: {
    player: number;
    ai?: number;
    opponent?: number;
  };
}