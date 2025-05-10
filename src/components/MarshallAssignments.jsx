import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
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
import {
  Plus,
  Trash2,
  UserPlus,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import AssignmentSchedule from "./AssignmentSchedule";
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
import { useAuth } from "../contexts/AuthContext";
import { useParams } from "react-router-dom";

const MarshallAssignments = ({
  onBack = () => {},
}) => {
  const { tournamentId } = useParams();
  const { currentUser } = useAuth();
  const userRole = currentUser?.role;
  const [marshalls, setMarshalls] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedMarshall, setSelectedMarshall] = useState(null);
  const [activeTab, setActiveTab] = useState("manage");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [assigningMarshall, setAssigningMarshall] = useState(null);
  const [newAssignment, setNewAssignment] = useState({
    time: '',
    pitch: '',
    teams: '',
    date: '',
  });
  const [matches, setMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState('');

  // Fetch marshalls from Firestore
  useEffect(() => {
    const fetchMarshalls = async () => {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("role", "in", ["marshall", "head-marshall"]));
      const snapshot = await getDocs(q);
      const marshallsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMarshalls(marshallsData);
      // Default to first marshall for head-marshall view
      if (!selectedMarshall && marshallsData.length > 0) {
        setSelectedMarshall(marshallsData[0].id);
      }
    };
    fetchMarshalls();
  }, []);

  // Fetch assignments from Firestore
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        console.log("Fetching assignments for tournament:", tournamentId);
        const assignmentsRef = collection(db, "assignments");
        let q;
        if (userRole === "marshall") {
          // Only fetch assignments for this marshall
          q = query(
            assignmentsRef,
            where("marshallId", "==", currentUser.uid),
            where("tournamentId", "==", tournamentId)
          );
        } else {
          // Head-marshall: fetch all assignments for this tournament
          q = query(
            assignmentsRef,
            where("tournamentId", "==", tournamentId)
          );
        }
        const snapshot = await getDocs(q);
        const assignmentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Fetched assignments:", assignmentsData);
        setAssignments(assignmentsData);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    };
    if (currentUser && tournamentId) fetchAssignments();
  }, [userRole, currentUser, tournamentId]);

  // Fetch matches for the current tournament
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        console.log("Fetching matches for tournament:", tournamentId);
        const matchesRef = collection(db, 'matches');
        let q;
        
        if (userRole === "marshall") {
          // For marshalls: fetch only their assigned matches
          q = query(
            matchesRef,
            where('tournamentId', '==', tournamentId),
            where('marshallId', '==', currentUser.uid),
            where('status', 'in', ['Scheduled', 'In Progress'])
          );
        } else {
          // For head-marshall: fetch all matches that have marshalls assigned
          q = query(
            matchesRef,
            where('tournamentId', '==', tournamentId),
            where('marshallId', '!=', ''),
            where('status', 'in', ['Scheduled', 'In Progress'])
          );
        }

        const snapshot = await getDocs(q);
        const matchesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          time: doc.data().time ? new Date(doc.data().time).toISOString() : null
        }));
        console.log("Fetched matches:", matchesData);
        setMatches(matchesData);
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    };
    if (tournamentId) fetchMatches();
  }, [tournamentId, userRole, currentUser]);

  // When a match is selected, auto-fill assignment fields
  useEffect(() => {
    if (!selectedMatchId) return;
    const match = matches.find(m => m.id === selectedMatchId);
    if (match) {
      const matchTime = match.time ? new Date(match.time) : new Date();
      setNewAssignment({
        teams: `${match.teamA?.name || 'TBD'} vs ${match.teamB?.name || 'TBD'}`,
        date: matchTime.toISOString().split('T')[0],
        time: matchTime.toISOString().split('T')[1].slice(0, 5),
        pitch: match.pitch || '',
        matchId: match.id,
        tournamentId: tournamentId,
        status: match.status || 'Scheduled',
        marshallId: match.marshallId || '',
        marshallName: match.marshallName || ''
      });
    }
  }, [selectedMatchId, matches, tournamentId]);

  // Count assignments for each marshall
  const marshallAssignmentCounts = marshalls.reduce((acc, marshall) => {
    acc[marshall.id] = assignments.filter(a => a.marshallId === marshall.id).length;
    return acc;
  }, {});

  // Assign match to marshall
  const handleOpenAssignDialog = (marshall) => {
    setAssigningMarshall(marshall);
    setNewAssignment({ time: '', pitch: '', teams: '', date: '' });
    setIsAssignDialogOpen(true);
  };

  const handleSaveAssignment = async () => {
    if (!assigningMarshall) return;
    const assignment = {
      marshallId: assigningMarshall.id,
      marshallName: assigningMarshall.name || assigningMarshall.displayName || assigningMarshall.email,
      ...newAssignment,
    };
    await addDoc(collection(db, 'assignments'), assignment);
    setIsAssignDialogOpen(false);
    setAssigningMarshall(null);
    setNewAssignment({ time: '', pitch: '', teams: '', date: '' });
    // Refresh assignments
    const assignmentsRef = collection(db, 'assignments');
    const snapshot = await getDocs(assignmentsRef);
    const assignmentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAssignments(assignmentsData);
  };

  const handleViewAssignments = (marshallId) => {
    setSelectedMarshall(marshallId);
    setActiveTab("assignments");
  };

  // Update assignment in Firestore
  const handleAssignmentUpdate = async (updatedAssignment) => {
    if (!updatedAssignment.id) return;
    const assignmentRef = doc(db, 'assignments', updatedAssignment.id);
    await updateDoc(assignmentRef, updatedAssignment);
    // Refresh assignments
    const assignmentsRef = collection(db, 'assignments');
    const snapshot = await getDocs(assignmentsRef);
    const assignmentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAssignments(assignmentsData);
  };

  // Delete assignment in Firestore
  const handleAssignmentDelete = async (assignmentId) => {
    if (!assignmentId) return;
    const assignmentRef = doc(db, 'assignments', assignmentId);
    await deleteDoc(assignmentRef);
    // Refresh assignments
    const assignmentsRef = collection(db, 'assignments');
    const snapshot = await getDocs(assignmentsRef);
    const assignmentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAssignments(assignmentsData);
  };

  // Only Head Marshalls can access this feature
  if (userRole === "marshall") {
    // Only show assignments assigned to this marshall
    const marshallAssignments = assignments.filter(a => a.marshallId === currentUser.uid);
    console.log("Marshall assignments:", marshallAssignments);
    return (
      <div className="w-full max-w-4xl mx-auto p-4 bg-background">
        <Card className="border-2 border-primary/10 shadow-lg">
          <CardHeader className="bg-primary/20 pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">
                My Assignments
          </CardTitle>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
          </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-center mb-2">
                My Match Assignments
              </h2>
              <h3 className="text-lg font-semibold text-center mb-4">
                {currentUser.displayName || currentUser.name || currentUser.email}
              </h3>
              <AssignmentSchedule
                assignments={marshallAssignments}
                userRole={userRole}
                onAssignmentUpdate={handleAssignmentUpdate}
                onAssignmentDelete={handleAssignmentDelete}
              />
            </div>
        </CardContent>
      </Card>
      </div>
    );
  }

  const selectedMarshallData = marshalls.find((m) => m.id === selectedMarshall);
  const marshallAssignments = assignments.filter(
    (a) => a.marshallId === selectedMarshall,
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-background">
      <Card className="border-2 border-primary/10 shadow-lg">
        <CardHeader className="bg-primary/20 pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">
              Digital Score Sheet
            </CardTitle>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="manage">Manage Marshalls</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
            </TabsList>

            <TabsContent value="manage" className="mt-0">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Current Marshalls</h3>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Assignments</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marshalls.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center py-4 text-muted-foreground"
                      >
                        No marshalls added yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    marshalls.map((marshall) => (
                      <TableRow key={marshall.id}>
                        <TableCell
                          className="font-medium cursor-pointer hover:text-primary hover:underline"
                          onClick={() => handleViewAssignments(marshall.id)}
                        >
                          {marshall.name || marshall.displayName || marshall.email}
                        </TableCell>
                        <TableCell>{marshallAssignmentCounts[marshall.id] || 0}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewAssignments(marshall.id)}
                              title="View Assignments"
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenAssignDialog(marshall)}
                              title="Assign Match"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <div className="mt-6 flex justify-center gap-4">
                <Button variant="outline" onClick={onBack}>
                  Main Menu
                </Button>
              </div>

              {/* Assign Match Dialog */}
              <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign Match to {assigningMarshall?.name || assigningMarshall?.displayName || assigningMarshall?.email}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="match">Match</Label>
                      <select
                        id="match"
                        className="w-full border rounded p-2"
                        value={selectedMatchId}
                        onChange={e => setSelectedMatchId(e.target.value)}
                      >
                        <option value="">Select a match</option>
                        {matches.map(match => (
                          <option key={match.id} value={match.id}>
                            {`${match.teamA?.name || 'TBD'} vs ${match.teamB?.name || 'TBD'} | ${match.pitch || ''} | ${match.time ? new Date(match.time).toLocaleString() : ''}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="teams">Teams</Label>
                      <Input
                        id="teams"
                        value={newAssignment.teams}
                        onChange={e => setNewAssignment({ ...newAssignment, teams: e.target.value })}
                        placeholder="e.g. Team A vs Team B"
                        disabled
                      />
                    </div>
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newAssignment.date}
                        onChange={e => setNewAssignment({ ...newAssignment, date: e.target.value })}
                        disabled
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        value={newAssignment.time}
                        onChange={e => setNewAssignment({ ...newAssignment, time: e.target.value })}
                        placeholder="e.g. 10:00-11:00"
                        disabled
                      />
                    </div>
                    <div>
                      <Label htmlFor="pitch">Pitch</Label>
                      <Input
                        id="pitch"
                        value={newAssignment.pitch}
                        onChange={e => setNewAssignment({ ...newAssignment, pitch: e.target.value })}
                        placeholder="e.g. Pitch 1"
                        disabled
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveAssignment} disabled={!selectedMatchId}>
                      Assign
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="assignments" className="mt-0">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-center mb-2">
                  Assignments
                </h2>
                <h3 className="text-lg font-semibold text-center mb-4">
                  {selectedMarshallData?.name || "Select a Marshall"}
                </h3>

                <AssignmentSchedule
                  assignments={marshallAssignments}
                  userRole={userRole}
                  onAssignmentUpdate={handleAssignmentUpdate}
                  onAssignmentDelete={handleAssignmentDelete}
                />
              </div>

              <div className="flex flex-col gap-2 mt-6">
                <Button className="bg-red-600 hover:bg-red-700 w-full">
                  Reschedule
                </Button>
                <Button
                  variant="outline"
                  className="bg-green-600 hover:bg-green-700 text-white w-full"
                  onClick={() => setActiveTab("manage")}
                >
                  Main Menu
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarshallAssignments;
