import React, { useEffect, useState } from "react";
import { Plus, X, User } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";

const TeamSetup = ({ tournamentId, teamName, players }) => {
  const [teamNameInput, setTeamNameInput] = useState("");
  const [playersList, setPlayersList] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerNumber, setNewPlayerNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [tournamentLocked, setTournamentLocked] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    if (teamName) setTeamNameInput(teamName);
    if (players) setPlayersList(players);
  }, [teamName, players]);

  const handleTeamNameChange = (e) => {
    setTeamNameInput(e.target.value);
  };

  return (
    <Card className="w-full max-w-md bg-white">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Team Setup</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <label htmlFor="teamName" className="block text-sm font-medium mb-1">
            Team Name
          </label>
          <Input
            id="teamName"
            value={teamNameInput}
            onChange={handleTeamNameChange}
            placeholder="Enter team name"
            className="w-full"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Players Roster</h3>
            <span className="text-xs text-gray-500">
              {playersList.length} players
            </span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto p-1">
            {playersList.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
              >
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  <span className="font-medium">{player.name}</span>
                  {player.number && (
                    <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                      #{player.number}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamSetup;