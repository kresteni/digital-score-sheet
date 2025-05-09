import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Trophy, Calendar, Disc3 } from "lucide-react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";

const InitialMenu = () => {
  const { userRole, loading } = useAuth();
  const [showNoTournamentDialog, setShowNoTournamentDialog] = useState(false);
  const navigate = useNavigate();

  const handleNewTournament = () => {
    navigate("/tournament/new/setup");
  };

  const handleCurrentTournament = async () => {
    try {
      // Query for active tournaments using both isFinished: false and status: 'active'
      const tournamentsRef = collection(db, "tournaments");
      const q1 = query(tournamentsRef, where("isFinished", "==", false));
      const q2 = query(tournamentsRef, where("status", "==", "active"));
      const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);

      // Merge results, avoiding duplicates
      const tournamentsMap = new Map();
      snapshot1.forEach(doc => tournamentsMap.set(doc.id, doc.data()));
      snapshot2.forEach(doc => tournamentsMap.set(doc.id, doc.data()));
      const tournaments = Array.from(tournamentsMap.entries()).map(([id, data]) => ({ id, ...data }));

      console.log("Found tournaments:", tournaments);

      // Filter for actually active tournaments
      const activeTournaments = tournaments.filter(
        t => t.isFinished === false || t.status === "active"
      );

      // Sort by createdAt or startDate (descending)
      activeTournaments.sort((a, b) => {
        const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.startDate || 0);
        const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.startDate || 0);
        return bDate - aDate;
      });

      if (activeTournaments.length === 0) {
        setShowNoTournamentDialog(true);
      } else {
        const tournament = activeTournaments[0];
        console.log("Navigating to tournament:", tournament.id, tournament);
        navigate(`/tournament/${tournament.id}/menu`);
      }
    } catch (error) {
      console.error("Error checking current tournament:", error);
      setShowNoTournamentDialog(true);
    }
  };

  const handleTournamentHistory = () => {
    navigate("/tournament-history");
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto p-6 bg-background">
        <Card className="w-full shadow-lg border-2 border-primary/10">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl md:text-3xl font-bold">
              Ultimate Frisbee Scorekeeper
            </CardTitle>
            <p className="text-muted-foreground">Tournament Management System</p>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-10 text-muted-foreground text-lg">
                Loading...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
                {/* New Tournament Button */}
                <Button
                  onClick={handleNewTournament}
                  className="h-40 flex flex-col items-center justify-center gap-4 text-xl bg-primary hover:bg-primary/90 transition-all"
                  disabled={userRole !== "head-marshall"}
                >
                  <Trophy
                    size={48}
                    className={userRole !== "head-marshall" ? "text-gray-400" : ""}
                  />
                  <span>New Tournament</span>
                </Button>

                {/* Current Tournament Button - always enabled for both roles */}
                <Button
                  onClick={() => {
                    try {
                      handleCurrentTournament();
                    } catch (err) {
                      console.error("Error in Current Tournament button click:", err);
                    }
                  }}
                  variant="secondary"
                  className="h-40 flex flex-col items-center justify-center gap-4 text-xl bg-secondary hover:bg-secondary/90 transition-all"
                >
                  <Disc3 size={48} />
                  <span>Current Tournament</span>
                </Button>

                {/* Tournament History Button */}
                <Button
                  onClick={handleTournamentHistory}
                  variant="outline"
                  className="h-40 flex flex-col items-center justify-center gap-4 text-xl border-2 hover:bg-accent transition-all"
                >
                  <Calendar size={48} />
                  <span>Tournament History</span>
                </Button>
              </div>
            )}

            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>
                Track scores, timeouts, and player stats for your Ultimate Frisbee
                tournaments
              </p>
              <p className="mt-2">Designed for easy use on the sidelines</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* No Tournament Dialog */}
      <Dialog open={showNoTournamentDialog} onOpenChange={setShowNoTournamentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Active Tournament</DialogTitle>
            <DialogDescription>
              There is no active tournament at the moment. Would you like to create a new tournament?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowNoTournamentDialog(false)}
            >
              Back to Menu
            </Button>
            <Button
              onClick={() => {
                setShowNoTournamentDialog(false);
                handleNewTournament();
              }}
              disabled={userRole !== "head-marshall"}
            >
              Create New Tournament
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InitialMenu;