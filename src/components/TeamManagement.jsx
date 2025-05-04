import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

const TeamManagement = ({
  userRole,
  tournamentId,
  onComplete = () => {},
  onBack = () => window.history.back(),
}) => {
  const [teams, setTeams] = useState([]);
  const [newTeam, setNewTeam] = useState({
    name: "",
    captain: "",
    contactEmail: "",
  });
  const [editingTeam, setEditingTeam] = useState(null);
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    number: "",
    position: "",
  });
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tournamentId) return;

    // Set up a real-time listener for teams
    const teamsCollection = collection(db, "teams");
    const q = query(teamsCollection, where("tournamentId", "==", tournamentId));
    
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const teamsData = [];
      
      for (const teamDoc of querySnapshot.docs) {
        const teamData = { id: teamDoc.id, ...teamDoc.data() };
        
        // Fetch players for each team
        const playersCollection = collection(db, "players");
        const playersQuery = query(playersCollection, where("teamId", "==", teamDoc.id));
        const playersSnapshot = await getDocs(playersQuery);
        
        teamData.players = playersSnapshot.docs.map(playerDoc => ({
          id: playerDoc.id,
          ...playerDoc.data()
        }));
        
        teamsData.push(teamData);
      }
      
      setTeams(teamsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching teams:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tournamentId]);

  const canManageTeams = userRole === "head-marshall";

  const handleAddTeam = async () => {
    if (!newTeam.name || !newTeam.captain) return;

    try {
      await addDoc(collection(db, "teams"), {
        name: newTeam.name,
        captain: newTeam.captain,
        contactEmail: newTeam.contactEmail,
        tournamentId,
        createdBy: auth.currentUser.uid,
        createdAt: new Date(),
      });

      setNewTeam({ name: "", captain: "", contactEmail: "" });
    } catch (error) {
      console.error("Error adding team: ", error);
    }
  };

  const handleEditTeam = (team) => {
    setEditingTeam({ ...team });
  };

  const handleSaveTeam = async () => {
    if (!editingTeam) return;

    const teamRef = doc(db, "teams", editingTeam.id);

    try {
      await updateDoc(teamRef, {
        name: editingTeam.name,
        captain: editingTeam.captain,
        contactEmail: editingTeam.contactEmail,
        updatedAt: new Date(),
      });
      setEditingTeam(null);
    } catch (error) {
      console.error("Error saving team: ", error);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      // First delete all players associated with this team
      const playersCollection = collection(db, "players");
      const playersQuery = query(playersCollection, where("teamId", "==", teamId));
      const playersSnapshot = await getDocs(playersQuery);
      
      const deletePromises = playersSnapshot.docs.map(playerDoc => 
        deleteDoc(doc(db, "players", playerDoc.id))
      );
      
      await Promise.all(deletePromises);
      
      // Then delete the team
      await deleteDoc(doc(db, "teams", teamId));
    } catch (error) {
      console.error("Error deleting team: ", error);
    }
  };

  const handleAddPlayer = async () => {
    if (!selectedTeamId || !newPlayer.name) return;

    const player = {
      name: newPlayer.name,
      number: newPlayer.number || "",
      position: newPlayer.position || "",
      teamId: selectedTeamId,
      tournamentId,
      createdAt: new Date(),
    };

    try {
      await addDoc(collection(db, "players"), player);
      setNewPlayer({ name: "", number: "", position: "" });
    } catch (error) {
      console.error("Error adding player: ", error);
    }
  };

  const handleDeletePlayer = async (playerId) => {
    try {
      await deleteDoc(doc(db, "players", playerId));
    } catch (error) {
      console.error("Error deleting player: ", error);
    }
  };

  if (!canManageTeams) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-xl">Access Restricted</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Only Head Marshalls can manage teams. Please contact a Head Marshall for assistance.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-xl">Loading teams...</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Please wait while we fetch the team data.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-background">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Team Management</CardTitle>
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add New Team */}
          <div className="mb-8 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Add New Team</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  placeholder="Team Name"
                />
              </div>
              <div>
                <Label htmlFor="captain">Captain</Label>
                <Input
                  id="captain"
                  value={newTeam.captain}
                  onChange={(e) => setNewTeam({ ...newTeam, captain: e.target.value })}
                  placeholder="Captain Name"
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={newTeam.contactEmail}
                  onChange={(e) => setNewTeam({ ...newTeam, contactEmail: e.target.value })}
                  placeholder="Email"
                />
              </div>
            </div>
            <Button
              onClick={handleAddTeam}
              className="mt-4"
              disabled={!newTeam.name || !newTeam.captain}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Team
            </Button>
          </div>

          {/* Team List */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Teams</h3>
            {teams.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No teams added yet</p>
            ) : (
              <div className="space-y-6">
                {teams.map((team) => (
                  <Card key={team.id} className="overflow-hidden">
                    <div className="bg-gray-100 p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          {editingTeam?.id === team.id ? (
                            <div className="flex gap-2">
                              <Input
                                value={editingTeam.name}
                                onChange={(e) =>
                                  setEditingTeam({ ...editingTeam, name: e.target.value })
                                }
                                className="w-48"
                              />
                              <Button variant="ghost" size="sm" onClick={handleSaveTeam}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingTeam(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <h4 className="text-xl font-semibold">{team.name}</h4>
                              <Button variant="ghost" size="sm" onClick={() => handleEditTeam(team)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTeam(team.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          )}
                          <p className="text-sm text-gray-500">{team.captain}</p>
                          <div className="mt-4">
                            <h5 className="text-lg font-semibold">Players</h5>
                            <ul className="space-y-2">
                              {team.players?.map((player) => (
                                <li key={player.id} className="flex justify-between">
                                  <span>
                                    {player.name}
                                    {player.number && ` (#${player.number})`}
                                    {player.position && ` - ${player.position}`}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeletePlayer(player.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" onClick={() => setSelectedTeamId(team.id)}>
                              Add Players
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Players for {team.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <div>
                                <Label>Player Name</Label>
                                <Input
                                  value={newPlayer.name}
                                  onChange={(e) =>
                                    setNewPlayer({ ...newPlayer, name: e.target.value })
                                  }
                                  placeholder="Player name"
                                />
                              </div>
                              <div>
                                <Label>Player Number</Label>
                                <Input
                                  value={newPlayer.number}
                                  onChange={(e) =>
                                    setNewPlayer({ ...newPlayer, number: e.target.value })
                                  }
                                  placeholder="Jersey number"
                                />
                              </div>
                              <div>
                                <Label>Position</Label>
                                <Input
                                  value={newPlayer.position}
                                  onChange={(e) =>
                                    setNewPlayer({ ...newPlayer, position: e.target.value })
                                  }
                                  placeholder="Player position"
                                />
                              </div>
                              <Button className="w-full" onClick={handleAddPlayer} disabled={!newPlayer.name}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Player
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* DONE BUTTON */}
          <div className="mt-8 text-center">
            <Button size="lg" onClick={onComplete}>
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamManagement;