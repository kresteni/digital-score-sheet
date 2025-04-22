import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { ArrowLeft, Calendar, Clock, MapPin, Play } from "lucide-react";

const TournamentGames = ({
  tournamentId,
  onBack = () => {},
  onStartGame = () => {},
  userRole = null,
}) => {
  // Sample games data - in a real app, this would come from props or an API
  const [games, setGames] = useState([
    {
      id: "1",
      teamA: "Disc Jockeys",
      teamB: "Sky Walkers",
      scoreA: null,
      scoreB: null,
      pitch: "Field A",
      time: "2023-06-15T10:00",
      status: "Scheduled",
      marshall: "Charlene Layo",
    },
    {
      id: "2",
      teamA: "Wind Chasers",
      teamB: "Gravity Defiers",
      scoreA: null,
      scoreB: null,
      pitch: "Field B",
      time: "2023-06-15T10:00",
      status: "Scheduled",
      marshall: "Chris",
    },
    {
      id: "3",
      teamA: "Ultimate Stars",
      teamB: "Flying Discs",
      scoreA: null,
      scoreB: null,
      pitch: "Field A",
      time: "2023-06-15T12:00",
      status: "Scheduled",
      marshall: "Earl",
    },
  ]);

  const handleStartGame = (gameId) => {
    // Find the game data
    const game = games.find((g) => g.id === gameId);
    if (game) {
      // Update the game status
      setGames(
        games.map((g) =>
          g.id === gameId ? { ...g, status: "In Progress" } : g,
        ),
      );
      // Call the parent handler with the game data
      onStartGame(game);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-background">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <CardTitle className="text-2xl font-bold">
                Tournament Games
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {games.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No games scheduled for this tournament
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Match</TableHead>
                  <TableHead>Team A</TableHead>
                  <TableHead>Team B</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Pitch</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Marshall</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {games.map((game) => (
                  <TableRow key={game.id}>
                    <TableCell className="font-medium">
                      Match {game.id}
                    </TableCell>
                    <TableCell>{game.teamA}</TableCell>
                    <TableCell>{game.teamB}</TableCell>
                    <TableCell>
                      {game.scoreA !== null && game.scoreB !== null
                        ? `${game.scoreA} - ${game.scoreB}`
                        : "--"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {game.pitch}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {new Date(game.time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${game.status === "Completed" ? "bg-green-100 text-green-800" : game.status === "In Progress" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}
                      >
                        {game.status}
                      </span>
                    </TableCell>
                    <TableCell>{game.marshall}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartGame(game.id)}
                        disabled={
                          game.status === "Completed" ||
                          game.status === "In Progress"
                        }
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Start Game
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TournamentGames;
