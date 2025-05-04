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

const BracketManagement = ({
  tournamentId = "1",
  onBack = () => {},
  userRole = null,
}) => {
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [currentRound, setCurrentRound] = useState("Round Robin");
  const [currentBracket, setCurrentBracket] = useState("A");
  const [editingMatch, setEditingMatch] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddMatchDialogOpen, setIsAddMatchDialogOpen] = useState(false);
  const [newMatch, setNewMatch] = useState({
    teamA: null,
    teamB: null,
    scoreA: null,
    scoreB: null,
    pitch: "Pitch 1",
    time: new Date().toISOString(),
    status: "Scheduled",
    round: currentRound,
    bracket: currentBracket,
    marshall: "",
  });
  const [loading, setLoading] = useState(true);

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

        // Fetch matches
        const matchesCollection = collection(db, "matches");
        const matchesQuery = query(matchesCollection, where("tournamentId", "==", tournamentId));
        const matchesSnapshot = await getDocs(matchesQuery);
        
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
            
            setMatches(initialMatches);
          }
        } else {
          // Format matches with team objects
          const matchesData = await Promise.all(
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
          
          setMatches(matchesData);
          
          // Set initial round if matches exist
          if (matchesData.length > 0) {
            const rounds = Array.from(new Set(matchesData.map(match => match.round)));
            setCurrentRound(rounds[0] || "Round Robin");
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };

    fetchTeamsAndMatches();
  }, [tournamentId]);

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
        teamAId: editingMatch.teamA?.id || null,
        teamBId: editingMatch.teamB?.id || null,
        // Keep teamA and teamB objects for local state
      };
      
      await updateDoc(matchRef, matchData);
      
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
      teamA: null,
      teamB: null,
      scoreA: null,
      scoreB: null,
      pitch: "Pitch 1",
      time: new Date().toISOString(),
      status: "Scheduled",
      round: currentRound,
      bracket: currentBracket,
      marshall: "",
    });
    setIsAddMatchDialogOpen(true);
  };

  const handleSaveNewMatch = async () => {
    if (!newMatch.teamA || !newMatch.teamB) return;

    try {
      const completeMatch = {
        teamAId: newMatch.teamA.id,
        teamBId: newMatch.teamB.id,
        scoreA: newMatch.scoreA || null,
        scoreB: newMatch.scoreB || null,
        pitch: newMatch.pitch || "Pitch 1",
        time: newMatch.time || new Date().toISOString(),
        status: newMatch.status || "Scheduled",
        round: newMatch.round || currentRound,
        bracket: newMatch.bracket || currentBracket,
        marshall: newMatch.marshall || "",
        tournamentId: tournamentId,
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, "matches"), completeMatch);
      
      // Add to local state with the full team objects
      const matchWithId = {
        id: docRef.id,
        ...completeMatch,
        teamA: newMatch.teamA,
        teamB: newMatch.teamB,
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

  // Check if user has permission to access this section
  const canUpdateScores =
    userRole === "head-marshall" || userRole === "marshall";
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

  if (loading) {
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
                Back
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
                <Button variant="outline" onClick={handleAddMatch}>
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
                    <TableCell>{match.marshall || "Unassigned"}</TableCell>
                    {userRole === "head-marshall" && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditMatch(match)}
                        >
                          <Edit className="h-4 w-4" />
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
                <Input
                  id="marshall"
                  value={editingMatch.marshall || ""}
                  onChange={(e) =>
                    setEditingMatch({
                      ...editingMatch,
                      marshall: e.target.value,
                    })
                  }
                  placeholder="Assigned Marshall"
                />
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
                  value={newMatch.teamA?.id || ""}
                  onValueChange={(value) => {
                    const team = teams.find((t) => t.id === value) || null;
                    setNewMatch({
                      ...newMatch,
                      teamA: team,
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
                  value={newMatch.teamB?.id || ""}
                  onValueChange={(value) => {
                    const team = teams.find((t) => t.id === value) || null;
                    setNewMatch({
                      ...newMatch,
                      teamB: team,
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
              <Input
                id="marshall"
                value={newMatch.marshall || ""}
                onChange={(e) =>
                  setNewMatch({
                    ...newMatch,
                    marshall: e.target.value,
                  })
                }
                placeholder="Assigned Marshall"
              />
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