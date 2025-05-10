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
import { useAuth } from "../contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";

const TournamentGames = ({ onBack = () => {} }) => {
  const { tournamentId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        if (!tournamentId || !currentUser) {
          setMatches([]);
          setLoading(false);
          return;
        }
        const matchesRef = collection(db, "matches");
        const matchesQuery = query(matchesRef, where("tournamentId", "==", tournamentId));
        const matchesSnapshot = await getDocs(matchesQuery);
        let allMatches = matchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (currentUser.role === "marshall") {
          allMatches = allMatches.filter(match => match.marshallId === currentUser.uid);
        }
        setMatches(allMatches);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [tournamentId, currentUser]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-background">
      <Card className="rounded-2xl shadow-lg border-2 border-primary/10">
        <CardHeader className="bg-primary/10 rounded-t-2xl pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={onBack} className="rounded-lg font-semibold">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <CardTitle className="text-2xl font-bold">
                Tournament Games
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading games...</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No games scheduled for this tournament
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full bg-white rounded-xl">
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
                  {matches.map((match, idx) => (
                    <TableRow key={match.id} className="hover:bg-accent/30 transition">
                      <TableCell className="font-semibold">Match {idx + 1}</TableCell>
                      <TableCell>{match.teamA?.name || match.teamAName || "TBD"}</TableCell>
                      <TableCell>{match.teamB?.name || match.teamBName || "TBD"}</TableCell>
                      <TableCell>
                        {match.scoreA !== null && match.scoreB !== null
                          ? `${match.scoreA} - ${match.scoreB}`
                          : "--"}
                      </TableCell>
                      <TableCell>{match.pitch}</TableCell>
                      <TableCell>
                        {match.time ? (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {new Date(match.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : "--"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            match.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : match.status === "In Progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {match.status}
                        </span>
                      </TableCell>
                      <TableCell>{match.marshallName || "Unassigned"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg flex items-center gap-2 font-semibold border-primary/30"
                          onClick={() => navigate(`/tournament/${tournamentId}/game/play/${match.id}`)}
                          disabled={match.status !== "Scheduled"}
                        >
                          <Play className="h-4 w-4" /> Start Game
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TournamentGames;