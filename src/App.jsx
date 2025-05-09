import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
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
import { useAuth } from "./contexts/AuthContext";
import { auth } from "./firebase";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <pre className="text-left text-sm bg-gray-100 p-4 rounded mb-4 overflow-auto">
                {this.state.errorInfo.componentStack}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppContent = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Routes>
        {/* Public Routes */}
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            currentUser ? (
              <Home />
            ) : (
              <Navigate to="/role-selection" replace />
            )
          }
        />

        {/* Tournament Routes */}
        <Route
          path="/tournament/new/setup"
          element={
            currentUser ? (
              <TournamentSetup />
            ) : (
              <Navigate to="/role-selection" replace />
            )
          }
        />
        <Route
          path="/tournament/:tournamentId/setup"
          element={
            currentUser ? (
              <TournamentSetup />
            ) : (
              <Navigate to="/role-selection" replace />
            )
          }
        />
        <Route
          path="/tournament/:tournamentId/teams"
          element={
            currentUser ? (
              <TeamManagement />
            ) : (
              <Navigate to="/role-selection" replace />
            )
          }
        />
        <Route
          path="/tournament/:tournamentId/menu"
          element={
            currentUser ? (
              <TournamentMenu />
            ) : (
              <Navigate to="/role-selection" replace />
            )
          }
        />
        <Route
          path="/tournament/:tournamentId/brackets"
          element={
            currentUser ? (
              <BracketManagement />
            ) : (
              <Navigate to="/role-selection" replace />
            )
          }
        />
        <Route
          path="/tournament/:tournamentId/marshalls"
          element={
            currentUser ? (
              <MarshallAssignments />
            ) : (
              <Navigate to="/role-selection" replace />
            )
          }
        />
        <Route
          path="/tournament/:tournamentId/awards"
          element={
            currentUser ? (
              <AwardsCalculation />
            ) : (
              <Navigate to="/role-selection" replace />
            )
          }
        />

        {/* Game Routes */}
        <Route
          path="/tournament/:tournamentId/game/play"
          element={
            currentUser ? (
              <GameScreen />
            ) : (
              <Navigate to="/role-selection" replace />
            )
          }
        />
        <Route
          path="/tournament/:tournamentId/game/history"
          element={
            currentUser ? (
              <GameHistory />
            ) : (
              <Navigate to="/role-selection" replace />
            )
          }
        />
        <Route
          path="/tournament/:tournamentId/game/summary"
          element={
            currentUser ? (
              <GameSummary />
            ) : (
              <Navigate to="/role-selection" replace />
            )
          }
        />

        {/* Tournament History Route */}
        <Route
          path="/tournament-history"
          element={
            currentUser ? (
              <TournamentHistoryList />
            ) : (
              <Navigate to="/role-selection" replace />
            )
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
            </div>
          </div>
        }>
          <AppContent />
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;