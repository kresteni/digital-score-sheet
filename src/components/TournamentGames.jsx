import React, { useState, useEffect } from "react";
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
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const TournamentGames = ({
  tournamentId,
  onBack = () => {},
  onStartGame = () => {},
  userRole = null,
}) => {
  const [games, setGames] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch teams and games when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch teams for this tournament
        const teamsCollection = collection(db, "teams");
        const teamsQuery = query(teamsCollection, where("tournamentId", "==", tournamentId));
        const teamsSnapshot = await getDocs(teamsQuery);
        const teamsData = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTeams(teamsData);

        // Fetch games for this tournament
        const gamesCollection = collection(db, "games");
        const gamesQuery = query(gamesCollection, where("tournamentId", "==", tournamentId));
        const gamesSnapshot = await getDocs(gamesQuery);
        
        if (gamesSnapshot.empty) {
          setGames([]);
        } else {
          const gamesData = gamesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setGames(gamesData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (tournamentId) {
      fetchData();
    }
  }, [tournamentId]);

  const handleStartGame = async (gameId) => {
    // Find the game data
    const game = games.find((g) => g.id === gameId);
    if (!game) return;

    try {
      // Update the game status in Firestore
      const gameRef = doc(db, "games", gameId);
      await updateDoc(gameRef, {
        status: "In Progress",
        startTime: serverTimestamp(),
      });

      // Update local state
      setGames(
        games.map((g) =>
          g.id === gameId ? { ...g, status: "In Progress" } : g
        )
      );
      
      // Call the parent handler with the game data
      onStartGame(game);
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  // Format time for display
  const formatTime = (timestamp) => {
    if (!timestamp) return "--";
    
    // Handle both Firestore Timestamps and regular date strings
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get team name by ID
  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : "Unknown Team";
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
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading games...</p>
            </div>
          ) : games.length === 0 ? (
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
                      Match {game.matchNumber || game.id.substring(0, 4)}
                    </TableCell>
                    <TableCell>{game.teamAId ? getTeamName(game.teamAId) : game.teamA}</TableCell>
                    <TableCell>{game.teamBId ? getTeamName(game.teamBId) : game.teamB}</TableCell>
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
                        {formatTime(game.time)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          game.status === "Completed" 
                            ? "bg-green-100 text-green-800" 
                            : game.status === "In Progress" 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}
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