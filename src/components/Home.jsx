import React, { useState } from "react";
import Header from "./Header";
import GameSetup from "./GameSetup";
import GameScreen from "./GameScreen";
import GameSummary from "./GameSummary";
import GameHistory from "./GameHistory";
import Settings from "./Settings";
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

const Home = () => {
  const [currentView, setCurrentView] = useState("role-selection");
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [gameData, setGameData] = useState(null);
  const [currentTournament, setCurrentTournament] = useState(null);
  const [showNoTournamentDialog, setShowNoTournamentDialog] = useState(false);
  const [tournamentHistory, setTournamentHistory] = useState([
    {
      id: "1",
      name: "Summer Championship 2023",
      date: "2023-06-15",
      winner: "Disc Jockeys",
      score: "15-12",
      location: "Central Park",
    },
    {
      id: "2",
      name: "Spring Tournament 2023",
      date: "2023-04-10",
      winner: "Sky Walkers",
      score: "15-13",
      location: "Riverside Fields",
    },
    {
      id: "3",
      name: "Winter Indoor Cup 2022",
      date: "2022-12-05",
      winner: "Wind Chasers",
      score: "15-11",
      location: "Sports Complex",
    },
  ]);
  const [gameHistory, setGameHistory] = useState([
    {
      id: "1",
      date: "2023-06-15",
      teamA: { name: "Disc Jockeys", score: 15 },
      teamB: { name: "Sky Walkers", score: 12 },
      duration: 87,
    },
    {
      id: "2",
      date: "2023-06-10",
      teamA: { name: "Wind Chasers", score: 13 },
      teamB: { name: "Disc Jockeys", score: 15 },
      duration: 92,
    },
    {
      id: "3",
      date: "2023-06-05",
      teamA: { name: "Sky Walkers", score: 15 },
      teamB: { name: "Wind Chasers", score: 11 },
      duration: 78,
    },
  ]);

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

  const handleLogin = (username, password) => {
    // In a real app, you would validate credentials against a backend
    // For this demo, we'll just accept any non-empty username/password
    if (username && password) {
      setIsLoggedIn(true);
      setUsername(username);
      setCurrentView("initial-menu");
    }
  };

  const handleBackToRoleSelection = () => {
    setUserRole(null);
    setCurrentView("role-selection");
  };

  const handleLogout = () => {
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
        players: [
          { id: "1", name: "Player 1", number: "1" },
          { id: "2", name: "Player 2", number: "2" },
          { id: "3", name: "Player 3", number: "3" },
        ],
      },
      teamB: {
        name: gameData.teamB,
        players: [
          { id: "4", name: "Player 4", number: "1" },
          { id: "5", name: "Player 5", number: "2" },
          { id: "6", name: "Player 6", number: "3" },
        ],
      },
      parameters: {
        gameDuration: 90,
        timeoutDuration: 70,
        halftimeDuration: 10,
      },
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

  const handleEndGame = (finalGameData) => {
    setGameData(finalGameData);
    setCurrentView("summary");

    // Add to game history
    const newHistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      teamA: {
        name: finalGameData.teamAName,
        score: finalGameData.teamAScore,
      },
      teamB: {
        name: finalGameData.teamBName,
        score: finalGameData.teamBScore,
      },
      duration: Math.floor(finalGameData.gameDuration / 60),
    };

    setGameHistory([newHistoryEntry, ...gameHistory]);
  };

  const handleViewGameDetails = (gameId) => {
    // In a real app, we would fetch the game details by ID
    // For now, we'll just navigate to the summary view
    setCurrentView("summary");
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
    // In a real app, we would set the current tournament based on the ID
    // For now, we'll just navigate to the game history view
    setCurrentView("history");
  };

  const handleSaveTournament = (tournamentData) => {
    if (tournamentData === null) {
      setCurrentView("initial-menu");
      return;
    }

    // Save the tournament data and move to team management
    setCurrentTournament(tournamentData);
    setCurrentView("team-management");
  };

  const handleSaveTeams = () => {
    // After team management, go to current tournament view
    setCurrentView("tournament-menu");
  };

  const handleFinishTournament = () => {
    // Add current tournament to history
    if (currentTournament) {
      const finishedTournament = {
        ...currentTournament,
        date: new Date().toISOString().split("T")[0],
        // In a real app, you would determine the winner and score
        winner: "TBD",
        score: "--",
      };

      setTournamentHistory([finishedTournament, ...tournamentHistory]);
      setCurrentTournament(null);
    }

    // Navigate back to initial menu
    setCurrentView("initial-menu");
  };

  const renderContent = () => {
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
          />
        );
      case "settings":
        return <Settings />;
      case "tournament-setup":
        return (
          <TournamentSetup
            onSaveTournament={handleSaveTournament}
            userRole={userRole}
          />
        );
      case "team-management":
        return (
          <TeamManagement
            userRole={userRole}
            tournamentId={currentTournament?.id}
            onBack={() => setCurrentView("tournament-setup")}
            onComplete={() => setCurrentView("tournament-menu")}
          />
        );
      case "bracket-management":
        return <BracketManagement userRole={userRole} />;
      case "awards-calculation":
        return <AwardsCalculation userRole={userRole} />;
      case "marshall-assignments":
        return (
          <MarshallAssignments userRole={userRole} onBack={handleBackToHome} />
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
