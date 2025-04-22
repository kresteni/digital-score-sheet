import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Plus, Trash2, Edit, Save, X, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";

const TeamManagement = ({ userRole, tournamentId, onComplete = () => {}, onBack = () => window.history.back() }) => {
  const [teams, setTeams] = useState([
    {
      id: "1",
      name: "Disc Jockeys",
      captain: "Alex Smith",
      contactEmail: "alex@example.com",
      players: [
        { id: "1", name: "Alex Smith", number: "1", position: "Handler" },
        { id: "2", name: "Jamie Johnson", number: "2", position: "Cutter" },
        { id: "3", name: "Taylor Brown", number: "3", position: "Handler" },
      ],
    },
    {
      id: "2",
      name: "Sky Walkers",
      captain: "Jordan Lee",
      contactEmail: "jordan@example.com",
      players: [
        { id: "4", name: "Jordan Lee", number: "1", position: "Handler" },
        { id: "5", name: "Casey Wilson", number: "2", position: "Cutter" },
        { id: "6", name: "Riley Garcia", number: "3", position: "Handler" },
      ],
    },
  ]);

  const [editingTeam, setEditingTeam] = useState(null);
  const [newTeam, setNewTeam] = useState({
    name: "",
    captain: "",
    contactEmail: "",
  });
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    number: "",
    position: "",
  });
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  const canManageTeams = userRole === "head-marshall";

  const handleAddTeam = () => {
    if (!newTeam.name || !newTeam.captain) return;

    const team = {
      id: Date.now().toString(),
      ...newTeam,
      players: [],
    };

    setTeams([...teams, team]);
    setNewTeam({ name: "", captain: "", contactEmail: "" });
  };

  const handleEditTeam = (team) => {
    setEditingTeam({ ...team });
  };

  const handleSaveTeam = () => {
    if (!editingTeam) return;

    setTeams(teams.map((team) => (team.id === editingTeam.id ? editingTeam : team)));
    setEditingTeam(null);
  };

  const handleDeleteTeam = (teamId) => {
    setTeams(teams.filter((team) => team.id !== teamId));
  };

  const handleAddPlayer = () => {
    if (!selectedTeamId || !newPlayer.name || !newPlayer.number) return;

    const player = {
      id: Date.now().toString(),
      ...newPlayer,
      stats: { goals: 0, assists: 0, blocks: 0 },
    };

    setTeams(
      teams.map((team) => {
        if (team.id === selectedTeamId) {
          return {
            ...team,
            players: [...team.players, player],
          };
        }
        return team;
      })
    );

    setNewPlayer({ name: "", number: "", position: "" });
  };

  const handleDeletePlayer = (teamId, playerId) => {
    setTeams(
      teams.map((team) => {
        if (team.id === teamId) {
          return {
            ...team,
            players: team.players.filter((player) => player.id !== playerId),
          };
        }
        return team;
      })
    );
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
                              <Button variant="ghost" size="sm" onClick={() => setEditingTeam(null)}>
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
                          <p className="text-sm text-gray-500">
                            Captain: {team.captain} | Email: {team.contactEmail}
                          </p>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedTeamId(team.id)}
                            >
                              <UserPlus className="mr-2 h-4 w-4" />
                              Add Player
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Player to {team.name}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div>
                                <Label htmlFor="playerName">Player Name</Label>
                                <Input
                                  id="playerName"
                                  value={newPlayer.name}
                                  onChange={(e) =>
                                    setNewPlayer({ ...newPlayer, name: e.target.value })
                                  }
                                  placeholder="Player Name"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="playerNumber">Jersey Number</Label>
                                  <Input
                                    id="playerNumber"
                                    value={newPlayer.number}
                                    onChange={(e) =>
                                      setNewPlayer({ ...newPlayer, number: e.target.value })
                                    }
                                    placeholder="#"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="playerPosition">Position</Label>
                                  <Input
                                    id="playerPosition"
                                    value={newPlayer.position}
                                    onChange={(e) =>
                                      setNewPlayer({ ...newPlayer, position: e.target.value })
                                    }
                                    placeholder="Handler/Cutter"
                                  />
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={handleAddPlayer}>Add Player</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Number</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {team.players.map((player) => (
                            <TableRow key={player.id}>
                              <TableCell>{player.name}</TableCell>
                              <TableCell>#{player.number}</TableCell>
                              <TableCell>{player.position}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeletePlayer(team.id, player.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {team.players.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                No players added yet
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Done Button */}
          <div className="flex justify-end mt-8">
            <Button onClick={onComplete} className="px-8">
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamManagement;
