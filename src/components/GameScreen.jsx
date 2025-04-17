import React, { useState } from "react";
import { Save, Flag, Share2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import ScoreTracker from "./ScoreTracker";
import GameTimer from "./GameTimer";
import PlayerStats from "./PlayerStats";

const GameScreen = ({
  teamAName = "Team A",
  teamBName = "Team B",
  teamAPlayers = [
    { id: "1", name: "Alex Smith", goals: 0, assists: 0, blocks: 0 },
    { id: "2", name: "Jamie Johnson", goals: 0, assists: 0, blocks: 0 },
    { id: "3", name: "Taylor Brown", goals: 0, assists: 0, blocks: 0 },
  ],
  teamBPlayers = [
    { id: "4", name: "Jordan Lee", goals: 0, assists: 0, blocks: 0 },
    { id: "5", name: "Casey Wilson", goals: 0, assists: 0, blocks: 0 },
    { id: "6", name: "Riley Garcia", goals: 0, assists: 0, blocks: 0 },
  ],
  initialGameTime = 2700, // 45 minutes in seconds
  initialTimeoutTime = 70,
  initialHalftimeTime = 600, // 10 minutes in seconds
  onEndGame = () => {},
}) => {
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [playersA, setPlayersA] = useState(teamAPlayers);
  const [playersB, setPlayersB] = useState(teamBPlayers);
  const [gameInProgress, setGameInProgress] = useState(true);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const handleScoreChange = (team, newScore) => {
    if (team === "A") {
      setScoreA(newScore);
    } else {
      setScoreB(newScore);
    }
  };

  const handleAddPlayer = (teamId, playerName) => {
    const newPlayer = {
      id: Date.now().toString(),
      name: playerName,
      goals: 0,
      assists: 0,
      blocks: 0,
    };

    if (teamId === "A") {
      setPlayersA([...playersA, newPlayer]);
    } else {
      setPlayersB([...playersB, newPlayer]);
    }
  };

  const handleRecordStat = (teamId, playerId, statType) => {
    const statKey = statType === "block" ? "blocks" : statType + "s";

    if (teamId === "A") {
      const updatedPlayers = playersA.map((player) => {
        if (player.id === playerId) {
          return {
            ...player,
            [statKey]: (player[statKey] || 0) + 1,
          };
        }
        return player;
      });
      setPlayersA(updatedPlayers);

      // Auto-increment score for goals
      if (statType === "goal") {
        setScoreA(scoreA + 1);
      }
    } else {
      const updatedPlayers = playersB.map((player) => {
        if (player.id === playerId) {
          return {
            ...player,
            [statKey]: (player[statKey] || 0) + 1,
          };
        }
        return player;
      });
      setPlayersB(updatedPlayers);

      // Auto-increment score for goals
      if (statType === "goal") {
        setScoreB(scoreB + 1);
      }
    }
  };

  const handleTimeComplete = (timerType) => {
    if (timerType === "game") {
      // Game has ended
      setGameInProgress(false);
    }
  };

  const handleTimerStart = () => {
    if (!gameStartTime) {
      setGameStartTime(new Date());
    }
  };

  const handleTimerPause = (currentElapsedTime) => {
    setElapsedTime(currentElapsedTime);
  setGameTime(initialGameTime - currentElapsedTime); // Update game time on pause
  };

  const handleEndGame = () => {
    setGameInProgress(false);
    const gameData = {
      teamAName,
      teamBName,
      teamAScore: scoreA,
      teamBScore: scoreB,
      teamAPlayers: playersA,
      teamBPlayers: playersB,
      gameDuration: elapsedTime > 0 ? elapsedTime : initialGameTime - gameTime,
      gameDate: new Date(),
    };
    onEndGame(gameData);
  };

  const [gameTime, setGameTime] = useState(initialGameTime);

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Game Controls Header */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
            >
              Back
            </Button>
            <h1 className="text-2xl font-bold">
              {teamAName} vs {teamBName}
            </h1>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleEndGame}>
              <Flag className="mr-2 h-4 w-4" />
              End Game
            </Button>
            <Button variant="outline" size="sm">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Score Tracker */}
        <ScoreTracker
          teamAName={teamAName}
          teamBName={teamBName}
          teamAScore={scoreA}
          teamBScore={scoreB}
          onScoreChange={handleScoreChange}
        />

        {/* Game Timer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <GameTimer
              initialGameTime={initialGameTime}
              initialTimeoutTime={initialTimeoutTime}
              initialHalftimeTime={initialHalftimeTime}
              onTimeComplete={handleTimeComplete}
              onTimerStart={handleTimerStart}
              onTimerPause={handleTimerPause}
            />
          </div>
          <div className="md:col-span-2">
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Game Status</h2>
                  <div className="flex items-center">
                    <span
                      className={`inline-block w-3 h-3 rounded-full mr-2 ${gameInProgress ? "bg-green-500" : "bg-red-500"}`}
                    ></span>
                    <span>{gameInProgress ? "In Progress" : "Completed"}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Current Score</p>
                    <p className="text-lg font-medium">
                      {scoreA} - {scoreB}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Leading Team</p>
                    <p className="text-lg font-medium">
                      {scoreA > scoreB
                        ? teamAName
                        : scoreB > scoreA
                          ? teamBName
                          : "Tied"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Players</p>
                    <p className="text-lg font-medium">
                      {playersA.length + playersB.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Goals</p>
                    <p className="text-lg font-medium">{scoreA + scoreB}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Player Stats */}
        <PlayerStats
          teamAPlayers={playersA}
          teamBPlayers={playersB}
          teamAName={teamAName}
          teamBName={teamBName}
          onAddPlayer={handleAddPlayer}
          onRecordStat={handleRecordStat}
        />
      </div>
    </div>
  );
};

export default GameScreen;
