import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Disc3,
  History,
  Settings,
  Trophy,
  Users,
  Brackets,
  Award,
} from "lucide-react";

const HomeMenu = ({
  onNewGame = () => {},
  onViewHistory = () => {},
  onSettings = () => {},
  onTournamentSetup = () => {},
  onTeamManagement = () => {},
  onBracketManagement = () => {},
  onAwardsCalculation = () => {},
  onMarshallAssignments = () => {},
  userRole = null,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-background">
      <Card className="w-full shadow-lg border-2 border-primary/10">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl md:text-3xl font-bold">
            Ultimate Frisbee Scorekeeper
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
            {/* New Game Button */}
            <Button
              onClick={onNewGame}
              className="h-40 flex flex-col items-center justify-center gap-4 text-xl bg-primary hover:bg-primary/90 transition-all"
            >
              <Disc3 size={48} />
              <span>New Game</span>
            </Button>

            {/* Game History Button */}
            <Button
              onClick={onViewHistory}
              variant="secondary"
              className="h-40 flex flex-col items-center justify-center gap-4 text-xl bg-secondary hover:bg-secondary/90 transition-all"
            >
              <History size={48} />
              <span>Game History</span>
            </Button>

            {/* Tournament Setup Button - Head Marshall Only */}
            <Button
              onClick={onTournamentSetup}
              variant="outline"
              className="h-40 flex flex-col items-center justify-center gap-4 text-xl border-2 hover:bg-accent transition-all"
              disabled={userRole !== "head-marshall"}
            >
              <Trophy
                size={48}
                className={userRole !== "head-marshall" ? "text-gray-400" : ""}
              />
              <span>Tournament Setup</span>
            </Button>

            {/* Team Management Button - Head Marshall Only */}
            <Button
              onClick={onTeamManagement}
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

            {/* Bracket Management Button */}
            <Button
              onClick={onBracketManagement}
              variant="outline"
              className="h-40 flex flex-col items-center justify-center gap-4 text-xl border-2 hover:bg-accent transition-all"
            >
              <Brackets size={48} />
              <span>Bracket Management</span>
            </Button>

            {/* Awards Calculation Button */}
            <Button
              onClick={onAwardsCalculation}
              variant="outline"
              className="h-40 flex flex-col items-center justify-center gap-4 text-xl border-2 hover:bg-accent transition-all"
            >
              <Award size={48} />
              <span>Awards</span>
            </Button>

            {/* Marshall Assignments Button - Head Marshall Only */}
            <Button
              onClick={onMarshallAssignments}
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

            {/* Settings Button */}
            <Button
              onClick={onSettings}
              variant="outline"
              className="h-40 flex flex-col items-center justify-center gap-4 text-xl border-2 hover:bg-accent transition-all"
            >
              <Settings size={48} />
              <span>Settings</span>
            </Button>
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Track scores, timeouts, and player stats for your Ultimate Frisbee
              games
            </p>
            <p className="mt-2">Designed for easy use on the sidelines</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomeMenu;
