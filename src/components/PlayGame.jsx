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
import { ArrowLeft, Clock, MapPin, Play } from "lucide-react";
import { db } from "../firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";

const PlayGame = ({ onBack = () => {} }) => {
  const { tournamentId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGames = async () => {
    setLoading(true);
    try {
      if (!tournamentId || !currentUser) {
        setGames([]);
        setLoading(false);
        return;
      }
      const matchesRef = collection(db, "matches");
      const matchesQuery = query(matchesRef, where("tournamentId", "==", tournamentId));
      const matchesSnapshot = await getDocs(matchesQuery);
      let matches = matchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (currentUser.role === "marshall") {
        matches = matches.filter(match => match.marshallId === currentUser.uid);
      }
      setGames(matches);
    } catch (error) {
      console.error("Error fetching games:", error);
      setError("Failed to load games. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
    // eslint-disable-next-line
  }, [tournamentId, currentUser]);

  const handleStartGame = async (gameId) => {
    const game = games.find((g) => g.id === gameId);
    if (game) {
      // Update status in Firestore
      await updateDoc(doc(db, "matches", gameId), { status: "In Progress" });
      await fetchGames();
      navigate(`/tournament/${tournamentId}/game/setup/${gameId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg">Loading games...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Games in Tournament</h2>
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <p className="text-gray-500">No games have been scheduled for this tournament yet.</p>
        </div>
      </div>
    );
  }

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
              {games.map((game, idx) => (
                <TableRow key={game.id}>
                  <TableCell className="font-medium">
                    Match {idx + 1}
                  </TableCell>
                  <TableCell>{game.teamA?.name || game.teamAName || "TBD"}</TableCell>
                  <TableCell>{game.teamB?.name || game.teamBName || "TBD"}</TableCell>
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
                      {game.time ? new Date(game.time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }) : "--"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${game.status === "Completed" ? "bg-green-100 text-green-800" : game.status === "In Progress" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}
                    >
                      {game.status}
                    </span>
                  </TableCell>
                  <TableCell>{game.marshallName || game.marshall || "Unassigned"}</TableCell>
                  <TableCell className="text-right">
                    {game.status === "Scheduled" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartGame(game.id)}
                        disabled={!game.teamA || !game.teamB}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Start Game
                      </Button>
                    )}
                    {game.status === "In Progress" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartGame(game.id)}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Continue Game
                      </Button>
                    )}
                    {game.status === "Completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartGame(game.id)}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayGame;