import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import TeamSetup from "./TeamSetup";
import GameParameters from "./GameParameters";

const GameSetup = ({ onGameStart = () => {}, userRole = null }) => {

  const [step, setStep] = useState(1);
  const [teamA, setTeamA] = useState({
    name: "Team A",
    players: [
      { id: "1", name: "Player 1", number: "1" },
      { id: "2", name: "Player 2", number: "2" },
    ],
  });
  const [teamB, setTeamB] = useState({
    name: "Team B",
    players: [
      { id: "3", name: "Player 3", number: "3" },
      { id: "4", name: "Player 4", number: "4" },
    ],
  });
  const [gameParameters, setGameParameters] = useState({
    gameDuration: 90, // minutes
    pointsCap: 15,
    timeoutCount: 2,
    timeoutDuration: 70, // seconds
    halftimeDuration: 10, // minutes
  });

  const handleTeamANameChange = (name) => {
    setTeamA({ ...teamA, name });
  };

  const handleTeamBNameChange = (name) => {
    setTeamB({ ...teamB, name });
  };

  const handleTeamAPlayersChange = (players) => {
    setTeamA({ ...teamA, players });
  };

  const handleTeamBPlayersChange = (players) => {
    setTeamB({ ...teamB, players });
  };

  const handleGameParametersChange = (parameters) => {
    setGameParameters(parameters);
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      // Go back to home
      onGameStart(null);
    }
  };

  const handleStartGame = () => {
    const gameData = {
      teamA,
      teamB,
      parameters: gameParameters,
    };
    onGameStart(gameData);
  };

  // Display role message
  const roleMessage = userRole ? `Role: ${userRole}` : "No role selected";

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-background">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Game Setup</CardTitle>
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Display Role Message */}
          <div className="mb-4 text-center">
            <p>{roleMessage}</p>
          </div>

          <div className="space-y-6">
            {/* Progress Steps */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"}`}
                >
                  1
                </div>
                <div className="w-12 h-1 bg-primary/20">
                  <div
                    className={`h-full bg-primary ${step > 1 ? "w-full" : "w-0"}`}
                  ></div>
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 2 ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"}`}
                >
                  2
                </div>
                <div className="w-12 h-1 bg-primary/20">
                  <div
                    className={`h-full bg-primary ${step > 2 ? "w-full" : "w-0"}`}
                  ></div>
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 3 ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"}`}
                >
                  3
                </div>
              </div>
            </div>

            {/* Step 1: Team A Setup */}
            {step === 1 && (
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-semibold mb-4">Team A Setup</h2>
                <TeamSetup
                  teamName={teamA.name}
                  players={teamA.players}
                  onTeamNameChange={handleTeamANameChange}
                  onPlayersChange={handleTeamAPlayersChange}
                />
                <div className="mt-6">
                  <Button onClick={handleNext} className="w-32">
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Team B Setup */}
            {step === 2 && (
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-semibold mb-4">Team B Setup</h2>
                <TeamSetup
                  teamName={teamB.name}
                  players={teamB.players}
                  onTeamNameChange={handleTeamBNameChange}
                  onPlayersChange={handleTeamBPlayersChange}
                />
                <div className="mt-6 flex gap-4">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="w-32"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleNext} className="w-32">
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Game Parameters */}
            {step === 3 && (
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-semibold mb-4">Game Parameters</h2>
                <GameParameters
                  gameDuration={gameParameters.gameDuration}
                  pointsCap={gameParameters.pointsCap}
                  timeoutCount={gameParameters.timeoutCount}
                  timeoutDuration={gameParameters.timeoutDuration}
                  halftimeDuration={gameParameters.halftimeDuration}
                  onChange={handleGameParametersChange}
                />
                <div className="mt-6 flex gap-4">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="w-32"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleStartGame}
                    className="w-32 bg-green-600 hover:bg-green-700"
                  >
                    Start Game
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameSetup;
