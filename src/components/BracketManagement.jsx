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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ArrowLeft, Edit, Plus, Save, X, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  generateRoundRobinMatches,
  generateCrossoverMatches,
  generateEliminationMatches,
  updateTeamRankings,
  generateNextRound,
} from "../utils/bracketGeneration";
import { v4 as uuidv4 } from "uuid";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { format } from "date-fns";
import { useAuth } from "../contexts/AuthContext";
import { useParams } from "react-router-dom";

const BracketManagement = ({
  onBack = () => {},
}) => {
  const { tournamentId } = useParams();
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [currentRound, setCurrentRound] = useState("Round Robin");
  const [currentBracket, setCurrentBracket] = useState("A");
  const [editingMatch, setEditingMatch] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddMatchDialogOpen, setIsAddMatchDialogOpen] = useState(false);
  const [newMatch, setNewMatch] = useState({
    teamAId: "",
    teamAName: "",
    teamBId: "",
    teamBName: "",
    scoreA: null,
    scoreB: null,
    pitch: "Pitch 1",
    time: new Date().toISOString(),
    endTime: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
    status: "Scheduled",
    round: currentRound,
    bracket: currentBracket,
    marshallId: "",
    marshallName: "",
  });
  const [loading, setLoading] = useState(true);
  const { currentUser, loading: authLoading } = useAuth();
  const userRole = currentUser?.role;
  const [marshalls, setMarshalls] = useState([]);

  // Get unique rounds from matches
  const rounds = Array.from(new Set(matches.map((match) => match.round)));

  // Fetch teams and matches for the tournament
  useEffect(() => {
    const fetchTeamsAndMatches = async () => {
      setLoading(true);
      try {
        // Fetch teams
        const teamsCollection = collection(db, "teams");
        const teamsQuery = query(teamsCollection, where("tournamentId", "==", tournamentId));
        const teamsSnapshot = await getDocs(teamsQuery);
        const teamsData = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTeams(teamsData);
        console.log("Current tournamentId:", tournamentId);
        console.log("Teams fetched:", teamsData);

        // Fetch matches
        const matchesCollection = collection(db, "matches");
        const matchesQuery = query(matchesCollection, where("tournamentId", "==", tournamentId));
        const matchesSnapshot = await getDocs(matchesQuery);
        
        let matchesData = [];
        if (matchesSnapshot.empty) {
          // If no matches exist, initialize with round robin
          const poolATeams = teamsData.filter((team) => team.pool === "A");
          const poolBTeams = teamsData.filter((team) => team.pool === "B");

          if (poolATeams.length > 0 || poolBTeams.length > 0) {
            const roundRobinMatchesA = generateRoundRobinMatches(poolATeams, "A");
            const roundRobinMatchesB = generateRoundRobinMatches(poolBTeams, "B");
            
            // Save initial matches to Firestore
            const initialMatches = [...roundRobinMatchesA, ...roundRobinMatchesB];
            await Promise.all(initialMatches.map(match => 
              addDoc(collection(db, "matches"), { ...match, tournamentId })
            ));
            
            matchesData = initialMatches;
          }
        } else {
          // Format matches with team objects
          matchesData = await Promise.all(
            matchesSnapshot.docs.map(async (matchDoc) => {
              const matchData = matchDoc.data();
              
              // Find full team objects
              const teamA = teamsData.find(team => team.id === matchData.teamAId) || null;
              const teamB = teamsData.find(team => team.id === matchData.teamBId) || null;
              
              return {
                id: matchDoc.id,
                ...matchData,
                teamA,
                teamB
              };
            })
          );
        }
        setMatches(matchesData);

        // --- SYNC ASSIGNMENTS ---
        // For each match with a marshallId, ensure an assignment exists
        const assignmentsRef = collection(db, "assignments");
        for (const match of matchesData) {
          if (match.marshallId) {
            const q = query(assignmentsRef, where("matchId", "==", match.id));
            const existingAssignments = await getDocs(q);
            const assignmentData = {
              marshallId: match.marshallId,
              marshallName: match.marshallName,
              matchId: match.id,
              teams: `${match.teamA?.name || 'TBD'} vs ${match.teamB?.name || 'TBD'}`,
              date: match.time ? match.time.split('T')[0] : '',
              time: match.time ? match.time.split('T')[1]?.slice(0,5) : '',
              pitch: match.pitch || '',
              tournamentId: tournamentId,
              status: match.status || 'Scheduled'
            };
            if (existingAssignments.empty) {
              await addDoc(assignmentsRef, assignmentData);
            } else {
              const assignmentDoc = existingAssignments.docs[0];
              await updateDoc(doc(db, "assignments", assignmentDoc.id), assignmentData);
            }
          }
        }
        // --- END SYNC ASSIGNMENTS ---

        // Set initial round if matches exist
        if (matchesData.length > 0) {
          const rounds = Array.from(new Set(matchesData.map(match => match.round)));
          setCurrentRound(rounds[0] || "Round Robin");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };

    fetchTeamsAndMatches();
  }, [tournamentId]);

  // Fetch marshalls from Firestore
  useEffect(() => {
    const fetchMarshalls = async () => {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("role", "in", ["marshall", "head-marshall"]));
      const snapshot = await getDocs(q);
      const marshallsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMarshalls(marshallsData);
    };
    fetchMarshalls();
  }, []);

  // Filter matches by current round and bracket
  const filteredMatches = matches.filter(
    (match) => match.round === currentRound && match.bracket === currentBracket,
  );

  const handleEditMatch = (match) => {
    setEditingMatch({ ...match });
    setIsEditDialogOpen(true);
  };

  const handleSaveMatch = async () => {
    if (!editingMatch) return;

    try {
      // Update match in Firestore
      const matchRef = doc(db, "matches", editingMatch.id);
      
      // Prepare data for Firestore (store team IDs instead of objects)
      const matchData = {
        ...editingMatch,
        teamAId: editingMatch.teamA?.id || editingMatch.teamAId || null,
        teamBId: editingMatch.teamB?.id || editingMatch.teamBId || null,
        endTime: editingMatch.endTime || new Date(new Date(editingMatch.time).getTime() + 60 * 60 * 1000).toISOString(),
        tournamentId: tournamentId
      };
      
      await updateDoc(matchRef, matchData);

      // If a marshall is assigned, create or update the assignment
      if (editingMatch.marshallId) {
        const assignmentsRef = collection(db, "assignments");
        const q = query(assignmentsRef, where("matchId", "==", editingMatch.id));
        const existingAssignments = await getDocs(q);
        
        const assignmentData = {
          marshallId: editingMatch.marshallId,
          marshallName: editingMatch.marshallName,
          matchId: editingMatch.id,
          teams: `${editingMatch.teamA?.name || 'TBD'} vs ${editingMatch.teamB?.name || 'TBD'}`,
          date: editingMatch.time ? editingMatch.time.split('T')[0] : '',
          time: editingMatch.time ? editingMatch.time.split('T')[1]?.slice(0,5) : '',
          pitch: editingMatch.pitch || '',
          tournamentId: tournamentId,
          status: editingMatch.status || 'Scheduled'
        };

        if (existingAssignments.empty) {
          // Create new assignment
          await addDoc(assignmentsRef, assignmentData);
        } else {
          // Update existing assignment
          const assignmentDoc = existingAssignments.docs[0];
          await updateDoc(doc(db, "assignments", assignmentDoc.id), assignmentData);
        }
      } else {
        // If no marshall is assigned, remove any existing assignment
        const assignmentsRef = collection(db, "assignments");
        const q = query(assignmentsRef, where("matchId", "==", editingMatch.id));
        const existingAssignments = await getDocs(q);
        if (!existingAssignments.empty) {
          const assignmentDoc = existingAssignments.docs[0];
          await deleteDoc(doc(db, "assignments", assignmentDoc.id));
        }
      }
      
      // Update local state
      setMatches(
        matches.map((match) =>
          match.id === editingMatch.id ? editingMatch : match
        )
      );
      
      setIsEditDialogOpen(false);
      setEditingMatch(null);
    } catch (error) {
      console.error("Error updating match:", error);
    }
  };

  const handleAddMatch = () => {
    setNewMatch({
      teamAId: "",
      teamAName: "",
      teamBId: "",
      teamBName: "",
      scoreA: null,
      scoreB: null,
      pitch: "Pitch 1",
      time: new Date().toISOString(),
      endTime: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
      status: "Scheduled",
      round: currentRound,
      bracket: currentBracket,
      marshallId: "",
      marshallName: "",
    });
    setIsAddMatchDialogOpen(true);
  };

  const handleSaveNewMatch = async () => {
    if (!newMatch.teamAId || !newMatch.teamBId) return;

    try {
      const completeMatch = {
        teamAId: newMatch.teamAId,
        teamBId: newMatch.teamBId,
        teamAName: newMatch.teamAName,
        teamBName: newMatch.teamBName,
        scoreA: newMatch.scoreA || null,
        scoreB: newMatch.scoreB || null,
        pitch: newMatch.pitch || "Pitch 1",
        time: newMatch.time || new Date().toISOString(),
        endTime: newMatch.endTime || new Date(new Date(newMatch.time).getTime() + 60 * 60 * 1000).toISOString(),
        status: newMatch.status || "Scheduled",
        round: newMatch.round || currentRound,
        bracket: newMatch.bracket || currentBracket,
        marshallId: newMatch.marshallId || "",
        marshallName: newMatch.marshallName || "",
        tournamentId: tournamentId,
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, "matches"), completeMatch);
      
      // Add to local state with the full team objects
      const matchWithId = {
        id: docRef.id,
        ...completeMatch,
        teamA: teams.find(t => t.id === newMatch.teamAId),
        teamB: teams.find(t => t.id === newMatch.teamBId),
      };
      
      setMatches([...matches, matchWithId]);
      setIsAddMatchDialogOpen(false);
    } catch (error) {
      console.error("Error adding match:", error);
    }
  };

  const checkAllMatchesCompleted = (round) => {
    const roundMatches = matches.filter((match) => match.round === round);
    return (
      roundMatches.length > 0 &&
      roundMatches.every((match) => match.status === "Completed")
    );
  };

  const generateNextRoundMatches = async () => {
    // Update team rankings based on match results
    const rankedTeams = updateTeamRankings(teams, matches);

    let newMatches = [];

    if (
      currentRound === "Round Robin" &&
      checkAllMatchesCompleted("Round Robin")
    ) {
      // Generate crossover matches
      const poolATeams = rankedTeams.filter((team) => team.pool === "A");
      const poolBTeams = rankedTeams.filter((team) => team.pool === "B");

      newMatches = generateCrossoverMatches(
        poolATeams,
        poolBTeams,
        new Date().toISOString(),
      );
    } else if (
      currentRound === "Crossover" &&
      checkAllMatchesCompleted("Crossover")
    ) {
      // Get winners from crossover matches
      const winners = [];
      matches
        .filter(
          (match) =>
            match.round === "Crossover" && match.status === "Completed",
        )
        .forEach((match) => {
          if (match.scoreA !== null && match.scoreB !== null) {
            if (match.scoreA > match.scoreB && match.teamA) {
              winners.push(match.teamA);
            } else if (match.scoreB > match.scoreA && match.teamB) {
              winners.push(match.teamB);
            }
          }
        });

      newMatches = generateEliminationMatches(
        winners,
        "Quarter-Finals",
        new Date().toISOString(),
      );
    } else if (
      currentRound === "Quarter-Finals" &&
      checkAllMatchesCompleted("Quarter-Finals")
    ) {
      // Get winners from quarter-finals
      const winners = [];
      matches
        .filter(
          (match) =>
            match.round === "Quarter-Finals" && match.status === "Completed",
        )
        .forEach((match) => {
          if (match.scoreA !== null && match.scoreB !== null) {
            if (match.scoreA > match.scoreB && match.teamA) {
              winners.push(match.teamA);
            } else if (match.scoreB > match.scoreA && match.teamB) {
              winners.push(match.teamB);
            }
          }
        });

      newMatches = generateEliminationMatches(
        winners,
        "Semi-Finals",
        new Date().toISOString(),
      );
    } else if (
      currentRound === "Semi-Finals" &&
      checkAllMatchesCompleted("Semi-Finals")
    ) {
      // Get winners from semi-finals
      const winners = [];
      matches
        .filter(
          (match) =>
            match.round === "Semi-Finals" && match.status === "Completed",
        )
        .forEach((match) => {
          if (match.scoreA !== null && match.scoreB !== null) {
            if (match.scoreA > match.scoreB && match.teamA) {
              winners.push(match.teamA);
            } else if (match.scoreB > match.scoreA && match.teamB) {
              winners.push(match.teamB);
            }
          }
        });

      newMatches = generateEliminationMatches(
        winners,
        "Finals",
        new Date().toISOString(),
      );
    }

    if (newMatches.length > 0) {
      try {
        // Prepare matches for Firestore with team IDs
        const firestoreMatches = newMatches.map(match => ({
          ...match,
          teamAId: match.teamA?.id || null,
          teamBId: match.teamB?.id || null,
          tournamentId: tournamentId
        }));
        
        // Add to Firestore and get new IDs
        const addedMatches = await Promise.all(
          firestoreMatches.map(async (match) => {
            const docRef = await addDoc(collection(db, "matches"), match);
            return { id: docRef.id, ...match, teamA: match.teamA, teamB: match.teamB };
          })
        );
        
        setMatches([...matches, ...addedMatches]);
        
        // Set current round to the newly generated round
        if (addedMatches[0]) {
          setCurrentRound(addedMatches[0].round);
        }
      } catch (error) {
        console.error("Error generating next round:", error);
      }
    }
  };

  // Add delete match handler
  const handleDeleteMatch = async (matchId) => {
    try {
      await deleteDoc(doc(db, "matches", matchId));
      // Refresh matches from Firestore
      const matchesCollection = collection(db, "matches");
      const matchesQuery = query(matchesCollection, where("tournamentId", "==", tournamentId));
      const matchesSnapshot = await getDocs(matchesQuery);
      const matchesData = await Promise.all(
        matchesSnapshot.docs.map(async (matchDoc) => {
          const matchData = matchDoc.data();
          const teamA = teams.find(team => team.id === matchData.teamAId) || null;
          const teamB = teams.find(team => team.id === matchData.teamBId) || null;
          return {
            id: matchDoc.id,
            ...matchData,
            teamA,
            teamB
          };
        })
      );
      setMatches(matchesData);
    } catch (error) {
      console.error("Error deleting match:", error);
    }
  };

  // Check if user has permission to access this section
  const canUpdateScores = userRole === "head-marshall" || userRole === "marshall";
  if (!canUpdateScores) {
    return null;
  }

  if (loading || !currentUser) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            Loading...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Loading tournament bracket data...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-background">
      <Card className="border-2 border-primary/10 shadow-lg">
        <CardHeader className="bg-primary/20 pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tournament
              </Button>
              <CardTitle className="text-2xl font-bold">
                Tournament Bracket
              </CardTitle>
            </div>
            {userRole === "head-marshall" && (
              <div className="flex gap-2">
                {checkAllMatchesCompleted(currentRound) && (
                  <Button onClick={generateNextRoundMatches}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate Next Round
                  </Button>
                )}
                <Button variant="outline" onClick={handleAddMatch} disabled={loading}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Match
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Tabs
              value={currentRound}
              onValueChange={setCurrentRound}
              className="w-full"
            >
              <TabsList className="grid grid-cols-6 w-full mb-4">
                {rounds.map((round) => (
                  <TabsTrigger key={round} value={round}>
                    {round}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <Tabs
              value={currentBracket}
              onValueChange={(value) => setCurrentBracket(value)}
              className="w-full mt-4"
            >
              <TabsList className="grid grid-cols-3 w-full mb-4">
                <TabsTrigger value="A">Bracket A</TabsTrigger>
                <TabsTrigger value="B">Bracket B</TabsTrigger>
                <TabsTrigger value="C">Bracket C</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team A</TableHead>
                <TableHead>Team B</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Pitch</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Marshall</TableHead>
                {userRole === "head-marshall" && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMatches.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={userRole === "head-marshall" ? 7 : 6}
                    className="text-center py-4"
                  >
                    No matches in this bracket for the selected round
                  </TableCell>
                </TableRow>
              ) : (
                filteredMatches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell>{match.teamA?.name || "TBD"}</TableCell>
                    <TableCell>{match.teamB?.name || "TBD"}</TableCell>
                    <TableCell>
                      {match.scoreA !== null && match.scoreB !== null
                        ? `${match.scoreA} - ${match.scoreB}`
                        : "--"}
                    </TableCell>
                    <TableCell>{match.pitch}</TableCell>
                    <TableCell>
                      {match.time && match.endTime
                        ? `${format(new Date(match.time), "hh:mm")}-${format(new Date(match.endTime), "hh:mm a")}`
                        : "--"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
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
                    {userRole === "head-marshall" && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditMatch(match)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMatch(match.id)}
                          title="Delete Match"
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Match Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Match</DialogTitle>
          </DialogHeader>
          {editingMatch && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="teamA">Team A</Label>
                  <Select
                    value={editingMatch.teamA?.id || ""}
                    onValueChange={(value) => {
                      const team = teams.find((t) => t.id === value) || null;
                      setEditingMatch({
                        ...editingMatch,
                        teamA: team,
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Team A" />
                    </SelectTrigger>
                    {loading ? (
                    <SelectContent>
                        <SelectItem value="" disabled>Loading teams...</SelectItem>
                      </SelectContent>
                    ) : (
                      <SelectContent>
                        {teams
                          .filter(team => team.tournamentId === tournamentId)
                          .map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                    )}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="teamB">Team B</Label>
                  <Select
                    value={editingMatch.teamB?.id || ""}
                    onValueChange={(value) => {
                      const team = teams.find((t) => t.id === value) || null;
                      setEditingMatch({
                        ...editingMatch,
                        teamB: team,
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Team B" />
                    </SelectTrigger>
                    {loading ? (
                    <SelectContent>
                        <SelectItem value="" disabled>Loading teams...</SelectItem>
                      </SelectContent>
                    ) : (
                      <SelectContent>
                        {teams
                          .filter(team => team.tournamentId === tournamentId)
                          .map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                    )}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scoreA">Score A</Label>
                  <Input
                    id="scoreA"
                    type="number"
                    value={
                      editingMatch.scoreA !== null ? editingMatch.scoreA : ""
                    }
                    onChange={(e) =>
                      setEditingMatch({
                        ...editingMatch,
                        scoreA: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="scoreB">Score B</Label>
                  <Input
                    id="scoreB"
                    type="number"
                    value={
                      editingMatch.scoreB !== null ? editingMatch.scoreB : ""
                    }
                    onChange={(e) =>
                      setEditingMatch({
                        ...editingMatch,
                        scoreB: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="pitch">Pitch</Label>
                <Select
                  value={editingMatch.pitch}
                  onValueChange={(value) =>
                    setEditingMatch({ ...editingMatch, pitch: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Pitch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pitch 1">Pitch 1</SelectItem>
                    <SelectItem value="Pitch 2">Pitch 2</SelectItem>
                    <SelectItem value="Pitch 3">Pitch 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={editingMatch.time ? format(new Date(editingMatch.time), "HH:mm") : ""}
                  onChange={(e) => {
                    // Convert time input to ISO string with today's date
                    const [hours, minutes] = e.target.value.split(":");
                    const now = new Date();
                    const iso = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes).toISOString();
                    setEditingMatch({ ...editingMatch, time: iso });
                  }}
                  step="900"
                />
              </div>

              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={editingMatch.endTime ? format(new Date(editingMatch.endTime), "HH:mm") : ""}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(":");
                    const now = new Date();
                    const iso = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes).toISOString();
                    setEditingMatch({ ...editingMatch, endTime: iso });
                  }}
                  step="900"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editingMatch.status}
                  onValueChange={(value) =>
                    setEditingMatch({
                      ...editingMatch,
                      status: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bracket">Bracket</Label>
                <Select
                  value={editingMatch.bracket}
                  onValueChange={(value) =>
                    setEditingMatch({
                      ...editingMatch,
                      bracket: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Bracket" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Bracket A</SelectItem>
                    <SelectItem value="B">Bracket B</SelectItem>
                    <SelectItem value="C">Bracket C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="marshall">Marshall</Label>
                <Select
                  value={editingMatch.marshallId || ""}
                  onValueChange={(value) => {
                    const marshall = marshalls.find((m) => m.id === value) || null;
                    setEditingMatch({
                      ...editingMatch,
                      marshallId: marshall?.id || "",
                      marshallName: marshall?.name || marshall?.displayName || marshall?.email || "",
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Marshall" />
                  </SelectTrigger>
                  <SelectContent>
                    {marshalls.map((marshall) => (
                      <SelectItem key={marshall.id} value={marshall.id}>
                        {marshall.name || marshall.displayName || marshall.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSaveMatch}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Match Dialog */}
      <Dialog
        open={isAddMatchDialogOpen}
        onOpenChange={setIsAddMatchDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Match</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="teamA">Team A</Label>
                <Select
                  value={newMatch.teamAId}
                  onValueChange={(value) => {
                    const team = teams.find((t) => t.id === value);
                    setNewMatch({
                      ...newMatch,
                      teamAId: team?.id || "",
                      teamAName: team?.name || "",
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Team A" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="teamB">Team B</Label>
                <Select
                  value={newMatch.teamBId}
                  onValueChange={(value) => {
                    const team = teams.find((t) => t.id === value);
                    setNewMatch({
                      ...newMatch,
                      teamBId: team?.id || "",
                      teamBName: team?.name || "",
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Team B" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="pitch">Pitch</Label>
              <Select
                value={newMatch.pitch || "Pitch 1"}
                onValueChange={(value) =>
                  setNewMatch({ ...newMatch, pitch: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Pitch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pitch 1">Pitch 1</SelectItem>
                  <SelectItem value="Pitch 2">Pitch 2</SelectItem>
                  <SelectItem value="Pitch 3">Pitch 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={newMatch.time ? format(new Date(newMatch.time), "HH:mm") : ""}
                onChange={(e) => {
                  // Convert time input to ISO string with today's date
                  const [hours, minutes] = e.target.value.split(":");
                  const now = new Date();
                  const iso = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes).toISOString();
                  setNewMatch({ ...newMatch, time: iso });
                }}
                step="900"
              />
            </div>

            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={newMatch.endTime ? format(new Date(newMatch.endTime), "HH:mm") : ""}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(":");
                  const now = new Date();
                  const iso = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes).toISOString();
                  setNewMatch({ ...newMatch, endTime: iso });
                }}
                step="900"
              />
            </div>

            <div>
              <Label htmlFor="bracket">Bracket</Label>
              <Select
                value={newMatch.bracket || currentBracket}
                onValueChange={(value) =>
                  setNewMatch({
                    ...newMatch,
                    bracket: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Bracket" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Bracket A</SelectItem>
                  <SelectItem value="B">Bracket B</SelectItem>
                  <SelectItem value="C">Bracket C</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="round">Round</Label>
              <Select
                value={newMatch.round || currentRound}
                onValueChange={(value) =>
                  setNewMatch({ ...newMatch, round: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Round" />
                </SelectTrigger>
                <SelectContent>
                  {rounds.map((round) => (
                    <SelectItem key={round} value={round}>
                      {round}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="marshall">Marshall</Label>
              <Select
                value={newMatch.marshallId || ""}
                onValueChange={(value) => {
                  const marshall = marshalls.find((m) => m.id === value) || null;
                  setNewMatch({
                    ...newMatch,
                    marshallId: marshall?.id || "",
                    marshallName: marshall?.name || marshall?.displayName || marshall?.email || "",
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Marshall" />
                </SelectTrigger>
                <SelectContent>
                  {marshalls.map((marshall) => (
                    <SelectItem key={marshall.id} value={marshall.id}>
                      {marshall.name || marshall.displayName || marshall.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddMatchDialogOpen(false)}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSaveNewMatch}>
              <Save className="mr-2 h-4 w-4" />
              Add Match
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BracketManagement;