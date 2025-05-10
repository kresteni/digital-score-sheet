import React, { useState, useEffect } from "react";
import { Save, Flag, Share2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import ScoreTracker from "./ScoreTracker";
import GameTimer from "./GameTimer";
import PlayerStats from "./PlayerStats";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const GameScreen = () => {
  const { tournamentId, matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [gameInProgress, setGameInProgress] = useState(true);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameTime, setGameTime] = useState(2700); // default

  useEffect(() => {
    const fetchMatch = async () => {
      setLoading(true);
      try {
        const matchRef = doc(db, "matches", matchId);
        const matchSnap = await getDoc(matchRef);
        if (matchSnap.exists()) {
          const matchData = matchSnap.data();
          setMatch(matchData);
          setGameTime(matchData.gameParameters?.gameDuration * 60 || 2700);
        }
      } catch (error) {
        console.error("Error fetching match:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [matchId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!match) {
    return <div>Match not found</div>;
  }

  const handleScoreChange = (team, newScore) => {
    if (team === "A") {
      setScoreA(newScore);
    } else {
      setScoreB(newScore);
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
    setGameTime(match.gameParameters?.gameDuration * 60 - currentElapsedTime); // Update game time on pause
  };

  const handleEndGame = () => {
    setGameInProgress(false);
    const gameData = {
      teamAName: match.teamAName,
      teamBName: match.teamBName,
      teamAScore: scoreA,
      teamBScore: scoreB,
      teamAPlayers: match.teamAPlayers || [],
      teamBPlayers: match.teamBPlayers || [],
      gameDuration: elapsedTime > 0 ? elapsedTime : match.gameParameters?.gameDuration * 60 - gameTime,
      gameDate: new Date(),
    };
    // Implement the logic to save the game data to Firestore
  };

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
              {match.teamAName} vs {match.teamBName}
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
          teamAName={match.teamAName}
          teamBName={match.teamBName}
          teamAScore={scoreA}
          teamBScore={scoreB}
          onScoreChange={handleScoreChange}
        />

        {/* Game Timer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <GameTimer
              initialGameTime={match.gameParameters?.gameDuration * 60 || 2700}
              initialTimeoutTime={match.gameParameters?.timeoutDuration || 70}
              initialHalftimeTime={match.gameParameters?.halftimeDuration * 60 || 600}
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
                    <p className="text-2xl font-bold">{scoreA} - {scoreB}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Leading Team</p>
                    <p className="text-lg font-medium">
                      {scoreA > scoreB
                        ? match.teamAName
                        : scoreB > scoreA
                          ? match.teamBName
                          : "Tied"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Players</p>
                    <p className="text-lg font-medium">
                      {match.teamAPlayers?.length + match.teamBPlayers?.length}
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
          teamAPlayers={match.teamAPlayers || []}
          teamBPlayers={match.teamBPlayers || []}
          teamAName={match.teamAName}
          teamBName={match.teamBName}
          onRecordStat={(teamId, playerId, statType) => {
            // Implement the logic to record a stat for a player
          }}
        />
      </div>
    </div>
  );
};

export default GameScreen;
