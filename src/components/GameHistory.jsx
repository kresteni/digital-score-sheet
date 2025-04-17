import React, { useState } from "react";
import { Search, Calendar, Clock, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
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

const GameHistory = ({ games = [], onViewGameDetails = () => {} }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGames = games.filter(
    (game) =>
      game.teamA.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.teamB.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-background">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">Game History</CardTitle>
              <CardDescription>
                View and analyze your past games
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => window.history.back()}>
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search games by team name..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {filteredGames.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm
                  ? "No games found matching your search"
                  : "No game history available"}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Teams</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGames.map((game) => (
                    <TableRow key={game.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {game.date}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {game.teamA.name} vs {game.teamB.name}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-bold ${game.teamA.score > game.teamB.score ? "text-green-600" : "text-red-600"}`}
                        >
                          {game.teamA.score}
                        </span>
                        {" - "}
                        <span
                          className={`font-bold ${game.teamB.score > game.teamA.score ? "text-green-600" : "text-red-600"}`}
                        >
                          {game.teamB.score}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {game.duration} min
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewGameDetails(game.id)}
                          className="flex items-center gap-1"
                        >
                          View
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameHistory;
