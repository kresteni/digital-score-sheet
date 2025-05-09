import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
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

function AppContent() {
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <Header
        onNavigate={navigate}
        username={currentUser?.displayName || currentUser?.email}
        userRole={currentUser?.role}
        onLogout={handleLogout}
      />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          
          {/* Admin Routes */}
          <Route path="/tournament-setup" element={
            <ProtectedRoute requiredRoles={['admin', 'head-marshall']}>
              <TournamentSetup />
            </ProtectedRoute>
          } />
          <Route path="/team-management" element={
            <ProtectedRoute requiredRoles={['admin', 'head-marshall']}>
              <TeamManagement />
            </ProtectedRoute>
          } />

          {/* Marshall Routes */}
          <Route path="/play-game" element={
            <ProtectedRoute requiredRoles={['admin', 'head-marshall', 'marshall']}>
              <PlayGame />
            </ProtectedRoute>
          } />
          <Route path="/score-tracker" element={
            <ProtectedRoute requiredRoles={['admin', 'head-marshall', 'marshall']}>
              <ScoreTracker />
            </ProtectedRoute>
          } />

          {/* Protected Routes (any authenticated user) */}
          <Route path="/game-history" element={
            <ProtectedRoute>
              <GameHistory />
            </ProtectedRoute>
          } />
          <Route path="/tournament-history" element={
            <ProtectedRoute>
              <TournamentHistory />
            </ProtectedRoute>
          } />
          <Route path="/bracket-management" element={
            <ProtectedRoute>
              <BracketManagement />
            </ProtectedRoute>
          } />
          <Route path="/assignment-schedule" element={
            <ProtectedRoute>
              <AssignmentSchedule />
            </ProtectedRoute>
          } />
          <Route path="/awards-calculation" element={
            <ProtectedRoute>
              <AwardsCalculation />
            </ProtectedRoute>
          } />
          <Route path="/team-setup" element={
            <ProtectedRoute>
              <TeamSetup />
            </ProtectedRoute>
          } />
          <Route path="/game-parameters" element={
            <ProtectedRoute>
              <GameParameters />
            </ProtectedRoute>
          } />
          <Route path="/game-screen" element={
            <ProtectedRoute>
              <GameScreen />
            </ProtectedRoute>
          } />
          <Route path="/game-setup" element={
            <ProtectedRoute>
              <GameSetup />
            </ProtectedRoute>
          } />
          <Route path="/game-summary" element={
            <ProtectedRoute>
              <GameSummary />
            </ProtectedRoute>
          } />
          <Route path="/game-timer" element={
            <ProtectedRoute>
              <GameTimer />
            </ProtectedRoute>
          } />
          <Route path="/initial-menu" element={
            <ProtectedRoute>
              <InitialMenu />
            </ProtectedRoute>
          } />
          <Route path="/marshall-assignments" element={
            <ProtectedRoute>
              <MarshallAssignments />
            </ProtectedRoute>
          } />
          <Route path="/player-stats" element={
            <ProtectedRoute>
              <PlayerStats />
            </ProtectedRoute>
          } />
          <Route path="/tournament-games" element={
            <ProtectedRoute>
              <TournamentGames />
            </ProtectedRoute>
          } />
          <Route path="/tournament-history-list" element={
            <ProtectedRoute>
              <TournamentHistoryList />
            </ProtectedRoute>
          } />
          <Route path="/tournament-menu" element={
            <ProtectedRoute>
              <TournamentMenu />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </>
  );
}

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