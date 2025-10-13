import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { ArrowLeft, Camera, Play, RotateCcw, Users, Trophy } from 'lucide-react';

const MultiplayerGame = () => {
  const navigate = useNavigate();
  const webcam1Ref = useRef<any>(null);
  const webcam2Ref = useRef<any>(null);
  
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [roundNumber, setRoundNumber] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [player1Move, setPlayer1Move] = useState<string | null>(null);
  const [player2Move, setPlayer2Move] = useState<string | null>(null);
  const [roundResult, setRoundResult] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameHistory, setGameHistory] = useState<any[]>([]);

  const videoConstraints = {
    width: 320,
    height: 240,
    facingMode: "user"
  };

  const handleStartRound = async () => {
    setIsPlaying(true);
    setPlayer1Move(null);
    setPlayer2Move(null);
    setRoundResult(null);
    setShowResult(false);
    
    // Countdown
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setCountdown(null);
    
    // Give players time to make gestures
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // For demo purposes, use random moves
    const moves = ['rock', 'paper', 'scissors'];
    const p1Move = moves[Math.floor(Math.random() * moves.length)];
    const p2Move = moves[Math.floor(Math.random() * moves.length)];
    
    setPlayer1Move(p1Move);
    setPlayer2Move(p2Move);
    
    // Determine winner
    const result = determineWinner(p1Move, p2Move);
    setRoundResult(result);
    setRoundNumber(prev => prev + 1);
    
    // Update scores
    if (result === 'player1') {
      setPlayer1Score(prev => prev + 1);
    } else if (result === 'player2') {
      setPlayer2Score(prev => prev + 1);
    }
    
    // Update history
    setGameHistory(prev => [...prev, {
      round: roundNumber + 1,
      player1_move: p1Move,
      player2_move: p2Move,
      result,
      timestamp: new Date()
    }]);
    
    setShowResult(true);
    setIsPlaying(false);
  };

  const determineWinner = (move1: string, move2: string): string => {
    if (move1 === move2) return 'tie';
    
    const winningCombos = {
      rock: 'scissors',
      paper: 'rock',
      scissors: 'paper'
    };
    
    return winningCombos[move1 as keyof typeof winningCombos] === move2 ? 'player1' : 'player2';
  };

  const getMoveIcon = (move: string) => {
    switch (move) {
      case 'rock': return '✊';
      case 'paper': return '✋';
      case 'scissors': return '✌️';
      default: return '❓';
    }
  };

  const getResultMessage = () => {
    switch (roundResult) {
      case 'player1': return 'Player 1 Wins! 🎉';
      case 'player2': return 'Player 2 Wins! 🎉';
      case 'tie': return "It's a Tie! 🤝";
      default: return '';
    }
  };

  const getResultColor = () => {
    switch (roundResult) {
      case 'player1': return 'text-blue-600';
      case 'player2': return 'text-green-600';
      case 'tie': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const resetGame = () => {
    setPlayer1Score(0);
    setPlayer2Score(0);
    setRoundNumber(0);
    setPlayer1Move(null);
    setPlayer2Move(null);
    setRoundResult(null);
    setShowResult(false);
    setGameHistory([]);
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
          <h1 className="text-3xl font-bold text-amber-800 font-orbitron">Multiplayer Arena</h1>
          <p className="text-amber-600">Player 1 vs Player 2</p>
        </div>
        
        <motion.button
          onClick={resetGame}
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
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{player1Score}</div>
              <div className="text-sm text-amber-700 font-medium">Player 1</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-amber-600">VS</div>
              <div className="text-sm text-amber-500">Round {roundNumber}</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">{player2Score}</div>
              <div className="text-sm text-amber-700 font-medium">Player 2</div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Area - Split Screen */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
          
          {/* Player 1 Side */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-white/90 backdrop-blur-sm rounded-l-xl lg:rounded-r-none rounded-r-xl p-6 shadow-lg border border-amber-200 border-r-0 lg:border-r-2 border-r-amber-300"
          >
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-blue-800 flex items-center justify-center gap-2">
                <Users className="w-6 h-6" />
                Player 1
              </h2>
              <p className="text-blue-600 text-sm">Left Side Camera</p>
            </div>
            
            {/* Player 1 Camera */}
            <div className="relative mb-4 bg-blue-100 rounded-lg overflow-hidden border-4 border-blue-200">
              <Webcam
                ref={webcam1Ref}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="w-full h-64 object-cover transform scale-x-[-1]"
                mirrored
              />
              
              <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-sm font-bold">
                P1
              </div>
              
              {/* Detection indicator */}
              <div className="absolute top-2 right-2">
                <motion.div
                  animate={{ scale: isPlaying ? [1, 1.2, 1] : 1 }}
                  transition={{ repeat: isPlaying ? Infinity : 0, duration: 1 }}
                  className={`w-3 h-3 rounded-full ${
                    isPlaying ? 'bg-red-500' : 'bg-gray-400'
                  }`}
                />
              </div>
            </div>
            
            {/* Player 1 Move Display */}
            <AnimatePresence>
              {player1Move && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="text-center p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg"
                >
                  <div className="text-6xl mb-2">{getMoveIcon(player1Move)}</div>
                  <div className="text-xl font-bold text-blue-800 capitalize">{player1Move}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Player 2 Side */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-white/90 backdrop-blur-sm rounded-r-xl lg:rounded-l-none rounded-l-xl p-6 shadow-lg border border-amber-200"
          >
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-green-800 flex items-center justify-center gap-2">
                <Users className="w-6 h-6" />
                Player 2
              </h2>
              <p className="text-green-600 text-sm">Right Side Camera</p>
            </div>
            
            {/* Player 2 Camera */}
            <div className="relative mb-4 bg-green-100 rounded-lg overflow-hidden border-4 border-green-200">
              <Webcam
                ref={webcam2Ref}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="w-full h-64 object-cover transform scale-x-[-1]"
                mirrored
              />
              
              <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-sm font-bold">
                P2
              </div>
              
              {/* Detection indicator */}
              <div className="absolute top-2 right-2">
                <motion.div
                  animate={{ scale: isPlaying ? [1, 1.2, 1] : 1 }}
                  transition={{ repeat: isPlaying ? Infinity : 0, duration: 1 }}
                  className={`w-3 h-3 rounded-full ${
                    isPlaying ? 'bg-red-500' : 'bg-gray-400'
                  }`}
                />
              </div>
            </div>
            
            {/* Player 2 Move Display */}
            <AnimatePresence>
              {player2Move && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="text-center p-4 bg-gradient-to-r from-green-100 to-green-200 rounded-lg"
                >
                  <div className="text-6xl mb-2">{getMoveIcon(player2Move)}</div>
                  <div className="text-xl font-bold text-green-800 capitalize">{player2Move}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-4xl mx-auto mt-8 text-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-amber-200">
          <h3 className="text-lg font-bold text-amber-800 mb-2">How to Play</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-amber-700">
            <div>
              <div className="text-2xl mb-2">✊</div>
              <p><strong>Rock:</strong> Make a fist</p>
            </div>
            <div>
              <div className="text-2xl mb-2">✋</div>
              <p><strong>Paper:</strong> Open hand flat</p>
            </div>
            <div>
              <div className="text-2xl mb-2">✌️</div>
              <p><strong>Scissors:</strong> Peace sign</p>
            </div>
          </div>
          <p className="mt-4 text-amber-600">
            Position yourselves in front of your respective cameras and wait for the countdown!
          </p>
        </div>
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
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-xl p-6 shadow-2xl border border-amber-200 z-40 min-w-96"
          >
            <div className={`text-2xl font-bold text-center mb-4 ${getResultColor()}`}>
              {getResultMessage()}
            </div>
            
            <div className="flex items-center justify-center gap-8 mb-4">
              <div className="text-center">
                <div className="text-4xl mb-2">{getMoveIcon(player1Move || '')}</div>
                <div className="text-sm text-blue-700 font-bold">Player 1</div>
              </div>
              
              <div className="text-2xl text-amber-600 font-bold">VS</div>
              
              <div className="text-center">
                <div className="text-4xl mb-2">{getMoveIcon(player2Move || '')}</div>
                <div className="text-sm text-green-700 font-bold">Player 2</div>
              </div>
            </div>
            
            {/* Game Stats */}
            <div className="text-center text-sm text-amber-600">
              Score: {player1Score} - {player2Score} | Round {roundNumber}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Button */}
      <div className="fixed bottom-8 right-8">
        <motion.button
          onClick={handleStartRound}
          disabled={isPlaying}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPlaying ? (
            <>
              <Camera className="w-5 h-5 animate-pulse" />
              Playing...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start Round
            </>
          )}
        </motion.button>
      </div>

      {/* Championship Check */}
      <AnimatePresence>
        {(player1Score >= 5 || player2Score >= 5) && (
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
                🎉 Champion! 🎉
              </h2>
              <p className="text-xl text-amber-700 mb-6">
                {player1Score > player2Score ? 'Player 1' : 'Player 2'} Wins the Game!
              </p>
              <p className="text-amber-600 mb-6">
                Final Score: {player1Score} - {player2Score}
              </p>
              <motion.button
                onClick={resetGame}
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
    </div>
  );
};

export default MultiplayerGame;