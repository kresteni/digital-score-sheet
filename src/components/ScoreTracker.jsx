import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const ScoreTracker = ({
  teamAName = "Team A",
  teamBName = "Team B",
  teamAScore = 0,
  teamBScore = 0,
  onScoreChange = () => {},
}) => {
  const [scoreA, setScoreA] = useState(teamAScore);
  const [scoreB, setScoreB] = useState(teamBScore);

  const handleScoreChange = (team, increment) => {
    if (team === "A") {
      const newScore = increment ? scoreA + 1 : Math.max(0, scoreA - 1);
      setScoreA(newScore);
      onScoreChange("A", newScore);
    } else {
      const newScore = increment ? scoreB + 1 : Math.max(0, scoreB - 1);
      setScoreB(newScore);
      onScoreChange("B", newScore);
    }
  };

  return (
    <div className="w-full bg-background p-4 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        {/* Team A Score Card */}
        <Card className="flex-1 border-4 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl md:text-2xl text-center">
              {teamAName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="text-6xl md:text-8xl font-bold mb-4">
                {scoreA}
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full h-14 w-14 p-0"
                  onClick={() => handleScoreChange("A", false)}
                >
                  <Minus className="h-6 w-6" />
                </Button>
                <Button
                  variant="default"
                  size="lg"
                  className="rounded-full h-14 w-14 p-0 bg-primary"
                  onClick={() => handleScoreChange("A", true)}
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Divider */}
        <div className="flex flex-row md:flex-col items-center justify-center">
          <div className="text-3xl md:text-4xl font-bold px-4">vs</div>
        </div>

        {/* Team B Score Card */}
        <Card className="flex-1 border-4 border-secondary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl md:text-2xl text-center">
              {teamBName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="text-6xl md:text-8xl font-bold mb-4">
                {scoreB}
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full h-14 w-14 p-0"
                  onClick={() => handleScoreChange("B", false)}
                >
                  <Minus className="h-6 w-6" />
                </Button>
                <Button
                  variant="default"
                  size="lg"
                  className="rounded-full h-14 w-14 p-0 bg-secondary"
                  onClick={() => handleScoreChange("B", true)}
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScoreTracker;
