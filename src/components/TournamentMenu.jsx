import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Disc3, History, Trophy, Users, Brackets, Award } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { db } from "../firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const TournamentMenu = () => {
  const navigate = useNavigate();
  const { tournamentId } = useParams();
  const { currentUser } = useAuth();
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const tournamentDoc = await getDoc(doc(db, "tournaments", tournamentId));
        console.log("Fetched tournamentDoc:", tournamentDoc.exists(), tournamentDoc.data());
        if (tournamentDoc.exists()) {
          setTournament({ id: tournamentDoc.id, ...tournamentDoc.data() });
        }
      } catch (error) {
        console.error("Error fetching tournament:", error);
      } finally {
        setLoading(false);
      }
    };

    if (tournamentId) {
      fetchTournament();
    }
  }, [tournamentId]);

  const handleFinishTournament = async () => {
    setShowFinishDialog(false);
    
    try {
      const tournamentRef = doc(db, "tournaments", tournamentId);
      await updateDoc(tournamentRef, {
        isFinished: true,
        finishedAt: new Date().toISOString()
      });
      console.log("Tournament marked as finished in database");
      navigate("/");
    } catch (error) {
      console.error("Error marking tournament as finished:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!tournament) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-xl">Tournament Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            The requested tournament could not be found.
          </p>
          <div className="flex justify-center mt-4">
            <Button onClick={() => navigate("/")}>Back to Home</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isHeadMarshall = currentUser?.role === "head-marshall";

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-background">
      <Card className="w-full shadow-lg border-2 border-primary/10">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl md:text-3xl font-bold">
            {tournament.name}
          </CardTitle>
          <p className="text-muted-foreground">Tournament Management</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
            {/* Play Game Button */}
            <Button
              onClick={() => navigate(`/tournament/${tournamentId}/playgame`)}
              className="h-40 flex flex-col items-center justify-center gap-4 text-xl bg-primary hover:bg-primary/90 transition-all"
            >
              <Disc3 size={48} />
              <span>Play Game</span>
            </Button>

            {/* Game History Button */}
            <Button
              onClick={() => navigate(`/tournament/${tournamentId}/game/history`)}
              variant="secondary"
              className="h-40 flex flex-col items-center justify-center gap-4 text-xl bg-secondary hover:bg-secondary/90 transition-all"
            >
              <History size={48} />
              <span>Game History</span>
            </Button>

            {/* Bracket Management Button */}
            <Button
              onClick={() => navigate(`/tournament/${tournamentId}/brackets`)}
              variant="outline"
              className="h-40 flex flex-col items-center justify-center gap-4 text-xl border-2 hover:bg-accent transition-all"
            >
              <Brackets size={48} />
              <span>Bracket Management</span>
            </Button>

            {/* Marshall Assignments Button - Head Marshall Only */}
            {isHeadMarshall && (
              <Button
                onClick={() => navigate(`/tournament/${tournamentId}/marshalls`)}
                variant="outline"
                className="h-40 flex flex-col items-center justify-center gap-4 text-xl border-2 hover:bg-accent transition-all"
              >
                <Users size={48} className="text-blue-500" />
                <span>Marshall Assignments</span>
              </Button>
            )}

            {/* My Assignments Button - Marshall Only */}
            {currentUser?.role === "marshall" && (
              <Button
                onClick={() => navigate(`/tournament/${tournamentId}/my-assignments`)}
                variant="outline"
                className="h-40 flex flex-col items-center justify-center gap-4 text-xl border-2 hover:bg-accent transition-all"
              >
                <Users size={48} />
                <span>My Assignments</span>
              </Button>
            )}

            {/* Awards Button */}
            <Button
              onClick={() => navigate(`/tournament/${tournamentId}/awards`)}
              variant="outline"
              className="h-40 flex flex-col items-center justify-center gap-4 text-xl border-2 hover:bg-accent transition-all"
            >
              <Award size={48} />
              <span>Awards</span>
            </Button>

            {/* Tournament Setup Button - Head Marshall Only */}
            <Button
              onClick={() => navigate(`/tournament/${tournamentId}/setup`)}
              variant="outline"
              className="h-40 flex flex-col items-center justify-center gap-4 text-xl border-2 hover:bg-accent transition-all"
              disabled={!isHeadMarshall}
            >
              <Trophy
                size={48}
                className={!isHeadMarshall ? "text-gray-400" : ""}
              />
              <span>Edit Tournament</span>
            </Button>

            {/* Team Management Button - Accessible by both roles */}
            <Button
              onClick={() => navigate(`/tournament/${tournamentId}/teams`)}
              variant="outline"
              className="h-40 flex flex-col items-center justify-center gap-4 text-xl border-2 hover:bg-accent transition-all"
            >
              <Users
                size={48}
              />
              <span>Team Management</span>
            </Button>
          </div>

          {/* Finish Tournament Button */}
          <div className="flex justify-end mt-8">
            <Button
              onClick={() => setShowFinishDialog(true)}
              variant="destructive"
              className="px-8"
              disabled={!isHeadMarshall}
            >
              Finish Tournament
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Finish Tournament Confirmation Dialog */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finish Tournament</DialogTitle>
            <DialogDescription>
              Are you sure the tournament is finished? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowFinishDialog(false)}
            >
              No
            </Button>
            <Button variant="destructive" onClick={handleFinishTournament}>
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TournamentMenu;