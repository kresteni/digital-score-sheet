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

const TeamSetup = ({ tournamentId }) => {
  const [teamNameInput, setTeamNameInput] = useState("");
  const [playersList, setPlayersList] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerNumber, setNewPlayerNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [tournamentLocked, setTournamentLocked] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    if (!tournamentId || !user) return;

    const fetchData = async () => {
      const tournamentRef = doc(db, "tournaments", tournamentId); // Reference to tournament document
      const tournamentSnap = await getDoc(tournamentRef);

      if (tournamentSnap.exists()) {
        const teamRef = collection(tournamentRef, "teams"); // Access teams subcollection under tournament
        const teamQuery = query(teamRef, where("createdBy", "==", user.uid));
        const teamSnap = await getDocs(teamQuery);

        if (!teamSnap.empty) {
          // Assuming there is only one team for the current user
          const teamData = teamSnap.docs[0].data();
          setTeamNameInput(teamData.teamName || "");
          setPlayersList(teamData.players || []);
          setTournamentLocked(teamData.locked || false);
        }
      }
    };

    fetchData();
  }, [tournamentId, user]);

  const handleTeamNameChange = (e) => {
    setTeamNameInput(e.target.value);
  };

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      const newPlayer = {
        id: Date.now().toString(),
        name: newPlayerName.trim(),
        number: newPlayerNumber.trim() || undefined,
      };
      const updatedPlayers = [...playersList, newPlayer];
      setPlayersList(updatedPlayers);
      setNewPlayerName("");
      setNewPlayerNumber("");
    }
  };

  const handleRemovePlayer = (playerId) => {
    const updatedPlayers = playersList.filter((p) => p.id !== playerId);
    setPlayersList(updatedPlayers);
  };

  const handleSaveTeam = async () => {
    if (!user || !tournamentId) return;
    setIsSaving(true);

    const tournamentRef = doc(db, "tournaments", tournamentId); // Reference to the tournament document
    const teamRef = doc(tournamentRef, "teams", user.uid); // Reference to the user's team document within the tournament

    try {
      // Save or update the team information for the current user
      await setDoc(teamRef, {
        teamName: teamNameInput,
        players: playersList,
        createdBy: user.uid,
        locked: true, // Lock the tournament after saving
      });

      setTournamentLocked(true);
    } catch (error) {
      console.error("Error saving team:", error);
    } finally {
      setIsSaving(false);
    }
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
            disabled={tournamentLocked}
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
                {!tournamentLocked && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemovePlayer(player.id)}
                    className="h-6 w-6 text-gray-500 hover:text-red-500"
                  >
                    <X size={14} />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {!tournamentLocked && (
            <div className="mt-3 space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="Player name"
                  className="flex-1"
                />
                <Input
                  value={newPlayerNumber}
                  onChange={(e) => setNewPlayerNumber(e.target.value)}
                  placeholder="#"
                  className="w-16"
                />
              </div>
              <Button
                onClick={handleAddPlayer}
                className="w-full flex items-center justify-center gap-1"
                disabled={!newPlayerName.trim()}
              >
                <Plus size={16} />
                Add Player
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        {!tournamentLocked ? (
          <Button onClick={handleSaveTeam} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Team"}
          </Button>
        ) : (
          <div className="text-sm text-green-600 font-semibold">
            Team saved and tournament is locked.
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default TeamSetup;