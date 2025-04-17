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
import { Trophy, Medal, Download, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";


const AwardsCalculation = ({ userRole, tournamentId }) => {
    console.log(userRole, tournamentId);
  // Sample player data
  const [players, SET_PLAYERS] = useState([
    {
      id: "1",
      name: "Alex Smith",
      team: "Disc Jockeys",
      stats: { goals: 12, assists: 8, blocks: 5, totalPoints: 20 },
    },
    {
      id: "2",
      name: "Jamie Johnson",
      team: "Disc Jockeys",
      stats: { goals: 8, assists: 15, blocks: 3, totalPoints: 23 },
    },
    {
      id: "3",
      name: "Taylor Brown",
      team: "Disc Jockeys",
      stats: { goals: 5, assists: 10, blocks: 7, totalPoints: 15 },
    },
    {
      id: "4",
      name: "Jordan Lee",
      team: "Sky Walkers",
      stats: { goals: 15, assists: 6, blocks: 4, totalPoints: 21 },
    },
    {
      id: "5",
      name: "Casey Wilson",
      team: "Sky Walkers",
      stats: { goals: 10, assists: 12, blocks: 2, totalPoints: 22 },
    },
    {
      id: "6",
      name: "Riley Garcia",
      team: "Sky Walkers",
      stats: { goals: 7, assists: 9, blocks: 8, totalPoints: 16 },
    },
    {
      id: "7",
      name: "Morgan Davis",
      team: "Wind Chasers",
      stats: { goals: 14, assists: 7, blocks: 6, totalPoints: 21 },
    },
    {
      id: "8",
      name: "Quinn Martinez",
      team: "Wind Chasers",
      stats: { goals: 9, assists: 11, blocks: 5, totalPoints: 20 },
    },
  ]);

  // Sample team data
  const [teams, SET_TEAMS] = useState([
    {
      id: "1",
      name: "Disc Jockeys",
      wins: 5,
      losses: 1,
      pointsScored: 75,
      pointsConceded: 55,
      spiritScore: 9.2,
    },
    {
      id: "2",
      name: "Sky Walkers",
      wins: 4,
      losses: 2,
      pointsScored: 70,
      pointsConceded: 60,
      spiritScore: 9.5,
    },
    {
      id: "3",
      name: "Wind Chasers",
      wins: 3,
      losses: 3,
      pointsScored: 65,
      pointsConceded: 65,
      spiritScore: 8.8,
    },
    {
      id: "4",
      name: "Gravity Defiers",
      wins: 2,
      losses: 4,
      pointsScored: 60,
      pointsConceded: 70,
      spiritScore: 9.0,
    },
  ]);

  const [isCalculating, setIsCalculating] = useState(false);

  // Sort players by total points for MVP
  const mvpPlayers = [...players].sort(
    (a, b) => b.stats.totalPoints - a.stats.totalPoints
  );

  // Sort players by goals for top scorer
  const TOP_SCORERS = [...players].sort((a, b) => b.stats.goals - a.stats.goals);

  // Sort players by assists for top assists
  const TOP_ASSISTS = [...players].sort(
    (a, b) => b.stats.assists - a.stats.assists
  );

  // Sort players by blocks for top defender
  const TOP_DEFENDERS = [...players].sort(
    (a, b) => b.stats.blocks - a.stats.blocks
  );

  // Sort teams by wins for team standings
  const teamStandings = [...teams].sort((a, b) => {
    if (a.wins !== b.wins) return b.wins - a.wins;
    return (
      b.pointsScored - b.pointsConceded - (a.pointsScored - a.pointsConceded)
    );
  });

  // Sort teams by spirit score for spirit award
  const spiritAward = [...teams].sort((a, b) => b.spiritScore - a.spiritScore);

  // Get Mythical 8 (top 8 players by total points)
  const mythical8 = [...players]
    .sort((a, b) => b.stats.totalPoints - a.stats.totalPoints)
    .slice(0, 8);

  const handleRecalculate = () => {
    setIsCalculating(true);
    // Simulate calculation delay
    setTimeout(() => {
      setIsCalculating(false);
    }, 1500);
  };

  const handleExportAwards = () => {
    alert("Awards data would be exported to CSV/PDF");
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-background">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => window.history.back()}>
                Back
              </Button>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                Tournament Awards
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleRecalculate}
                disabled={isCalculating}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isCalculating ? "animate-spin" : ""}`}
                />
                Recalculate
              </Button>
              <Button onClick={handleExportAwards}>
                <Download className="mr-2 h-4 w-4" />
                Export Awards
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="individual">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="individual">Individual Awards</TabsTrigger>
              <TabsTrigger value="team">Team Awards</TabsTrigger>
            </TabsList>

            <TabsContent value="individual" className="space-y-8">
              {/* MVP Award */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Most Valuable Player (MVP)
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Goals</TableHead>
                      <TableHead>Assists</TableHead>
                      <TableHead>Blocks</TableHead>
                      <TableHead>Total Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mvpPlayers.slice(0, 5).map((player, index) => (
                      <TableRow
                        key={player.id}
                        className={index === 0 ? "bg-yellow-50" : ""}
                      >
                        <TableCell>
                          {index === 0 ? (
                            <span className="flex items-center gap-1">
                              <Trophy className="h-4 w-4 text-yellow-500" />
                              {index + 1}
                            </span>
                          ) : (
                            index + 1
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {player.name}
                        </TableCell>
                        <TableCell>{player.team}</TableCell>
                        <TableCell>{player.stats.goals}</TableCell>
                        <TableCell>{player.stats.assists}</TableCell>
                        <TableCell>{player.stats.blocks}</TableCell>
                        <TableCell className="font-bold">
                          {player.stats.totalPoints}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mythical 8 */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Medal className="h-5 w-5 text-blue-500" />
                  Mythical 8
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Goals</TableHead>
                      <TableHead>Assists</TableHead>
                      <TableHead>Blocks</TableHead>
                      <TableHead>Total Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mythical8.map((player) => (
                      <TableRow key={player.id}>
                        <TableCell className="font-medium">
                          {player.name}
                        </TableCell>
                        <TableCell>{player.team}</TableCell>
                        <TableCell>{player.stats.goals}</TableCell>
                        <TableCell>{player.stats.assists}</TableCell>
                        <TableCell>{player.stats.blocks}</TableCell>
                        <TableCell className="font-bold">
                          {player.stats.totalPoints}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="team" className="space-y-8">
              {/* Team Standings */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Team Standings
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Wins</TableHead>
                      <TableHead>Losses</TableHead>
                      <TableHead>Points Scored</TableHead>
                      <TableHead>Points Conceded</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamStandings.map((team, index) => (
                      <TableRow
                        key={team.id}
                        className={index === 0 ? "bg-yellow-50" : ""}
                      >
                        <TableCell>
                          {index === 0 ? (
                            <span className="flex items-center gap-1">
                              <Trophy className="h-4 w-4 text-yellow-500" />
                              {index + 1}
                            </span>
                          ) : (
                            index + 1
                          )}
                        </TableCell>
                        <TableCell>{team.name}</TableCell>
                        <TableCell>{team.wins}</TableCell>
                        <TableCell>{team.losses}</TableCell>
                        <TableCell>{team.pointsScored}</TableCell>
                        <TableCell>{team.pointsConceded}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Spirit Award */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Medal className="h-5 w-5 text-blue-500" />
                  Spirit Award
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team</TableHead>
                      <TableHead>Spirit Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {spiritAward.slice(0, 3).map((team) => (
                      <TableRow key={team.id}>
                        <TableCell>{team.name}</TableCell>
                        <TableCell>{team.spiritScore}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AwardsCalculation;
