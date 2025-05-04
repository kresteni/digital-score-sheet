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
  addDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

const TeamSetup = ({ tournamentId }) => {
  const [teamNameInput, setTeamNameInput] = useState("");
  const [playersList, setPlayersList] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerNumber, setNewPlayerNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [tournamentLocked, setTournamentLocked] = useState(false);
  const [teamId, setTeamId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tournamentId || !auth.currentUser) {
      setLoading(false);
      return;
    }

    const user = auth.currentUser;

    // Set up a listener for the team data
    const teamsCollection = collection(db, "teams");
    const teamQuery = query(
      teamsCollection, 
      where("tournamentId", "==", tournamentId),
      where("createdBy", "==", user.uid)
    );
    
    const unsubscribeTeam = onSnapshot(teamQuery, async (teamSnapshot) => {
      if (!teamSnapshot.empty) {
        const teamDoc = teamSnapshot.docs[0];
        const teamData = teamDoc.data();
        
        setTeamId(teamDoc.id);
        setTeamNameInput(teamData.teamName || "");
        setTournamentLocked(teamData.locked || false);
        
        // Now that we have the team ID, fetch the players
        const playersCollection = collection(db, "players");
        const playersQuery = query(playersCollection, where("teamId", "==", teamDoc.id));
        
        const playersSnapshot = await getDocs(playersQuery);
        const playersData = playersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setPlayersList(playersData);
      }
      
      setLoading(false);
    }, (error) => {
      console.error("Error fetching team data:", error);
      setLoading(false);
    });

    return () => {
      unsubscribeTeam();
    };
  }, [tournamentId]);

  const handleTeamNameChange = (e) => {
    setTeamNameInput(e.target.value);
  };

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      const newPlayer = {
        id: Date.now().toString(), // Temporary ID for UI purposes
        name: newPlayerName.trim(),
        number: newPlayerNumber.trim() || "",
        // This is just for local state, will be replaced when saved to Firestore
      };
      
      setPlayersList([...playersList, newPlayer]);
      setNewPlayerName("");
      setNewPlayerNumber("");
    }
  };

  const handleRemovePlayer = (playerId) => {
    setPlayersList(playersList.filter((p) => p.id !== playerId));
  };

  const handleSaveTeam = async () => {
    if (!auth.currentUser || !tournamentId) return;
    
    const user = auth.currentUser;
    setIsSaving(true);

    try {
      let teamDocRef;
      
      // Create or update team
      if (teamId) {
        // Update existing team
        teamDocRef = doc(db, "teams", teamId);
        await updateDoc(teamDocRef, {
          teamName: teamNameInput,
          updatedAt: serverTimestamp(),
          locked: true,
        });
      } else {
        // Create new team
        const teamData = {
          teamName: teamNameInput,
          tournamentId,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
          locked: true,
        };
        
        const teamRef = collection(db, "teams");
        const docRef = await addDoc(teamRef, teamData);
        teamDocRef = docRef;
        setTeamId(docRef.id);
      }
      
      // Handle players
      // For simplicity, we'll delete all existing players and add new ones
      if (teamId) {
        // First, fetch existing players to delete them
        const playersCollection = collection(db, "players");
        const playersQuery = query(playersCollection, where("teamId", "==", teamId));
        const playersSnapshot = await getDocs(playersQuery);
        
        // Delete all existing players for this team
        const playerDeletePromises = playersSnapshot.docs.map(playerDoc => {
          const playerRef = doc(db, "players", playerDoc.id);
          return updateDoc(playerRef, { deleted: true, deletedAt: serverTimestamp() });
        });
        
        await Promise.all(playerDeletePromises);
      }
      
      // Add all players from current state
      const playerPromises = playersList.map(player => {
        const playerData = {
          name: player.name,
          number: player.number || "",
          teamId: teamId || teamDocRef.id,
          tournamentId,
          createdAt: serverTimestamp(),
        };
        
        return addDoc(collection(db, "players"), playerData);
      });
      
      await Promise.all(playerPromises);
      
      setTournamentLocked(true);
    } catch (error) {
      console.error("Error saving team:", error);
      alert("Failed to save team data: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Loading Team Data...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please wait while we fetch your team information.</p>
        </CardContent>
      </Card>
    );
  }

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
          <Button onClick={handleSaveTeam} disabled={isSaving} className="w-full">
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