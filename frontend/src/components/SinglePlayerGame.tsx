import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { 
  ArrowLeft, 
  RotateCcw, 
  Trophy,
  Zap
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
  const [gameStarted, setGameStarted] = useState(false);
  const [totalRounds, setTotalRounds] = useState(3);
  const [currentRound, setCurrentRound] = useState(1);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  
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
  } = useWebcamGesture({ onGestureDetected, confidenceThreshold: 0.6 });

  // Auto-start first round when game starts
  useEffect(() => {
    if (gameStarted && !gameFinished && currentRound === 1 && !isPlaying && !showResult) {
      handleStartRound();
    }
  }, [gameStarted, gameFinished, currentRound, isPlaying, showResult]);

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
    
    // Show result immediately with player move
    setShowResult(true);
    
    // Start AI processing after result is shown
    setTimeout(async () => {
      setAiAnimation('deciding');
      
      try {
        const gameMove: GameMove = {
          move: move as 'rock' | 'paper' | 'scissors'
        };
        
        const result = await makeMove(gameMove);
        
        if (result) {
          setAiMove(result.ai_move || 'rock');
          setRoundResult(result.result);
          
          // Update scores
          if (result.result === 'player1') {
            setPlayerScore(prev => prev + 1);
          } else if (result.result === 'player2') {
            setAiScore(prev => prev + 1);
          }
          
          // Set AI animation based on result
          if (result.result === 'player2') {
            setAiAnimation('victory');
          } else if (result.result === 'player1') {
            setAiAnimation('defeat');
          } else {
            setAiAnimation('neutral');
          }
          
          // Auto-start next round after additional delay for full result experience, or finish game
          setTimeout(() => {
            if (currentRound >= totalRounds) {
              setGameFinished(true);
            } else {
              setCurrentRound(prev => prev + 1);
              handleStartRound();
            }
          }, 4000); // Additional 4 seconds after AI reveals move
        }
      } catch (error) {
        console.error('Error making move:', error);
      } finally {
        setIsPlaying(false);
      }
    }, 1000); // 1 second delay before AI starts analyzing
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
    setGameStarted(false);
    setCurrentRound(1);
    setPlayerScore(0);
    setAiScore(0);
    setGameFinished(false);
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
    if (!roundResult) {
      return aiAnimation === 'deciding' ? 'AI is analyzing...' : 'Waiting for AI...';
    }
    
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
    if (!roundResult) return 'text-blue-600'; // Thinking color
    
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
      <AnimatePresence mode="wait">
        {!gameStarted ? (
          // Rounds Selection Screen
          <motion.div
            key="rounds-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center min-h-screen"
          >
            {/* Back Button */}
            <motion.button
              onClick={() => navigate('/modes')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 text-amber-700 hover:text-amber-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </motion.button>

            {/* Title */}
            <motion.h1
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold text-amber-800 mb-8 text-center font-orbitron"
            >
              Choose Rounds
            </motion.h1>

            {/* Rounds Selection */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-amber-200 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-amber-800 mb-6 text-center">How many rounds?</h2>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[3, 5, 7, 10].map((rounds) => (
                  <motion.button
                    key={rounds}
                    onClick={() => setTotalRounds(rounds)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-4 rounded-xl font-bold text-lg transition-all ${
                      totalRounds === rounds
                        ? 'bg-amber-500 text-white shadow-lg'
                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    }`}
                  >
                    {rounds} Rounds
                  </motion.button>
                ))}
              </div>

              {/* Custom Rounds Input */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-amber-700 mb-2 text-center">
                  Or enter custom rounds:
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={totalRounds}
                  onChange={(e) => setTotalRounds(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                  className="w-full px-4 py-2 text-center text-xl font-bold border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              {/* Start Game Button */}
              <motion.button
                onClick={() => setGameStarted(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Start {totalRounds} Round Battle!
              </motion.button>

              <p className="text-xs text-amber-600 mt-4 text-center">
                First to win {Math.ceil(totalRounds / 2)} rounds becomes champion!
              </p>
            </motion.div>
          </motion.div>
        ) : (
          // Game Screen
          <motion.div
            key="game-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            {/* Existing game content goes here */}
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <motion.button
                onClick={() => setGameStarted(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 text-amber-700 hover:text-amber-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Change Rounds
              </motion.button>

              <div className="text-center">
                <h1 className="text-3xl font-bold text-amber-800 font-orbitron">Battle Arena</h1>
                <p className="text-amber-600">Round {currentRound} of {totalRounds} | You: {playerScore} - AI: {aiScore}</p>
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
            {lastGesture && lastGesture.detected ? (
              <div className="absolute bottom-2 left-2 bg-green-600/90 text-white px-3 py-1 rounded-lg text-sm">
                {lastGesture.gesture} ({Math.round(lastGesture.confidence * 100)}%)
              </div>
            ) : (
              <div className="absolute bottom-2 left-2 bg-yellow-600/90 text-white px-3 py-1 rounded-lg text-sm">
                Show hand gesture
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
        {showResult && (
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

      {/* Game Finished Screen */}
      <AnimatePresence>
        {gameFinished && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-md"
            >
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-amber-800 mb-4">
                🎉 Game Complete! 🎉
              </h2>
              <p className="text-xl text-amber-700 mb-6">
                {playerScore > aiScore ? 'You Win!' : playerScore < aiScore ? 'AI Wins!' : 'It\'s a Tie!'}
              </p>
              <p className="text-amber-600 mb-6">
                Final Score: {playerScore} - {aiScore}
              </p>
              <motion.button
                onClick={handleResetGame}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-full font-bold"
              >
                Play Again
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
        )}
    </AnimatePresence>
    </div>
  );
};

export default SinglePlayerGame;