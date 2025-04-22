import React from "react";
import { Trophy, Clock, Download, Share2, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Separator } from "./ui/separator";

const GameSummaryJS = ({
  teamAName = "Team A",
  teamBName = "Team B",
  teamAScore = 15,
  teamBScore = 12,
  teamAPlayers = [
    { id: "1", name: "Alex Smith", goals: 5, assists: 3 },
    { id: "2", name: "Jamie Johnson", goals: 4, assists: 6 },
    { id: "3", name: "Taylor Brown", goals: 3, assists: 2 },
    { id: "4", name: "Morgan Davis", goals: 2, assists: 4 },
    { id: "5", name: "Jordan Wilson", goals: 1, assists: 1 },
  ],
  teamBPlayers = [
    { id: "6", name: "Casey Lee", goals: 4, assists: 2 },
    { id: "7", name: "Riley Garcia", goals: 3, assists: 3 },
    { id: "8", name: "Quinn Martinez", goals: 2, assists: 4 },
    { id: "9", name: "Avery Thompson", goals: 2, assists: 1 },
    { id: "10", name: "Dakota Robinson", goals: 1, assists: 2 },
  ],
  gameDuration = "1h 24m",
  gameDate = "June 15, 2023",
  onBackToHome = () => {},
}) => {
  // Calculate MVP (Most Valuable Player) based on goals + assists
  const calculateMVP = (players) => {
    if (players.length === 0) return null;

    return players.reduce((mvp, player) => {
      const mvpScore = mvp.goals + mvp.assists;
      const playerScore = player.goals + player.assists;
      return playerScore > mvpScore ? player : mvp;
    }, players[0]);
  };

  const teamAMVP = calculateMVP(teamAPlayers);
  const teamBMVP = calculateMVP(teamBPlayers);

  // Determine game winner
  const winner = teamAScore > teamBScore ? teamAName : teamBName;
  const winningScore = teamAScore > teamBScore ? teamAScore : teamBScore;
  const losingScore = teamAScore > teamBScore ? teamBScore : teamAScore;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-background">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="flex items-center gap-2 mb-4"
          onClick={onBackToHome}
        >
          <ArrowLeft size={16} />
          Back to Home
        </Button>

        <h1 className="text-3xl font-bold mb-2">Game Summary</h1>
        <p className="text-muted-foreground">{gameDate}</p>
      </div>

      {/* Final Score Card */}
      <Card className="mb-8 bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Final Score</CardTitle>
          <CardDescription>Game duration: {gameDuration}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-4">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-medium">{teamAName}</h3>
              <p className="text-5xl font-bold mt-2">{teamAScore}</p>
            </div>

            <div className="flex items-center">
              <div className="px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold">
                {winner} wins!
              </div>
            </div>

            <div className="text-center md:text-right">
              <h3 className="text-xl font-medium">{teamBName}</h3>
              <p className="text-5xl font-bold mt-2">{teamBScore}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Game MVP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-primary/5">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  {teamAName}
                </h4>
                {teamAMVP ? (
                  <>
                    <p className="text-lg font-bold">{teamAMVP.name}</p>
                    <p className="text-sm mt-1">
                      {teamAMVP.goals} goals, {teamAMVP.assists} assists
                    </p>
                  </>
                ) : (
                  <p className="text-sm">No players</p>
                )}
              </div>

              <div className="p-4 rounded-lg bg-secondary/5">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  {teamBName}
                </h4>
                {teamBMVP ? (
                  <>
                    <p className="text-lg font-bold">{teamBMVP.name}</p>
                    <p className="text-sm mt-1">
                      {teamBMVP.goals} goals, {teamBMVP.assists} assists
                    </p>
                  </>
                ) : (
                  <p className="text-sm">No players</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Game Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{gameDate}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{gameDuration}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Final Score:</span>
                <span className="font-medium">
                  {winningScore} - {losingScore}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Winner:</span>
                <span className="font-medium">{winner}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Player Statistics */}
      <h2 className="text-2xl font-bold mb-4">Player Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Team A Stats */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle>{teamAName}</CardTitle>
            <CardDescription>
              Total Goals: {teamAPlayers.reduce((sum, p) => sum + p.goals, 0)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-center">Goals</TableHead>
                  <TableHead className="text-center">Assists</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamAPlayers.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>{player.name}</TableCell>
                    <TableCell className="text-center">
                      {player.goals}
                    </TableCell>
                    <TableCell className="text-center">
                      {player.assists}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {player.goals + player.assists}
                    </TableCell>
                  </TableRow>
                ))}
                {teamAPlayers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-4 text-muted-foreground"
                    >
                      No player statistics available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Team B Stats */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle>{teamBName}</CardTitle>
            <CardDescription>
              Total Goals: {teamBPlayers.reduce((sum, p) => sum + p.goals, 0)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-center">Goals</TableHead>
                  <TableHead className="text-center">Assists</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamBPlayers.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>{player.name}</TableCell>
                    <TableCell className="text-center">
                      {player.goals}
                    </TableCell>
                    <TableCell className="text-center">
                      {player.assists}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {player.goals + player.assists}
                    </TableCell>
                  </TableRow>
                ))}
                {teamBPlayers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-4 text-muted-foreground"
                    >
                      No player statistics available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={onBackToHome}>Back to Home</Button>
      </div>
    </div>
  );
};

export default GameSummaryJS;
