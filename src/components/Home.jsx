import React, { useState, useEffect } from "react";
// import Header from "./Header"; // Removed duplicate header import
import GameSetup from "./GameSetup";
import GameScreen from "./GameScreen";
import GameSummary from "./GameSummary";
import GameHistory from "./GameHistory";
import RoleSelection from "./RoleSelection";
import Login from "./Login";
import SignUp from "./SignUp";
import TournamentSetup from "./TournamentSetup";
import TeamManagement from "./TeamManagement";
import BracketManagement from "./BracketManagement";
import AwardsCalculation from "./AwardsCalculation";
import MarshallAssignments from "./MarshallAssignments";
import InitialMenu from "./InitialMenu";
import TournamentMenu from "./TournamentMenu";
import TournamentHistoryList from "./TournamentHistoryList";
import TournamentGames from "./TournamentGames";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from "firebase/firestore";
import { useNavigate, Routes, Route, Navigate, useLocation } from "react-router-dom";

const Home = () => {
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [gameData, setGameData] = useState(null);
  const [currentTournament, setCurrentTournament] = useState(null);
  const [showNoTournamentDialog, setShowNoTournamentDialog] = useState(false);
  const [tournamentHistory, setTournamentHistory] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentView, setCurrentView] = useState("dashboard");
  const [createdTournament, setCreatedTournament] = useState(null);

  // Check authentication state and load user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role);
            setUsername(userData.displayName || user.email);
            setIsLoggedIn(true);
            
            // After successful login, check if there's a current tournament
            checkCurrentTournament();
            fetchGameHistory();
            fetchTournamentHistory();
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
        setUsername("");
        navigate("/role-selection");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch current active tournament
  const checkCurrentTournament = async () => {
    try {
      const tournamentsRef = collection(db, "tournaments");
      const q = query(
        tournamentsRef, 
        where("isFinished", "==", false),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const tournamentData = querySnapshot.docs[0].data();
        setCurrentTournament({
          id: querySnapshot.docs[0].id,
          ...tournamentData
        });
      } else {
        setCurrentTournament(null);
      }
    } catch (error) {
      console.error("Error checking current tournament:", error);
      setCurrentTournament(null);
    }
  };

  // Fetch tournament history
  const fetchTournamentHistory = async () => {
    try {
      const tournamentsRef = collection(db, "tournaments");
      const q = query(
        tournamentsRef, 
        where("isFinished", "==", true),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const tournaments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().endDate || doc.data().startDate
      }));
      
      setTournamentHistory(tournaments);
    } catch (error) {
      console.error("Error fetching tournament history:", error);
    }
  };

  // Fetch game history
  const fetchGameHistory = async () => {
    try {
      const gamesRef = collection(db, "games");
      const q = query(gamesRef, orderBy("createdAt", "desc"), limit(10));
      
      const querySnapshot = await getDocs(q);
      const games = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().gameDate || doc.data().createdAt?.toDate().toISOString().split("T")[0]
      }));
      
      setGameHistory(games);
    } catch (error) {
      console.error("Error fetching game history:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setIsLoggedIn(false);
      setUsername("");
      setUserRole(null);
      navigate("/role-selection");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleStartGame = (gameData) => {
    const preparedGameData = {
      teamA: {
        name: gameData.teamA,
        players: gameData.teamAPlayers || [
          { id: "1", name: "Player 1", number: "1" },
          { id: "2", name: "Player 2", number: "2" },
          { id: "3", name: "Player 3", number: "3" },
        ],
      },
      teamB: {
        name: gameData.teamB,
        players: gameData.teamBPlayers || [
          { id: "4", name: "Player 4", number: "1" },
          { id: "5", name: "Player 5", number: "2" },
          { id: "6", name: "Player 6", number: "3" },
        ],
      },
      parameters: {
        gameDuration: gameData.gameDuration || 90,
        timeoutDuration: gameData.timeoutDuration || 70,
        halftimeDuration: gameData.halftimeDuration || 10,
      },
      tournamentId: currentTournament?.id,
    };

    setGameData(preparedGameData);
    navigate("/game/play");
  };

  const handleFinishTournament = async () => {
    setCurrentTournament(null);
    await fetchTournamentHistory();
    navigate("/");
  };

  const handleViewGameDetails = async (gameId) => {
    try {
      const gameDoc = await getDoc(doc(db, "games", gameId));
      if (gameDoc.exists()) {
        setGameData(gameDoc.data());
        navigate("/game/summary");
      }
    } catch (error) {
      console.error("Error fetching game details:", error);
    }
  };

  const handleViewTournamentDetails = async (tournamentId) => {
    try {
      const tournamentDoc = await getDoc(doc(db, "tournaments", tournamentId));
      if (tournamentDoc.exists()) {
        const tournamentData = tournamentDoc.data();
        
        const gamesRef = collection(db, "games");
        const q = query(gamesRef, where("tournamentId", "==", tournamentId));
        const gamesSnapshot = await getDocs(q);
        const games = gamesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().gameDate || doc.data().createdAt?.toDate().toISOString().split("T")[0]
        }));
        
        setGameHistory(games);
        navigate("/game/history");
      }
    } catch (error) {
      console.error("Error fetching tournament details:", error);
    }
  };

  const handleNewTournament = () => {
    setCreatedTournament(null); // Reset any previous tournament
    setCurrentView("tournament-setup");
  };

  const handleCurrentTournament = () => {
    if (!currentTournament) {
      setShowNoTournamentDialog(true);
    } else {
      setCreatedTournament(currentTournament);
      setCurrentView("tournament-menu");
    }
  };

  const handleTournamentHistory = () => {
    navigate("/tournament-history");
  };

  const handleNewGame = () => {
    navigate("/game/play");
  };

  const handleEndGame = () => {
    navigate("/game/history");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleBackToRoleSelection = () => {
    navigate("/role-selection");
  };

  const handleSaveTournament = () => {
    // Implementation of handleSaveTournament
  };

  const handleSaveTeams = () => {
    // Implementation of handleSaveTeams
  };

  const handleRoleSelect = (role) => {
    setUserRole(role);
    navigate("/");
  };

  const handleLogin = () => {
    // Implementation of handleLogin
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const renderContent = () => {
    if (!isLoggedIn) {
      return <Navigate to="/role-selection" replace />;
    }

    if (!userRole) {
      return <Navigate to="/role-selection" replace />;
    }

    return null; // Let the Routes handle the content
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderContent()}
      
      <Routes>
        <Route path="/" element={<InitialMenu
          onNewTournament={handleNewTournament}
          onCurrentTournament={handleCurrentTournament}
          onTournamentHistory={handleTournamentHistory}
          userRole={userRole}
          currentTournament={currentTournament}
        />} />
        <Route path="/role-selection" element={<RoleSelection onRoleSelect={handleRoleSelect} />} />
        <Route path="/login" element={<Login
          userRole={userRole}
          onLogin={handleLogin}
          onBack={handleBackToRoleSelection}
          onCreateAccount={() => setCurrentView("signup")}
          onNavigateToInitialMenu={() => setCurrentView("initial-menu")}
        />} />
        <Route path="/signup" element={<SignUp
          onSignUp={(username, password, name, role) => {
            setUserRole(role);
            setIsLoggedIn(true);
            setUsername(username);
            setCurrentView("initial-menu");
          }}
          onBack={() => setCurrentView("login")}
          onNavigateToInitialMenu={() => setCurrentView("initial-menu")}
        />} />
        <Route path="/tournament/new" element={<TournamentSetup
          onSaveTournament={(tournamentData) => {
            setCreatedTournament(tournamentData); // Save the created tournament
            setCurrentView("team-setup");
          }}
          userRole={userRole}
          existingTournament={createdTournament}
        />} />
        <Route path="/tournament/current" element={<TournamentMenu
          userRole={userRole}
          tournamentId={createdTournament?.id}
          tournamentData={createdTournament}
          onFinishTournament={() => setCurrentView("dashboard")}
        />} />
        <Route path="/tournament/history" element={<TournamentHistoryList
          tournaments={tournamentHistory}
          onViewTournament={handleViewTournamentDetails}
          onBack={() => setCurrentView("initial-menu")}
        />} />
        <Route path="/tournament/setup" element={<TournamentSetup
          onSaveTournament={handleSaveTournament}
          userRole={userRole}
          existingTournament={currentTournament}
        />} />
        <Route path="/tournament/teams" element={<TeamManagement
          userRole={userRole}
          tournamentId={currentTournament?.id}
          onBack={() => setCurrentView("tournament-setup")}
          onComplete={handleSaveTeams}
          showDoneButton={true}
        />} />
        <Route path="/tournament/brackets" element={<BracketManagement
          userRole={userRole}
          tournamentId={currentTournament?.id}
          onBack={() => setCurrentView("tournament-menu")}
        />} />
        <Route path="/tournament/marshalls" element={<MarshallAssignments
          userRole={userRole}
          tournamentId={currentTournament?.id}
          onBack={() => setCurrentView("tournament-menu")}
        />} />
        <Route path="/tournament/awards" element={<AwardsCalculation
          userRole={userRole}
          tournamentId={currentTournament?.id}
          onBack={() => setCurrentView("tournament-menu")}
        />} />
        <Route path="/game/play" element={<GameScreen
          teamAName={gameData?.teamA?.name}
          teamBName={gameData?.teamB?.name}
          teamAPlayers={gameData?.teamA?.players}
          teamBPlayers={gameData?.teamB?.players}
          initialGameTime={gameData?.parameters?.gameDuration * 60}
          initialTimeoutTime={gameData?.parameters?.timeoutDuration}
          initialHalftimeTime={gameData?.parameters?.halftimeDuration * 60}
          onEndGame={handleEndGame}
          tournamentId={currentTournament?.id}
        />} />
        <Route path="/game/history" element={<GameHistory
          games={gameHistory}
          onViewGameDetails={handleViewGameDetails}
          onBack={() => setCurrentView("tournament-menu")}
        />} />
        <Route path="/game/summary" element={<GameSummary
          teamAName={gameData?.teamA?.name || gameData?.teamAName}
          teamBName={gameData?.teamB?.name || gameData?.teamBName}
          teamAScore={gameData?.teamAScore || 0}
          teamBScore={gameData?.teamBScore || 0}
          teamAPlayers={gameData?.teamAPlayers || []}
          teamBPlayers={gameData?.teamBPlayers || []}
          gameDuration={`${Math.floor((gameData?.parameters?.gameDuration || 90) / 60)}h ${(gameData?.parameters?.gameDuration || 90) % 60}m`}
          gameDate={gameData?.gameDate ? new Date(gameData.gameDate).toLocaleDateString() : new Date().toLocaleDateString()}
          onBackToHome={handleBackToHome}
        />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* No Current Tournament Dialog */}
      <Dialog
        open={showNoTournamentDialog}
        onOpenChange={setShowNoTournamentDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Current Tournament</DialogTitle>
            <DialogDescription>
              There is no active tournament. Please create a new tournament first.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => {
                setShowNoTournamentDialog(false);
                handleNewTournament(); // Start the new tournament flow
              }}
            >
              Create Tournament
            </Button>
            <Button
              onClick={() => setShowNoTournamentDialog(false)}
              variant="outline"
            >
              Back to Menu
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;