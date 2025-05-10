import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

const TeamManagement = () => {
  const navigate = useNavigate();
  const { tournamentId } = useParams();
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
  const [dialogTeamId, setDialogTeamId] = useState(null);
  const { userRole } = useAuth();

  useEffect(() => {
    const fetchTeamsAndPlayers = async () => {
      try {
        const teamsCollection = collection(db, "teams");
        const q = query(teamsCollection, where("tournamentId", "==", tournamentId));
        const querySnapshot = await getDocs(q);
        const teamsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Fetch all players for this tournament
        const playersCollection = collection(db, "players");
        const playersSnapshot = await getDocs(playersCollection);
        const allPlayers = playersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Attach players to their teams
        const teamsWithPlayers = teamsData.map(team => ({
          ...team,
          players: allPlayers.filter(player => player.teamId === team.id)
        }));

        setTeams(teamsWithPlayers);
      } catch (error) {
        console.error("Error fetching teams and players:", error);
      } finally {
        setLoading(false);
      }
    };

    if (tournamentId) {
      fetchTeamsAndPlayers();
    }
  }, [tournamentId]);

  const handleAddTeam = async () => {
    if (!newTeam.name || !newTeam.captain) return;

    try {
      const docRef = await addDoc(collection(db, "teams"), {
        name: newTeam.name,
        captain: newTeam.captain,
        contactEmail: newTeam.contactEmail,
        tournamentId,
        createdBy: auth.currentUser.uid,
      });

      const teamsCollection = collection(db, "teams");
      const q = query(teamsCollection, where("tournamentId", "==", tournamentId));
      const querySnapshot = await getDocs(q);
      setTeams(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

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
      });
      setTeams(teams.map((team) => (team.id === editingTeam.id ? editingTeam : team)));
      setEditingTeam(null);
    } catch (error) {
      console.error("Error saving team: ", error);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      await deleteDoc(doc(db, "teams", teamId));
      setTeams(teams.filter((team) => team.id !== teamId));
    } catch (error) {
      console.error("Error deleting team: ", error);
    }
  };

  // Fetch players for a team
  const fetchPlayersForTeam = async (teamId) => {
    const playersCollection = collection(db, "players");
    const q = query(playersCollection, where("teamId", "==", teamId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  const handleAddPlayer = async () => {
    if (!dialogTeamId || !newPlayer.name || !newPlayer.number) return;

    const player = {
      name: newPlayer.name,
      number: newPlayer.number,
      position: newPlayer.position,
      teamId: dialogTeamId,
      tournamentId,
    };

    try {
      await addDoc(collection(db, "players"), player);
      // Refetch players for the team from Firestore
      const updatedPlayers = await fetchPlayersForTeam(dialogTeamId);
      setTeams(
        teams.map((team) =>
          team.id === dialogTeamId
            ? { ...team, players: updatedPlayers }
            : team
        )
      );
      setNewPlayer({ name: "", number: "", position: "" });
      setDialogTeamId(null); // Close dialog
    } catch (error) {
      console.error("Error adding player: ", error);
    }
  };

  const handleDeletePlayer = async (teamId, playerId) => {
    try {
      const playerDocRef = doc(db, "players", playerId);
      await deleteDoc(playerDocRef);
      // Refetch players for the team from Firestore
      const updatedPlayers = await fetchPlayersForTeam(teamId);
      setTeams(
        teams.map((team) =>
          team.id === teamId
            ? { ...team, players: updatedPlayers }
            : team
        )
      );
    } catch (error) {
      console.error("Error deleting player: ", error);
    }
  };

  const handleComplete = () => {
    navigate(`/tournament/${tournamentId}/menu`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative min-h-screen">
      <div className="w-full max-w-6xl mx-auto p-4 bg-background">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">Team Management</CardTitle>
                <Button variant="outline" onClick={() => navigate(`/tournament/${tournamentId}/setup`)}>
                  Back
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Add New Team - Only for head-marshall */}
            {userRole === "head-marshall" && (
            <div className="mb-8 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">Add New Team</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Team Name"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  />
                  <Input
                    placeholder="Captain Name"
                    value={newTeam.captain}
                    onChange={(e) => setNewTeam({ ...newTeam, captain: e.target.value })}
                  />
                  <Input
                    placeholder="Email"
                    value={newTeam.contactEmail}
                    onChange={(e) => setNewTeam({ ...newTeam, contactEmail: e.target.value })}
                  />
                </div>
                <Button className="mt-4" onClick={handleAddTeam} variant="secondary">
                  <Plus className="mr-2 h-4 w-4" /> Add Team
                </Button>
              </div>
            )}

            {/* Teams List */}
            <h3 className="text-lg font-semibold mb-2">Teams</h3>
                <div className="space-y-6">
                  {teams.map((team) => (
                <div key={team.id} className="bg-gray-50 border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2">
                      <span className="text-xl font-bold">{team.name}</span>
                      {userRole === "head-marshall" && (
                        <>
                          <Button size="icon" variant="ghost" onClick={() => handleEditTeam(team)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteTeam(team.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                    </div>
                    {userRole === "head-marshall" && (
                      <Button size="sm" variant="outline" onClick={() => { setDialogTeamId(team.id); setNewPlayer({ name: "", number: "", position: "" }); }}>
                        <Plus className="mr-1 h-4 w-4" /> Add Player
                      </Button>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Captain: {team.captain} | Email: {team.contactEmail}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-4 py-2 text-left font-semibold">Name</th>
                          <th className="px-4 py-2 text-left font-semibold">Number</th>
                          <th className="px-4 py-2 text-left font-semibold">Position</th>
                          <th className="px-4 py-2 text-left font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(team.players || []).map((player) => (
                          <tr key={player.id} className="border-b">
                            <td className="px-4 py-2">{player.name}</td>
                            <td className="px-4 py-2">{player.number}</td>
                            <td className="px-4 py-2">{player.position}</td>
                            <td className="px-4 py-2">
                              {userRole === "head-marshall" && (
                                <Button size="icon" variant="ghost" onClick={() => handleDeletePlayer(team.id, player.id)}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            )}
                            </td>
                          </tr>
                                ))}
                      </tbody>
                    </table>
                            </div>
                  {/* Add Player Dialog - Only for head-marshall */}
                  {userRole === "head-marshall" && (
                    <Dialog open={dialogTeamId === team.id} onOpenChange={(open) => { if (!open) setDialogTeamId(null); }}>
                            <DialogContent>
                              <DialogHeader>
                          <DialogTitle>Add Player to {team.name}</DialogTitle>
                              </DialogHeader>
                        <div className="space-y-4">
                              <div>
                                <Label>Player Name</Label>
                                <Input
                              placeholder="Player Name"
                                  value={newPlayer.name}
                              onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                                />
                          </div>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <Label>Jersey Number</Label>
                                <Input
                                placeholder="#"
                                  value={newPlayer.number}
                                onChange={(e) => setNewPlayer({ ...newPlayer, number: e.target.value })}
                                />
                            </div>
                            <div className="flex-1">
                                <Label>Position</Label>
                                <Input
                                placeholder="Handler/Cutter"
                                  value={newPlayer.position}
                                onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                                />
                            </div>
                          </div>
                                <Button className="mt-2" onClick={handleAddPlayer}>
                                  Add Player
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                  )}
                </div>
              ))}
            </div>
            {/* Done Button - Only for head-marshall */}
            {userRole === "head-marshall" && (
              <div className="flex justify-end mt-8">
                <Button onClick={handleComplete} className="px-8">
                  Done
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamManagement;