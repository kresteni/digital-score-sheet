import React, { useState, useEffect } from "react";
import Header from "./Header";
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

const Home = () => {
  const [currentView, setCurrentView] = useState("role-selection");
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [gameData, setGameData] = useState(null);
  const [currentTournament, setCurrentTournament] = useState(null);
  const [showNoTournamentDialog, setShowNoTournamentDialog] = useState(false);
  const [tournamentHistory, setTournamentHistory] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(true);

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
            
            // Set the view to initial menu if already logged in
            setCurrentView("initial-menu");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
        setUsername("");
        setCurrentView("role-selection");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

  const handleNavigate = (route) => {
    // If not logged in, force authentication flow
    if (!isLoggedIn) {
      setCurrentView("role-selection");
      return;
    }

    switch (route) {
      case "/":
        setCurrentView("initial-menu");
        break;
      case "/current-tournament":
        if (currentTournament) {
          setCurrentView("tournament-menu");
        } else {
          setShowNoTournamentDialog(true);
        }
        break;
      case "/history":
        setCurrentView("tournament-history");
        break;
      default:
        setCurrentView("initial-menu");
    }
  };

  const handleRoleSelect = (role) => {
    setUserRole(role);
    setCurrentView("login");
  };

  const handleLogin = async (username, password) => {
    // Authentication is handled by Firebase Auth in the Login component
    // This function is called after successful authentication
    setIsLoggedIn(true);
    setUsername(username);
    
    // Fetch current tournament after login
    await checkCurrentTournament();
    await fetchGameHistory();
    await fetchTournamentHistory();
    
    setCurrentView("initial-menu");
  };

  const handleBackToRoleSelection = () => {
    setUserRole(null);
    setCurrentView("role-selection");
  };

  const handleLogout = () => {
    auth.signOut();
    setIsLoggedIn(false);
    setUsername("");
    setUserRole(null);
    setCurrentView("role-selection");
  };

  const handleNewGame = () => {
    setCurrentView("tournament-games");
  };

  const handleStartGame = (gameData) => {
    // Prepare game data for the game screen
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
    setCurrentView("game");
  };

  const handleGameStart = (data) => {
    if (data === null) {
      setCurrentView("initial-menu");
      return;
    }
    setGameData(data);
    setCurrentView("game");
  };

  const handleEndGame = async (finalGameData) => {
    setGameData(finalGameData);
    setCurrentView("summary");

    // Add game to history and update Firebase
    // This will be implemented in GameScreen component
    // Just update local state here
    await fetchGameHistory();
  };

  const handleViewGameDetails = (gameId) => {
    // Fetch game details by ID and set to current game
    const fetchGameDetails = async () => {
      try {
        const gameDoc = await getDoc(doc(db, "games", gameId));
        if (gameDoc.exists()) {
          setGameData(gameDoc.data());
          setCurrentView("summary");
        }
      } catch (error) {
        console.error("Error fetching game details:", error);
      }
    };
    
    fetchGameDetails();
  };

  const handleBackToHome = () => {
    setCurrentView("initial-menu");
  };

  const handleNewTournament = () => {
    setCurrentView("tournament-setup");
  };

  const handleCurrentTournament = () => {
    if (currentTournament) {
      setCurrentView("tournament-menu");
    } else {
      setShowNoTournamentDialog(true);
    }
  };

  const handleTournamentHistory = () => {
    setCurrentView("tournament-history");
  };

  const handleViewTournamentDetails = (tournamentId) => {
    // Fetch tournament details by ID
    const fetchTournamentDetails = async () => {
      try {
        const tournamentDoc = await getDoc(doc(db, "tournaments", tournamentId));
        if (tournamentDoc.exists()) {
          // Set as current tournament temporarily for viewing
          const tournamentData = tournamentDoc.data();
          
          // Fetch games for this tournament
          const gamesRef = collection(db, "games");
          const q = query(gamesRef, where("tournamentId", "==", tournamentId));
          const gamesSnapshot = await getDocs(q);
          const games = gamesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().gameDate || doc.data().createdAt?.toDate().toISOString().split("T")[0]
          }));
          
          setGameHistory(games);
          setCurrentView("history");
        }
      } catch (error) {
        console.error("Error fetching tournament details:", error);
      }
    };
    
    fetchTournamentDetails();
  };

  const handleSaveTournament = async (tournamentData) => {
    if (tournamentData === null) {
      setCurrentView("initial-menu");
      return;
    }

    // Save the tournament data and move to team management
    setCurrentTournament(tournamentData);
    setCurrentView("team-management");
    
    // Refresh current tournament data
    await checkCurrentTournament();
  };

  const handleSaveTeams = () => {
    // After team management, go to current tournament view
    setCurrentView("tournament-menu");
  };

  const handleFinishTournament = async () => {
    // Tournament is marked as finished in TournamentMenu component
    // Just update state here
    setCurrentTournament(null);
    
    // Refresh tournament history
    await fetchTournamentHistory();
    
    // Navigate back to initial menu
    setCurrentView("initial-menu");
  };

  const renderContent = () => {
    if (loading) {
      return <div className="flex items-center justify-center h-64">Loading...</div>;
    }
    
    switch (currentView) {
      case "role-selection":
        return <RoleSelection onRoleSelect={handleRoleSelect} />;
      case "login":
        return (
          <Login
            userRole={userRole}
            onLogin={handleLogin}
            onBack={handleBackToRoleSelection}
            onCreateAccount={() => setCurrentView("signup")}
            onNavigateToInitialMenu={() => setCurrentView("initial-menu")}
          />
        );
      case "signup":
        return (
          <SignUp
            onSignUp={(username, password, name, role) => {
              // In a real app, you would create the user account here
              // For now, we'll just log the user in
              setUserRole(role);
              setIsLoggedIn(true);
              setUsername(username);
              setCurrentView("initial-menu");
            }}
            onBack={() => setCurrentView("login")}
            onNavigateToInitialMenu={() => setCurrentView("initial-menu")}
          />
        );
      case "initial-menu":
        return (
          <InitialMenu
            onNewTournament={handleNewTournament}
            onCurrentTournament={handleCurrentTournament}
            onTournamentHistory={handleTournamentHistory}
            userRole={userRole}
          />
        );
      case "tournament-menu":
        return (
          <TournamentMenu
            onPlayGame={handleNewGame}
            onViewGameHistory={() => setCurrentView("history")}
            onBracketManagement={() => setCurrentView("bracket-management")}
            onMarshallAssignments={() => setCurrentView("marshall-assignments")}
            onAwardsCalculation={() => setCurrentView("awards-calculation")}
            onTournamentSetup={() => setCurrentView("tournament-setup")}
            onTeamManagement={() => setCurrentView("team-management")}
            onFinishTournament={handleFinishTournament}
            userRole={userRole}
            tournamentId={currentTournament?.id}
            tournamentName={currentTournament?.name || "Current Tournament"}
          />
        );
      case "tournament-games":
        return (
          <TournamentGames
            tournamentId={currentTournament?.id}
            onBack={() => setCurrentView("tournament-menu")}
            onStartGame={handleStartGame}
            userRole={userRole}
          />
        );
      case "tournament-history":
        return (
          <TournamentHistoryList
            tournaments={tournamentHistory}
            onViewTournament={handleViewTournamentDetails}
            onBack={() => setCurrentView("initial-menu")}
          />
        );
      case "home":
        // Redirect to initial-menu instead of showing HomeMenu
        setCurrentView("initial-menu");
        return null;
      case "setup":
        return <GameSetup onGameStart={handleGameStart} userRole={userRole} />;
      case "game":
        if (!gameData) return <div>Loading...</div>;
        return (
          <GameScreen
            teamAName={gameData.teamA.name}
            teamBName={gameData.teamB.name}
            teamAPlayers={gameData.teamA.players.map((p) => ({
              ...p,
              goals: 0,
              assists: 0,
            }))}
            teamBPlayers={gameData.teamB.players.map((p) => ({
              ...p,
              goals: 0,
              assists: 0,
            }))}
            initialGameTime={gameData.parameters.gameDuration * 60}
            initialTimeoutTime={gameData.parameters.timeoutDuration}
            initialHalftimeTime={gameData.parameters.halftimeDuration * 60}
            onEndGame={handleEndGame}
            tournamentId={currentTournament?.id}
          />
        );
      case "summary":
        if (!gameData) return <div>Loading...</div>;
        return (
          <GameSummary
            teamAName={gameData.teamA?.name || gameData.teamAName}
            teamBName={gameData.teamB?.name || gameData.teamBName}
            teamAScore={gameData.teamAScore || 0}
            teamBScore={gameData.teamBScore || 0}
            teamAPlayers={gameData.teamAPlayers || []}
            teamBPlayers={gameData.teamBPlayers || []}
            gameDuration={`${Math.floor((gameData.parameters?.gameDuration || 90) / 60)}h ${(gameData.parameters?.gameDuration || 90) % 60}m`}
            gameDate={
              gameData.gameDate
                ? new Date(gameData.gameDate).toLocaleDateString()
                : new Date().toLocaleDateString()
            }
            onBackToHome={handleBackToHome}
          />
        );
      case "history":
        return (
          <GameHistory
            games={gameHistory}
            onViewGameDetails={handleViewGameDetails}
            onBack={() => setCurrentView("tournament-menu")}
          />
        );
      case "tournament-setup":
        return (
          <TournamentSetup
            onSaveTournament={handleSaveTournament}
            userRole={userRole}
            existingTournament={currentTournament}
          />
        );
      case "team-management":
        return (
          <TeamManagement
            userRole={userRole}
            tournamentId={currentTournament?.id}
            onBack={() => setCurrentView("tournament-setup")}
            onComplete={handleSaveTeams}
          />
        );
      case "bracket-management":
        return <BracketManagement userRole={userRole} tournamentId={currentTournament?.id} onBack={() => setCurrentView("tournament-menu")} />;
      case "awards-calculation":
        return <AwardsCalculation userRole={userRole} tournamentId={currentTournament?.id} onBack={() => setCurrentView("tournament-menu")} />;
      case "marshall-assignments":
        return (
          <MarshallAssignments userRole={userRole} tournamentId={currentTournament?.id} onBack={() => setCurrentView("tournament-menu")} />
        );
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onNavigate={handleNavigate}
        userRole={isLoggedIn ? userRole : null}
        username={isLoggedIn ? username : ""}
        onLogout={handleLogout}
      />
      <main className="container mx-auto py-6">{renderContent()}</main>

      {/* No Current Tournament Dialog */}
      <Dialog
        open={showNoTournamentDialog}
        onOpenChange={setShowNoTournamentDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Current Tournament</DialogTitle>
            <DialogDescription>
              There is no active tournament. Please create a new tournament
              first.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => {
                setShowNoTournamentDialog(false);
                setCurrentView("initial-menu");
              }}
            >
              Back to Menu
            </Button>
            {userRole === "head-marshall" && (
              <Button
                onClick={() => {
                  setShowNoTournamentDialog(false);
                  handleNewTournament();
                }}
              >
                Create Tournament
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;