import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import AssignmentSchedule from "./AssignmentSchedule";

const MyAssignments = () => {
  const { tournamentId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch assignments for this marshall and tournament
      const assignmentsRef = collection(db, "assignments");
      const assignmentsQuery = query(
        assignmentsRef,
        where("marshallId", "==", currentUser.uid)
      );
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      const assignmentsData = assignmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch matches for this tournament
      const matchesRef = collection(db, "matches");
      const matchesQuery = query(matchesRef, where("tournamentId", "==", tournamentId));
      const matchesSnapshot = await getDocs(matchesQuery);
      const matchesData = matchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Attach match details to assignments
      const assignmentsWithMatch = assignmentsData.map(a => {
        const match = matchesData.find(m => m.id === a.matchId);
        return {
          ...a,
          match,
        };
      });
      setAssignments(assignmentsWithMatch);
      setMatches(matchesData);
      setLoading(false);
    };
    if (currentUser && tournamentId) fetchData();
  }, [currentUser, tournamentId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-background">
      <Card className="border-2 border-primary/10 shadow-lg">
        <CardHeader className="bg-primary/20 pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">My Assignments</CardTitle>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <AssignmentSchedule
            assignments={assignments}
            userRole="marshall"
            onAssignmentUpdate={() => {}}
            onAssignmentDelete={() => {}}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MyAssignments; 