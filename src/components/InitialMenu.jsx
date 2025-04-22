import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Trophy, Calendar, Disc3 } from "lucide-react";

const InitialMenu = ({
  onNewTournament = () => {},
  onCurrentTournament = () => {},
  onTournamentHistory = () => {},
  userRole = null,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-background">
      <Card className="w-full shadow-lg border-2 border-primary/10">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl md:text-3xl font-bold">
            Ultimate Frisbee Scorekeeper
          </CardTitle>
          <p className="text-muted-foreground">Tournament Management System</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
            {/* New Tournament Button */}
            <Button
              onClick={onNewTournament}
              className="h-40 flex flex-col items-center justify-center gap-4 text-xl bg-primary hover:bg-primary/90 transition-all"
              disabled={userRole !== "head-marshall"}
            >
              <Trophy
                size={48}
                className={userRole !== "head-marshall" ? "text-gray-400" : ""}
              />
              <span>New Tournament</span>
            </Button>

            {/* Current Tournament Button */}
            <Button
              onClick={onCurrentTournament}
              variant="secondary"
              className="h-40 flex flex-col items-center justify-center gap-4 text-xl bg-secondary hover:bg-secondary/90 transition-all"
            >
              <Disc3 size={48} />
              <span>Current Tournament</span>
            </Button>

            {/* Tournament History Button */}
            <Button
              onClick={onTournamentHistory}
              variant="outline"
              className="h-40 flex flex-col items-center justify-center gap-4 text-xl border-2 hover:bg-accent transition-all"
            >
              <Calendar size={48} />
              <span>Tournament History</span>
            </Button>
          </div>

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
  );
};

export default InitialMenu;
