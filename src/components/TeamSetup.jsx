import React, { useState } from "react";
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

const TeamSetup = ({
  teamName = "Team Name",
  players = [
    { id: "1", name: "Player 1", number: "1" },
    { id: "2", name: "Player 2", number: "2" },
  ],
  onTeamNameChange = () => {},
  onPlayersChange = () => {},
}) => {
  const [teamNameInput, setTeamNameInput] = useState(teamName);
  const [playersList, setPlayersList] = useState(players);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerNumber, setNewPlayerNumber] = useState("");

  const handleTeamNameChange = (e) => {
    setTeamNameInput(e.target.value);
    onTeamNameChange(e.target.value);
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
      onPlayersChange(updatedPlayers);

      // Reset input fields
      setNewPlayerName("");
      setNewPlayerNumber("");
    }
  };

  const handleRemovePlayer = (playerId) => {
    const updatedPlayers = playersList.filter(
      (player) => player.id !== playerId,
    );
    setPlayersList(updatedPlayers);
    onPlayersChange(updatedPlayers);
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemovePlayer(player.id)}
                  className="h-6 w-6 text-gray-500 hover:text-red-500"
                >
                  <X size={14} />
                </Button>
              </div>
            ))}
          </div>

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
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm text-gray-500">
          Add players to your team roster
        </div>
      </CardFooter>
    </Card>
  );
};

export default TeamSetup;
