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
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/role-selection" element={<RoleSelection />} />

        {/* Default Route - Show Initial Menu */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <InitialMenu />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Head Marshall Only Routes */}
        <Route
          path="/tournament/new/setup"
          element={
            <ProtectedRoute requiredRole="head-marshall">
              <TournamentSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tournament/:tournamentId/setup"
          element={
            <ProtectedRoute requiredRole="head-marshall">
              <TournamentSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tournament/:tournamentId/teams"
          element={
            <ProtectedRoute requiredRole="head-marshall">
              <TeamManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tournament/:tournamentId/menu"
          element={
            <ProtectedRoute requiredRole="head-marshall">
              <TournamentMenu />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tournament/:tournamentId/brackets"
          element={
            <ProtectedRoute requiredRole="head-marshall">
              <BracketManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tournament/:tournamentId/marshalls"
          element={
            <ProtectedRoute requiredRole="head-marshall">
              <MarshallAssignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tournament/:tournamentId/awards"
          element={
            <ProtectedRoute requiredRole="head-marshall">
              <AwardsCalculation />
            </ProtectedRoute>
          }
        />

        {/* Game Routes - Accessible by both roles */}
        <Route
          path="/tournament/:tournamentId/game/play"
          element={
            <ProtectedRoute allowedRoles={["head-marshall", "marshall"]}>
              <GameScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tournament/:tournamentId/game/history"
          element={
            <ProtectedRoute allowedRoles={["head-marshall", "marshall"]}>
              <GameHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tournament/:tournamentId/game/summary"
          element={
            <ProtectedRoute allowedRoles={["head-marshall", "marshall"]}>
              <GameSummary />
            </ProtectedRoute>
          }
        />

        {/* Tournament History Route - Accessible by both roles */}
        <Route
          path="/tournament-history"
          element={
            <ProtectedRoute allowedRoles={["head-marshall", "marshall"]}>
              <TournamentHistoryList />
            </ProtectedRoute>
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