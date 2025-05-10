import React, { useState, useEffect } from "react";
import { Plus, User, Award, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

const PlayerStats = ({
  teamAPlayers = [],
  teamBPlayers = [],
  teamAName = "Team A",
  teamBName = "Team B",
  onAddPlayer = () => {},
  onRecordStat,
  onStatUpdate,
}) => {
  const [activeTab, setActiveTab] = useState("teamA");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [playersA, setPlayersA] = useState(teamAPlayers);
  const [playersB, setPlayersB] = useState(teamBPlayers);

  useEffect(() => {
    setPlayersA(teamAPlayers);
    setPlayersB(teamBPlayers);
  }, [teamAPlayers, teamBPlayers]);

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      onAddPlayer(activeTab === "teamA" ? "A" : "B", newPlayerName);
      setNewPlayerName("");
    }
  };

  const handleRecordStat = (teamId, playerId, statType) => {
    const statKey = statType === "block" ? "blocks" : statType + "s";

    if (teamId === "A") {
      const updatedPlayers = playersA.map((player) => {
        if (player.id === playerId) {
          const updatedPlayer = {
            ...player,
            [statKey]: (player[statKey] || 0) + 1,
          };
          onStatUpdate(teamId, updatedPlayer);
          return updatedPlayer;
        }
        return player;
      });
      setPlayersA(updatedPlayers);
    } else {
      const updatedPlayers = playersB.map((player) => {
        if (player.id === playerId) {
          const updatedPlayer = {
            ...player,
            [statKey]: (player[statKey] || 0) + 1,
          };
          onStatUpdate(teamId, updatedPlayer);
          return updatedPlayer;
        }
        return player;
      });
      setPlayersB(updatedPlayers);
    }
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">Player Statistics</CardTitle>
        <CardDescription>
          Track goals, assists, and blocks for each player
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="teamA"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="teamA">{teamAName}</TabsTrigger>
            <TabsTrigger value="teamB">{teamBName}</TabsTrigger>
          </TabsList>

          <TabsContent value="teamA" className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add new player"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleAddPlayer}
                disabled={!newPlayerName.trim()}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Player
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-center">Goals</TableHead>
                  <TableHead className="text-center">Assists</TableHead>
                  <TableHead className="text-center">Blocks</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {playersA.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-4 text-muted-foreground"
                    >
                      No players added yet
                    </TableCell>
                  </TableRow>
                ) : (
                  playersA.map((player) => (
                    <TableRow key={player.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {player.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {player.goals || 0}
                      </TableCell>
                      <TableCell className="text-center">
                        {player.assists || 0}
                      </TableCell>
                      <TableCell className="text-center">
                        {player.blocks || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleRecordStat("A", player.id, "goal")
                            }
                            title="Record Goal"
                          >
                            <Award className="h-4 w-4 text-yellow-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleRecordStat("A", player.id, "assist")
                            }
                            title="Record Assist"
                          >
                            <Award className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleRecordStat("A", player.id, "block")
                            }
                            title="Record Block"
                          >
                            <Shield className="h-4 w-4 text-green-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="teamB" className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add new player"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleAddPlayer}
                disabled={!newPlayerName.trim()}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Player
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-center">Goals</TableHead>
                  <TableHead className="text-center">Assists</TableHead>
                  <TableHead className="text-center">Blocks</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {playersB.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-4 text-muted-foreground"
                    >
                      No players added yet
                    </TableCell>
                  </TableRow>
                ) : (
                  playersB.map((player) => (
                    <TableRow key={player.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {player.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {player.goals || 0}
                      </TableCell>
                      <TableCell className="text-center">
                        {player.assists || 0}
                      </TableCell>
                      <TableCell className="text-center">
                        {player.blocks || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleRecordStat("B", player.id, "goal")
                            }
                            title="Record Goal"
                          >
                            <Award className="h-4 w-4 text-yellow-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleRecordStat("B", player.id, "assist")
                            }
                            title="Record Assist"
                          >
                            <Award className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleRecordStat("B", player.id, "block")
                            }
                            title="Record Block"
                          >
                            <Shield className="h-4 w-4 text-green-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PlayerStats;
