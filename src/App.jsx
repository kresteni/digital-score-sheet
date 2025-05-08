import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import Home from "./components/Home";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import TournamentSetup from "./components/TournamentSetup";
import TeamManagement from "./components/TeamManagement";
import PlayGame from "./components/PlayGame";
import GameHistory from "./components/GameHistory";
import TournamentHistory from "./components/TournamentHistory";
import BracketManagement from "./components/BracketManagement";
import AssignmentSchedule from "./components/AssignmentSchedule";
import AwardsCalculation from "./components/AwardsCalculation";
import TeamSetup from "./components/TeamSetup";
import RoleSelection from "./components/RoleSelection";
import GameParameters from "./components/GameParameters";
import GameScreen from "./components/GameScreen";
import GameSetup from "./components/GameSetup";
import GameSummary from "./components/GameSummary";
import GameTimer from "./components/GameTimer";
import Header from "./components/Header";
import InitialMenu from "./components/InitialMenu";
import MarshallAssignments from "./components/MarshallAssignments";
import PlayerStats from "./components/PlayerStats";
import ScoreTracker from "./components/ScoreTracker";
import TournamentGames from "./components/TournamentGames";
import TournamentHistoryList from "./components/TournamentHistoryList";
import TournamentMenu from "./components/TournamentMenu";


function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Home />} />
        <Route path="/tournament-setup" element={<TournamentSetup />} />
        <Route path="/team-management" element={<TeamManagement />} />
        <Route path="/play-game" element={<PlayGame />} />
        <Route path="/game-history" element={<GameHistory />} />
        <Route path="/tournament-history" element={<TournamentHistory />} />
        <Route path="/bracket-management" element={<BracketManagement />} />
        <Route path="/assignment-schedule" element={<AssignmentSchedule />} />
        <Route path="/awards-calculation" element={<AwardsCalculation />} />
        <Route path="/team-setup" element={<TeamSetup />} />
        <Route path="/game-parameters" element={<GameParameters />} />
        <Route path="/game-screen" element={<GameScreen />} />
        <Route path="/game-setup" element={<GameSetup />} />
        <Route path="/game-summary" element={<GameSummary />} />
        <Route path="/game-timer" element={<GameTimer />} />
        <Route path="/header" element={<Header />} />
        <Route path="/initial-menu" element={<InitialMenu />} />
        <Route path="/marshall-assignments" element={<MarshallAssignments />} />
        <Route path="/player-stats" element={<PlayerStats />} />
        <Route path="/score-tracker" element={<ScoreTracker />} />
        <Route path="/tournament-games" element={<TournamentGames />} />
        <Route path="/tournament-history-list" element={<TournamentHistoryList />} />
        <Route path="/tournament-menu" element={<TournamentMenu />} />
      </Routes>
    </Suspense>
  );
}

export default App;