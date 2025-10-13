import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Sparkles, Zap, Trophy } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const titleVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={floatingAnimation}
          className="absolute top-20 left-10 w-20 h-20 bg-amber-200 rounded-full opacity-20"
        />
        <motion.div
          animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 1 } }}
          className="absolute top-40 right-20 w-16 h-16 bg-orange-300 rounded-full opacity-20"
        />
        <motion.div
          animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 2 } }}
          className="absolute bottom-32 left-1/4 w-12 h-12 bg-yellow-200 rounded-full opacity-20"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4"
      >
        {/* Logo/Title Section */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.h1
            variants={titleVariants}
            className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-amber-800 font-orbitron mb-4"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            RNS
          </motion.h1>
          
          <motion.div
            variants={titleVariants}
            className="relative"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-amber-800 font-orbitron mb-2">
              StoneX
            </h2>
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 1, -1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-2 -right-8"
            >
              <Sparkles className="w-8 h-8 text-yellow-500" />
            </motion.div>
          </motion.div>
          
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-amber-700 font-medium mt-4"
          >
            Professional Stone Paper Scissors Experience
          </motion.p>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg border border-amber-200"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-amber-800 mb-2">AI Powered</h3>
            <p className="text-amber-600 text-sm">Battle against advanced AI with strategic thinking</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg border border-amber-200"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-amber-800 mb-2">Hand Gestures</h3>
            <p className="text-amber-600 text-sm">Play with your hands using camera recognition</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg border border-amber-200"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-amber-800 mb-2">Multiplayer</h3>
            <p className="text-amber-600 text-sm">Challenge friends with split-screen camera mode</p>
          </motion.div>
        </motion.div>

        {/* CTA Button */}
        <motion.div variants={itemVariants}>
          <motion.button
            onClick={() => navigate('/modes')}
            whileHover={{ 
              scale: 1.1,
              boxShadow: "0 20px 40px rgba(245, 158, 11, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-12 py-4 text-xl font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-full shadow-2xl overflow-hidden transition-all duration-300"
          >
            {/* Button Background Animation */}
            <motion.div
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
            
            <div className="relative flex items-center gap-3">
              <Play className="w-6 h-6 group-hover:animate-pulse" />
              Play Now
            </div>
          </motion.button>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-amber-600 mt-8 text-center max-w-md"
        >
          Experience the classic game with cutting-edge technology. 
          Choose your mode and let the battle begin!
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LandingPage;