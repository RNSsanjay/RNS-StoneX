import { useState, useEffect, useCallback } from 'react';
import { gameAPI } from '../utils/api';
import type { GameState, GameMove, GameResult } from '../types/game';

interface UseGameStateProps {
  gameId?: string;
  mode: 'single' | 'multiplayer';
}

export const useGameState = ({ gameId, mode }: UseGameStateProps) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentGameId, setCurrentGameId] = useState<string | null>(gameId || null);

  // Create a new game
  const createGame = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await gameAPI.createGame(mode);
      setCurrentGameId(response.game_id);
      
      // Fetch the initial game state
      const initialState = await gameAPI.getGameState(response.game_id);
      setGameState(initialState);
      
      return response.game_id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create game';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mode]);

  // Fetch game state
  const fetchGameState = useCallback(async (gameId: string) => {
    if (!gameId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const state = await gameAPI.getGameState(gameId);
      setGameState(state);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch game state';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Make a move
  const makeMove = useCallback(async (move: GameMove): Promise<GameResult | null> => {
    if (!currentGameId) {
      setError('No active game');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await gameAPI.makeMove(currentGameId, move);
      
      // Refresh game state after move
      await fetchGameState(currentGameId);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to make move';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentGameId, fetchGameState]);

  // Reset game
  const resetGame = useCallback(() => {
    setGameState(null);
    setCurrentGameId(null);
    setError(null);
    setLoading(false);
  }, []);

  // Auto-fetch game state when gameId changes
  useEffect(() => {
    if (currentGameId) {
      fetchGameState(currentGameId);
    }
  }, [currentGameId, fetchGameState]);

  return {
    gameState,
    loading,
    error,
    gameId: currentGameId,
    createGame,
    fetchGameState,
    makeMove,
    resetGame,
    setGameId: setCurrentGameId
  };
};