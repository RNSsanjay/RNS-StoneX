import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bot, Users, ArrowLeft } from 'lucide-react';

const GameModeSelection = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-amber-300 rounded-full"></div>
        <div className="absolute top-20 right-20 w-24 h-24 border-4 border-orange-300 rotate-45"></div>
        <div className="absolute bottom-20 left-1/3 w-28 h-28 border-4 border-yellow-300 rounded-full"></div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4"
      >
        {/* Back Button */}
        <motion.button
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 text-amber-700 hover:text-amber-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </motion.button>

        {/* Title */}
        <motion.h1
          variants={cardVariants}
          className="text-4xl md:text-6xl font-bold text-amber-800 mb-4 text-center font-orbitron"
        >
          Choose Your Battle
        </motion.h1>
        
        <motion.p
          variants={cardVariants}
          className="text-xl text-amber-600 mb-12 text-center max-w-md"
        >
          Select your preferred game mode and prepare for an epic Stone Paper Scissors showdown!
        </motion.p>

        {/* Mode Cards */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full"
        >
          {/* AI Mode */}
          <motion.div
            variants={cardVariants}
            whileHover={{ scale: 1.03, y: -10 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/single-player')}
            className="cursor-pointer bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-2 border-amber-200 hover:border-amber-300 transition-all group"
          >
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Bot className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-amber-800 mb-4">Play with Agent</h2>
              
              <p className="text-amber-600 mb-6 leading-relaxed">
                Challenge our advanced AI powered by Gemini 2.0 Flash. Watch as RoboStone 
                analyzes your patterns and adapts its strategy in real-time!
              </p>
              
              <div className="space-y-2 text-sm text-amber-700">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Strategic AI Opponent</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Animated Robot Character</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Hand Gesture Recognition</span>
                </div>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold"
              >
                Start Battle
              </motion.div>
            </div>
          </motion.div>

          {/* Multiplayer Mode */}
          <motion.div
            variants={cardVariants}
            whileHover={{ scale: 1.03, y: -10 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/multiplayer')}
            className="cursor-pointer bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-2 border-amber-200 hover:border-amber-300 transition-all group"
          >
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-amber-800 mb-4">Play with Friends</h2>
              
              <p className="text-amber-600 mb-6 leading-relaxed">
                Face off against your friends in split-screen mode! Two cameras, 
                two players, endless fun. See who's the ultimate champion!
              </p>
              
              <div className="space-y-2 text-sm text-amber-700">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Split-Screen Camera View</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Real-time Score Tracking</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Dual Hand Detection</span>
                </div>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-full font-semibold"
              >
                Challenge Friend
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          variants={cardVariants}
          className="mt-12 text-center text-amber-600 max-w-2xl"
        >
          <p className="text-sm leading-relaxed">
            Both modes feature advanced hand gesture recognition using your camera. 
            Make sure you have good lighting and position your hands clearly in front of the camera for the best experience.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GameModeSelection;