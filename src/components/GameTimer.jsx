import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Clock, Timer, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";

const GameTimer = ({
  initialGameTime = 2700, // 45 minutes in seconds
  initialTimeoutTime = 70,
  initialHalftimeTime = 600, // 10 minutes in seconds
  onTimeComplete = () => {},
  onTimerStart = () => {},
  onTimerPause = () => {},
  onTimerUpdate = () => {},
}) => {
  const [gameTime, setGameTime] = useState(initialGameTime);
  const [timeoutTime, setTimeoutTime] = useState(initialTimeoutTime);
  const [halftimeTime, setHalftimeTime] = useState(initialHalftimeTime);

  const [activeTimer, setActiveTimer] = useState("game");
  const [isRunning, setIsRunning] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        if (activeTimer === "game") {
          setGameTime((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              setIsRunning(false);
              onTimeComplete("game");
              return 0;
            }
            onTimerUpdate("game", prev - 1);
            return prev - 1;
          });
        } else if (activeTimer === "timeout") {
          setTimeoutTime((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              setIsRunning(false);
              onTimeComplete("timeout");
              return 0;
            }
            onTimerUpdate("timeout", prev - 1);
            return prev - 1;
          });
        } else if (activeTimer === "halftime") {
          setHalftimeTime((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              setIsRunning(false);
              onTimeComplete("halftime");
              return 0;
            }
            onTimerUpdate("halftime", prev - 1);
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, activeTimer, onTimeComplete, onTimerUpdate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartPause = () => {
    if (!activeTimer) {
      setActiveTimer("game");
      setIsRunning(true);
      onTimerStart();
    } else {
      setIsRunning(!isRunning);
      if (!isRunning) {
        onTimerStart();
      } else {
        onTimerPause(
          activeTimer === "game"
            ? gameTime
            : activeTimer === "timeout"
              ? timeoutTime
              : halftimeTime,
        );
      }
    }
  };

  const handleTimeout = () => {
    if (activeTimer === "timeout") {
      // If timeout is already active, switch back to game
      setActiveTimer("game");
      setTimeoutTime(initialTimeoutTime); // Reset timeout timer
    } else {
      // Pause game timer and start timeout
      setActiveTimer("timeout");
      setIsRunning(true);
    }
  };

  const handleHalftime = () => {
    if (activeTimer === "halftime") {
      // If halftime is already active, switch back to game
      setActiveTimer("game");
      setHalftimeTime(initialHalftimeTime); // Reset halftime timer
    } else {
      // Pause game timer and start halftime
      setActiveTimer("halftime");
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    if (activeTimer === "game") {
      setGameTime(initialGameTime);
    } else if (activeTimer === "timeout") {
      setTimeoutTime(initialTimeoutTime);
    } else if (activeTimer === "halftime") {
      setHalftimeTime(initialHalftimeTime);
    }
  };

  const getProgressValue = () => {
    if (activeTimer === "game") {
      return (gameTime / initialGameTime) * 100;
    } else if (activeTimer === "timeout") {
      return (timeoutTime / initialTimeoutTime) * 100;
    } else if (activeTimer === "halftime") {
      return (halftimeTime / initialHalftimeTime) * 100;
    }
    return 100;
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {activeTimer === "game"
            ? "Game Timer"
            : activeTimer === "timeout"
              ? "Timeout"
              : activeTimer === "halftime"
                ? "Halftime"
                : "Game Timer"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="text-5xl font-bold mb-4">
            {activeTimer === "game"
              ? formatTime(gameTime)
              : activeTimer === "timeout"
                ? formatTime(timeoutTime)
                : activeTimer === "halftime"
                  ? formatTime(halftimeTime)
                  : formatTime(gameTime)}
          </div>

          <Progress value={getProgressValue()} className="w-full mb-4" />

          <div className="flex gap-2">
            <Button
              variant={isRunning ? "destructive" : "default"}
              onClick={handleStartPause}
              className="flex items-center gap-1"
            >
              {isRunning ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isRunning ? "Pause" : "Start"}
            </Button>

            <Button
              variant="outline"
              onClick={handleTimeout}
              className={`flex items-center gap-1 ${activeTimer === "timeout" ? "bg-yellow-100" : ""}`}
            >
              <Timer className="h-4 w-4" />
              Timeout
            </Button>

            <Button
              variant="outline"
              onClick={handleHalftime}
              className={`flex items-center gap-1 ${activeTimer === "halftime" ? "bg-blue-100" : ""}`}
            >
              <Clock className="h-4 w-4" />
              Halftime
            </Button>

            <Button
              variant="ghost"
              onClick={handleReset}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameTimer;
