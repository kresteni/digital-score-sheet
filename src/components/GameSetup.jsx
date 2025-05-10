import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import TeamSetup from "./TeamSetup";
import GameParameters from "./GameParameters";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from "firebase/firestore";

const GameSetup = () => {
  const { tournamentId, matchId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [teamA, setTeamA] = useState(null);
  const [teamB, setTeamB] = useState(null);
  const [gameParameters, setGameParameters] = useState({
    gameDuration: 90,
    pointsCap: 15,
    timeoutCount: 2,
    timeoutDuration: 70,
    halftimeDuration: 10,
  });

  useEffect(() => {
    const fetchMatchAndTeams = async () => {
      setLoading(true);
      try {
        // Fetch match
        const matchRef = doc(db, "matches", matchId);
        const matchSnap = await getDoc(matchRef);
        if (!matchSnap.exists()) {
          setLoading(false);
          return;
        }
        const match = matchSnap.data();
        // Fetch teams from the global 'teams' collection
        const teamsRef = collection(db, "teams");
        const teamAQuery = query(teamsRef, where("id", "==", match.teamAId));
        const teamBQuery = query(teamsRef, where("id", "==", match.teamBId));
        const [teamASnap, teamBSnap] = await Promise.all([getDocs(teamAQuery), getDocs(teamBQuery)]);
        const teamA = teamASnap.docs[0]?.data() || { name: "Team A", players: [] };
        const teamB = teamBSnap.docs[0]?.data() || { name: "Team B", players: [] };
        setTeamA(teamA);
        setTeamB(teamB);
        // Load parameters if present
        if (match.gameParameters) {
          setGameParameters(match.gameParameters);
        }
      } catch (e) {
        // handle error
      }
      setLoading(false);
    };
    fetchMatchAndTeams();
  }, [tournamentId, matchId]);

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
      navigate(-1);
    }
  };
  const handleStartGame = async () => {
    // Save parameters to match
    const matchRef = doc(db, "matches", matchId);
    await updateDoc(matchRef, {
      gameParameters,
      teamAName: teamA.name,
      teamBName: teamB.name,
      // Optionally, save players if you want
    });
    navigate(`/tournament/${tournamentId}/game/play/${matchId}`);
  };

  if (loading || !teamA || !teamB) {
    return <div className="text-center py-8">Loading game setup...</div>;
  }

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
          <div className="space-y-6">
            <div className="flex justify-center mb-6">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"}`}>1</div>
                <div className="w-12 h-1 bg-primary/20">
                  <div className={`h-full bg-primary ${step > 1 ? "w-full" : "w-0"}`}></div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 2 ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"}`}>2</div>
                <div className="w-12 h-1 bg-primary/20">
                  <div className={`h-full bg-primary ${step > 2 ? "w-full" : "w-0"}`}></div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 3 ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"}`}>3</div>
              </div>
            </div>
            {step === 1 && (
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-semibold mb-4">{teamA.name} Setup</h2>
                <TeamSetup
                  teamName={teamA.name}
                  players={teamA.players || []}
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
            {step === 2 && (
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-semibold mb-4">{teamB.name} Setup</h2>
                <TeamSetup
                  teamName={teamB.name}
                  players={teamB.players || []}
                  onTeamNameChange={handleTeamBNameChange}
                  onPlayersChange={handleTeamBPlayersChange}
                />
                <div className="mt-6 flex gap-4">
                  <Button variant="outline" onClick={handleBack} className="w-32">
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
                  <Button variant="outline" onClick={handleBack} className="w-32">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleStartGame} className="w-32 bg-green-600 hover:bg-green-700">
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
