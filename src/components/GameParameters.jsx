import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";

const GameParameters = ({
  gameDuration = 90,
  pointsCap = 15,
  timeoutCount = 2,
  timeoutDuration = 70,
  halftimeDuration = 10,
  onChange = () => {},
}) => {
  const [parameters, setParameters] = React.useState({
    gameDuration,
    pointsCap,
    timeoutCount,
    timeoutDuration,
    halftimeDuration,
  });

  const handleChange = (field, value) => {
    const updatedParameters = { ...parameters, [field]: value };
    setParameters(updatedParameters);
    onChange(updatedParameters);
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Game Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor="gameDuration" className="text-sm font-medium">
              Game Duration (minutes)
            </label>
            <Input
              id="gameDuration"
              type="number"
              value={parameters.gameDuration}
              onChange={(e) =>
                handleChange("gameDuration", parseInt(e.target.value) || 90)
              }
              min={1}
              max={180}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="pointsCap" className="text-sm font-medium">
              Points Cap
            </label>
            <Input
              id="pointsCap"
              type="number"
              value={parameters.pointsCap}
              onChange={(e) =>
                handleChange("pointsCap", parseInt(e.target.value) || 15)
              }
              min={1}
              max={30}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="timeoutCount" className="text-sm font-medium">
              Timeouts Per Team
            </label>
            <Select
              value={parameters.timeoutCount.toString()}
              onValueChange={(value) =>
                handleChange("timeoutCount", parseInt(value))
              }
            >
              <SelectTrigger id="timeoutCount">
                <SelectValue placeholder="Select timeouts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="timeoutDuration" className="text-sm font-medium">
              Timeout Duration (seconds)
            </label>
            <Input
              id="timeoutDuration"
              type="number"
              value={parameters.timeoutDuration}
              onChange={(e) =>
                handleChange("timeoutDuration", parseInt(e.target.value) || 70)
              }
              min={30}
              max={120}
              step={10}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="halftimeDuration" className="text-sm font-medium">
              Halftime Duration (minutes)
            </label>
            <Input
              id="halftimeDuration"
              type="number"
              value={parameters.halftimeDuration}
              onChange={(e) =>
                handleChange("halftimeDuration", parseInt(e.target.value) || 10)
              }
              min={5}
              max={20}
            />
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setParameters({
                  gameDuration: 90,
                  pointsCap: 15,
                  timeoutCount: 2,
                  timeoutDuration: 70,
                  halftimeDuration: 10,
                });
                onChange({
                  gameDuration: 90,
                  pointsCap: 15,
                  timeoutCount: 2,
                  timeoutDuration: 70,
                  halftimeDuration: 10,
                });
              }}
            >
              Reset to Defaults
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameParameters;
