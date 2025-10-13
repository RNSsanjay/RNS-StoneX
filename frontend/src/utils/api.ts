import axios from 'axios';
import type { GameMove, GameState, GameResult, AIResponse } from '../types/game';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const gameAPI = {
  // Create a new game session
  createGame: async (mode: 'single' | 'multiplayer'): Promise<{ game_id: string; status: string }> => {
    const response = await api.post('/api/game/create', null, {
      params: { game_mode: mode }
    });
    return response.data;
  },

  // Get game state
  getGameState: async (gameId: string): Promise<GameState> => {
    const response = await api.get(`/api/game/${gameId}`);
    return response.data;
  },

  // Make a move in the game
  makeMove: async (gameId: string, move: GameMove): Promise<GameResult> => {
    const response = await api.post(`/api/game/${gameId}/move`, move);
    return response.data;
  },

  // Get AI move
  getAIMove: async (history?: any[]): Promise<AIResponse> => {
    const response = await api.post('/api/ai/get-move', { history });
    return response.data;
  },

  // Check API health
  healthCheck: async (): Promise<{ message: string; version: string }> => {
    const response = await api.get('/');
    return response.data;
  },
};

// Hand gesture recognition (assuming backend endpoint)
export const gestureAPI = {
  recognizeGesture: async (imageData: string) => {
    try {
      const response = await api.post('/api/gesture/recognize', {
        image_data: imageData
      });
      return response.data;
    } catch (error) {
      console.error('Gesture recognition error:', error);
      return {
        gesture: 'none',
        confidence: 0,
        detected: false
      };
    }
  }
};

export default api;