import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import GameModeSelection from './components/GameModeSelection';
import SinglePlayerGame from './components/SinglePlayerGame';
import MultiplayerGame from './components/MultiplayerGame';
import './App.css';
0
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/modes" element={<GameModeSelection />} />
          <Route path="/single-player" element={<SinglePlayerGame />} />
          <Route path="/multiplayer" element={<MultiplayerGame />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
