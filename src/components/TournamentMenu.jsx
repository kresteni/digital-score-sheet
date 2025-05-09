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
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const TournamentMenu = ({
  userRole = null,
  tournamentName = "Current Tournament",
  currentTournament = null,
}) => {
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const navigate = useNavigate();

  const handleFinishTournament = async () => {
    setShowFinishDialog(false);
    
    // Update tournament status in Firestore
    if (currentTournament && currentTournament.id) {
      try {
        const tournamentRef = doc(db, "tournaments", currentTournament.id);
        await updateDoc(tournamentRef, {
          status: "finished",
          finishedAt: new Date().toISOString()
        });
        console.log("Tournament marked as finished in database");
      } catch (err) {
        console.error("Error marking tournament as finished:", err);
      }
    }
    
    navigate("/");
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-background">
      <Card className="w-full shadow-lg border-2 border-primary/10">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl md:text-3xl font-bold">
            {tournamentName}
          </CardTitle>
          <p className="text-muted-foreground">Tournament Management</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
            {/* Play Game Button */}
            <Button
              onClick={() => navigate("/game/play")}
              className="h-40 flex flex-col items-center justify-center gap-4 text-xl bg-primary hover:bg-primary/90 transition-all"
            >
              <Disc3 size={48} />
              <span>Play Game</span>
            </Button>

            {/* Game History Button */}
            <Button
              onClick={() => navigate("/game/history")}
              variant="secondary"
              className="h-40 flex flex-col items-center justify-center gap-4 text-xl bg-secondary hover:bg-secondary/90 transition-all"
            >
              <History size={48} />
              <span>Game History</span>
            </Button>

            {/* Bracket Management Button */}
            <Button
              onClick={() => navigate("/tournament/brackets")}
              variant="outline"
              className="h-40 flex flex-col items-center justify-center gap-4 text-xl border-2 hover:bg-accent transition-all"
            >
              <Brackets size={48} />
              <span>Bracket Management</span>
            </Button>

            {/* Marshall Assignments Button - Head Marshall Only */}
            <Button
              onClick={() => navigate("/tournament/marshalls")}
              variant="outline"
              className="h-40 flex flex-col items-center justify-center gap-4 text-xl border-2 hover:bg-accent transition-all"
              disabled={userRole !== "head-marshall"}
            >
              <Users
                size={48}
                className={
                  userRole !== "head-marshall"
                    ? "text-gray-400"
                    : "text-blue-500"
                }
              />
              <span>Marshall Assignments</span>
            </Button>

            {/* Awards Button */}
            <Button
              onClick={() => navigate("/tournament/awards")}
              variant="outline"
              className="h-40 flex flex-col items-center justify-center gap-4 text-xl border-2 hover:bg-accent transition-all"
            >
              <Award size={48} />
              <span>Awards</span>
            </Button>

            {/* Tournament Setup Button - Head Marshall Only */}
            <Button
              onClick={() => navigate("/tournament/setup")}
              variant="outline"
              className="h-40 flex flex-col items-center justify-center gap-4 text-xl border-2 hover:bg-accent transition-all"
              disabled={userRole !== "head-marshall"}
            >
              <Trophy
                size={48}
                className={userRole !== "head-marshall" ? "text-gray-400" : ""}
              />
              <span>{currentTournament ? "Edit Tournament" : "Tournament Setup"}</span>
            </Button>

            {/* Team Management Button - Head Marshall Only */}
            <Button
              onClick={() => navigate("/tournament/teams")}
              variant="outline"
              className="h-40 flex flex-col items-center justify-center gap-4 text-xl border-2 hover:bg-accent transition-all"
              disabled={userRole !== "head-marshall"}
            >
              <Users
                size={48}
                className={userRole !== "head-marshall" ? "text-gray-400" : ""}
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
              disabled={userRole !== "head-marshall"}
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