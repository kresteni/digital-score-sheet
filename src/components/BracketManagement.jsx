import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { ArrowRight, Edit, Save, X, RefreshCw } from "lucide-react";

const BracketManagement = ({ userRole, tournamentId }) => {
    console.log(tournamentId);
  // Sample teams
  const teams = [
    { id: "1", name: "Disc Jockeys" },
    { id: "2", name: "Sky Walkers" },
    { id: "3", name: "Wind Chasers" },
    { id: "4", name: "Gravity Defiers" },
    { id: "5", name: "Ultimate Stars" },
    { id: "6", name: "Flying Discs" },
    { id: "7", name: "Spin Masters" },
    { id: "8", name: "Air Benders" },
  ];

  const [matches, setMatches] = useState([
    {
      id: "1",
      teamA: teams[0],
      teamB: teams[1],
      scoreA: 15,
      scoreB: 12,
      round: 1,
      court: "Court A",
      scheduledTime: "2023-06-15T10:00",
      completed: true,
    },
    {
      id: "2",
      teamA: teams[2],
      teamB: teams[3],
      scoreA: 13,
      scoreB: 15,
      round: 1,
      court: "Court B",
      scheduledTime: "2023-06-15T10:00",
      completed: true,
    },
    {
      id: "3",
      teamA: teams[4],
      teamB: teams[5],
      scoreA: 15,
      scoreB: 8,
      round: 1,
      court: "Court A",
      scheduledTime: "2023-06-15T12:00",
      completed: true,
    },
    {
      id: "4",
      teamA: teams[6],
      teamB: teams[7],
      scoreA: 14,
      scoreB: 15,
      round: 1,
      court: "Court B",
      scheduledTime: "2023-06-15T12:00",
      completed: true,
    },
    {
      id: "5",
      teamA: teams[0],
      teamB: teams[3],
      scoreA: null,
      scoreB: null,
      round: 2,
      court: "Court A",
      scheduledTime: "2023-06-16T10:00",
      completed: false,
    },
    {
      id: "6",
      teamA: teams[4],
      teamB: teams[7],
      scoreA: null,
      scoreB: null,
      round: 2,
      court: "Court B",
      scheduledTime: "2023-06-16T10:00",
      completed: false,
    },
  ]);

  const [selectedRound, setSelectedRound] = useState(1);
  const [editingMatch, setEditingMatch] = useState(null);
  const [editScores, setEditScores] = useState({
    scoreA: 0,
    scoreB: 0,
  });

  // Only Head Marshalls can create/edit brackets, but Marshalls can update scores
  const canManageBrackets = userRole === "head-marshall";
  const canUpdateScores =
    userRole === "head-marshall" || userRole === "marshall";

  const rounds = Array.from(new Set(matches.map((match) => match.round))).sort(
    (a, b) => a - b
  );

  const filteredMatches = matches.filter(
    (match) => match.round === selectedRound
  );

  const handleEditScore = (match) => {
    setEditingMatch(match.id);
    setEditScores({
      scoreA: match.scoreA || 0,
      scoreB: match.scoreB || 0,
    });
  };

  const handleSaveScore = (matchId) => {
    setMatches(
      matches.map((match) => {
        if (match.id === matchId) {
          return {
            ...match,
            scoreA: editScores.scoreA,
            scoreB: editScores.scoreB,
            completed: true,
          };
        }
        return match;
      })
    );
    setEditingMatch(null);
  };

  const handleGenerateNextRound = () => {
    // In a real app, this would use the results from the current round
    // to generate matches for the next round based on tournament format
    alert("Next round would be generated based on current results");
  };

  if (!canUpdateScores) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            Access Restricted
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            You don't have permission to access this section. Please contact a
            Head Marshall for assistance.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-background">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => window.history.back()}>
                Back
              </Button>
              <CardTitle className="text-2xl font-bold">
                Tournament Bracket
              </CardTitle>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-40">
                <Select
                  value={selectedRound.toString()}
                  onValueChange={(value) => setSelectedRound(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select round" />
                  </SelectTrigger>
                  <SelectContent>
                    {rounds.map((round) => (
                      <SelectItem key={round} value={round.toString()}>
                        Round {round}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {canManageBrackets && (
                <Button onClick={handleGenerateNextRound}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate Next Round
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Match</TableHead>
                <TableHead>Team A</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Team B</TableHead>
                <TableHead>Court</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                {canUpdateScores && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMatches.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No matches scheduled for this round
                  </TableCell>
                </TableRow>
              ) : (
                filteredMatches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell className="font-medium">
                      Match {match.id}
                    </TableCell>
                    <TableCell>{match.teamA.name}</TableCell>
                    <TableCell>
                      {editingMatch === match.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            className="w-16 p-1 border rounded"
                            value={editScores.scoreA}
                            onChange={(e) =>
                              setEditScores({
                                ...editScores,
                                scoreA: parseInt(e.target.value) || 0,
                              })
                            }
                            min="0"
                          />
                          <span>-</span>
                          <input
                            type="number"
                            className="w-16 p-1 border rounded"
                            value={editScores.scoreB}
                            onChange={(e) =>
                              setEditScores({
                                ...editScores,
                                scoreB: parseInt(e.target.value) || 0,
                              })
                            }
                            min="0"
                          />
                        </div>
                      ) : (
                        <span>
                          {match.scoreA !== null && match.scoreB !== null
                            ? `${match.scoreA} - ${match.scoreB}`
                            : "--"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{match.teamB.name}</TableCell>
                    <TableCell>{match.court}</TableCell>
                    <TableCell>
                      {new Date(match.scheduledTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${match.completed ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                      >
                        {match.completed ? "Completed" : "Scheduled"}
                      </span>
                    </TableCell>
                    {canUpdateScores && (
                      <TableCell className="text-right">
                        {editingMatch === match.id ? (
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSaveScore(match.id)}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingMatch(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditScore(match)}
                            disabled={match.completed && !canManageBrackets}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BracketManagement;
