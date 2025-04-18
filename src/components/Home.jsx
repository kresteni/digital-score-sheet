import React, { useState } from "react";
import Header from "./Header";
import HomeMenu from "./HomeMenu";
import GameSetup from "./GameSetup";
import GameScreen from "./GameScreen";
import GameSummary from "./GameSummary";
import GameHistory from "./GameHistory";
import Settings from "./Settings";
import RoleSelection from "./RoleSelection";
import Login from "./Login";
import TournamentSetup from "./TournamentSetup";
import TeamManagement from "./TeamManagement";
import BracketManagement from "./BracketManagement";
import AwardsCalculation from "./AwardsCalculation";
import MarshallAssignments from "./MarshallAssignments";

const Home = () => {
  const [currentView, setCurrentView] = useState("role-selection");
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [gameData, setGameData] = useState(null);
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
        setCurrentView("home");
        break;
      case "/history":
        setCurrentView("history");
        break;
      case "/settings":
        setCurrentView("settings");
        break;
      default:
        setCurrentView("home");
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
      setCurrentView("home");
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
    setCurrentView("setup");
  };

  const handleGameStart = (data) => {
    if (data === null) {
      setCurrentView("home");
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
    setCurrentView("home");
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
          />
        );
      case "home":
        return (
          <HomeMenu
            onNewGame={handleNewGame}
            onViewHistory={() => setCurrentView("history")}
            onSettings={() => setCurrentView("settings")}
            onTournamentSetup={() => setCurrentView("tournament-setup")}
            onTeamManagement={() => setCurrentView("team-management")}
            onBracketManagement={() => setCurrentView("bracket-management")}
            onAwardsCalculation={() => setCurrentView("awards-calculation")}
            onMarshallAssignments={() => setCurrentView("marshall-assignments")}
            userRole={userRole}
          />
        );
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
            onSaveTournament={(data) => {
              if (data === null) {
                setCurrentView("home");
                return;
              }
              // Save tournament data and return to home
              setCurrentView("home");
            }}
            userRole={userRole}
          />
        );
      case "team-management":
        return <TeamManagement userRole={userRole} />;
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
    </div>
  );
};

export default Home;
