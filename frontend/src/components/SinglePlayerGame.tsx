import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { 
  ArrowLeft, 
  Camera, 
  Play, 
  RotateCcw, 
  Trophy,
  Zap,
  Eye,
  Hand
} from 'lucide-react';
import { useGameState } from '../hooks/useGameState';
import { useWebcamGesture } from '../hooks/useWebcamGesture';
import type { GameMove, HandGesture } from '../types/game';

const SinglePlayerGame = () => {
  const navigate = useNavigate();
  const { gameState, loading, createGame, makeMove, resetGame } = useGameState({ mode: 'single' });
  
  const [playerMove, setPlayerMove] = useState<string | null>(null);
  const [aiMove, setAiMove] = useState<string | null>(null);
  const [roundResult, setRoundResult] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [aiAnimation, setAiAnimation] = useState<string>('idle');
  
  const onGestureDetected = useCallback((gesture: HandGesture) => {
    if (isPlaying && gesture.confidence > 0.7) {
      console.log('Gesture detected:', gesture);
      // Handle gesture detection during active game
    }
  }, [isPlaying]);

  const { 
    webcamRef, 
    isDetecting, 
    lastGesture, 
    startDetection, 
    stopDetection, 
    captureGesture 
  } = useWebcamGesture({ onGestureDetected, confidenceThreshold: 0.7 });

  // Initialize game on component mount
  useEffect(() => {
    createGame();
  }, [createGame]);

  const handleStartRound = async () => {
    setIsPlaying(true);
    setPlayerMove(null);
    setAiMove(null);
    setRoundResult(null);
    setShowResult(false);
    setAiAnimation('thinking');
    
    // Start countdown
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setCountdown(null);
    
    // Start gesture detection
    startDetection();
    
    // Give player time to make gesture
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Capture gesture
    const gesture = await captureGesture();
    stopDetection();
    
    // Process move
    await processMove(gesture.gesture);
  };

  const processMove = async (move: string) => {
    if (move === 'none') {
      // No gesture detected, use default
      move = 'rock';
    }
    
    setPlayerMove(move);
    setAiAnimation('deciding');
    
    try {
      const gameMove: GameMove = {
        move: move as 'rock' | 'paper' | 'scissors'
      };
      
      const result = await makeMove(gameMove);
      
      if (result) {
        setAiMove(result.ai_move || 'rock');
        setRoundResult(result.result);
        
        // Set AI animation based on result
        if (result.result === 'player2') {
          setAiAnimation('victory');
        } else if (result.result === 'player1') {
          setAiAnimation('defeat');
        } else {
          setAiAnimation('neutral');
        }
        
        setShowResult(true);
      }
    } catch (error) {
      console.error('Error making move:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleManualMove = (move: string) => {
    if (!isPlaying) {
      processMove(move);
    }
  };

  const handleResetGame = () => {
    resetGame();
    createGame();
    setPlayerMove(null);
    setAiMove(null);
    setRoundResult(null);
    setShowResult(false);
    setAiAnimation('idle');
  };

  const getMoveIcon = (move: string) => {
    switch (move) {
      case 'rock':
        return '✊';
      case 'paper':
        return '✋';
      case 'scissors':
        return '✌️';
      default:
        return '❓';
    }
  };

  const getResultMessage = () => {
    if (!roundResult) return '';
    
    switch (roundResult) {
      case 'player1':
        return 'You Win! 🎉';
      case 'player2':
        return 'AI Wins! 🤖';
      case 'tie':
        return "It's a Tie! 🤝";
      default:
        return '';
    }
  };

  const getResultColor = () => {
    switch (roundResult) {
      case 'player1':
        return 'text-green-600';
      case 'player2':
        return 'text-red-600';
      case 'tie':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <motion.button
          onClick={() => navigate('/modes')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 text-amber-700 hover:text-amber-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Modes
        </motion.button>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-amber-800 font-orbitron">Battle Arena</h1>
          <p className="text-amber-600">Player vs RoboStone AI</p>
        </div>
        
        <motion.button
          onClick={handleResetGame}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-200 text-amber-800 rounded-lg hover:bg-amber-300 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </motion.button>
      </div>

      {/* Score Display */}
      <div className="flex justify-center mb-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-amber-200">
          <div className="grid grid-cols-3 gap-8 items-center">
            {/* Player Score */}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {gameState?.player1_score || 0}
              </div>
              <div className="text-sm text-amber-700 font-medium">You</div>
            </div>
            
            {/* VS */}
            <div className="text-center">
              <div className="text-xl font-bold text-amber-600">VS</div>
              <div className="text-sm text-amber-500">Round {gameState?.round_number || 0}</div>
            </div>
            
            {/* AI Score */}
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {gameState?.player2_score || 0}
              </div>
              <div className="text-sm text-amber-700 font-medium">RoboStone</div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Player Side */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-amber-200"
        >
          <h2 className="text-2xl font-bold text-amber-800 mb-4 text-center">Your Move</h2>
          
          {/* Webcam */}
          <div className="relative mb-4 bg-gray-100 rounded-lg overflow-hidden">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className="w-full h-64 object-cover"
            />
            
            {/* Detection Status */}
            <div className="absolute top-2 right-2">
              <motion.div
                animate={{ scale: isDetecting ? [1, 1.2, 1] : 1 }}
                transition={{ repeat: isDetecting ? Infinity : 0, duration: 1 }}
                className={`w-3 h-3 rounded-full ${
                  isDetecting ? 'bg-red-500' : 'bg-gray-400'
                }`}
              />
            </div>
            
            {/* Gesture Feedback */}
            {lastGesture && lastGesture.detected && (
              <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                {lastGesture.gesture} ({Math.round(lastGesture.confidence * 100)}%)
              </div>
            )}
          </div>
          
          {/* Manual Move Buttons */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {['rock', 'paper', 'scissors'].map((move) => (
              <motion.button
                key={move}
                onClick={() => handleManualMove(move)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isPlaying}
                className={`p-4 rounded-lg border-2 transition-all ${
                  playerMove === move 
                    ? 'border-amber-500 bg-amber-100' 
                    : 'border-amber-200 hover:border-amber-300 bg-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="text-4xl mb-2">{getMoveIcon(move)}</div>
                <div className="text-sm font-medium capitalize">{move}</div>
              </motion.button>
            ))}
          </div>
          
          {/* Player Move Display */}
          <AnimatePresence>
            {playerMove && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="text-center p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg"
              >
                <div className="text-6xl mb-2">{getMoveIcon(playerMove)}</div>
                <div className="text-xl font-bold text-blue-800 capitalize">{playerMove}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* AI Side */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-amber-200"
        >
          <h2 className="text-2xl font-bold text-amber-800 mb-4 text-center">RoboStone AI</h2>
          
          {/* AI Character Display */}
          <div className="relative mb-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-8 h-64 flex items-center justify-center">
            <motion.div
              animate={{
                scale: aiAnimation === 'thinking' ? [1, 1.1, 1] : 1,
                rotate: aiAnimation === 'deciding' ? [0, 5, -5, 0] : 0
              }}
              transition={{ 
                repeat: ['thinking', 'deciding'].includes(aiAnimation) ? Infinity : 0, 
                duration: 1 
              }}
              className="text-8xl"
            >
              🤖
            </motion.div>
            
            {/* AI Status */}
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
              {aiAnimation === 'thinking' && 'Analyzing...'}
              {aiAnimation === 'deciding' && 'Calculating move...'}
              {aiAnimation === 'victory' && 'Victory calculated!'}
              {aiAnimation === 'defeat' && 'Recalibrating...'}
              {aiAnimation === 'idle' && 'Ready to battle'}
              {aiAnimation === 'neutral' && 'Good game!'}
            </div>
            
            {/* Power indicator */}
            <div className="absolute top-4 right-4">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Zap className="w-6 h-6 text-blue-400" />
              </motion.div>
            </div>
          </div>
          
          {/* AI Move Display */}
          <AnimatePresence>
            {aiMove && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="text-center p-4 bg-gradient-to-r from-red-100 to-red-200 rounded-lg"
              >
                <div className="text-6xl mb-2">{getMoveIcon(aiMove)}</div>
                <div className="text-xl font-bold text-red-800 capitalize">{aiMove}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Countdown Display */}
      <AnimatePresence>
        {countdown && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="text-9xl font-bold text-white"
            >
              {countdown}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Display */}
      <AnimatePresence>
        {showResult && roundResult && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-xl p-6 shadow-2xl border border-amber-200 z-40"
          >
            <div className={`text-2xl font-bold text-center mb-4 ${getResultColor()}`}>
              {getResultMessage()}
            </div>
            
            <div className="flex items-center justify-center gap-8 mb-4">
              <div className="text-center">
                <div className="text-4xl mb-2">{getMoveIcon(playerMove || '')}</div>
                <div className="text-sm text-amber-700">You</div>
              </div>
              
              <div className="text-2xl text-amber-600 font-bold">VS</div>
              
              <div className="text-center">
                <div className="text-4xl mb-2">{getMoveIcon(aiMove || '')}</div>
                <div className="text-sm text-amber-700">AI</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4">
        <motion.button
          onClick={handleStartRound}
          disabled={isPlaying || loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPlaying ? (
            <>
              <Eye className="w-5 h-5 animate-pulse" />
              Playing...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start Round
            </>
          )}
        </motion.button>
        
        <motion.button
          onClick={() => {
            if (isDetecting) {
              stopDetection();
            } else {
              startDetection();
            }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-lg ${
            isDetecting 
              ? 'bg-red-500 text-white' 
              : 'bg-blue-500 text-white'
          }`}
        >
          <Camera className="w-5 h-5" />
          {isDetecting ? 'Stop Detection' : 'Start Detection'}
        </motion.button>
      </div>
    </div>
  );
};

export default SinglePlayerGame;