import React, { useState } from "react";
import { Save, RefreshCw, Volume2, VolumeX, Moon, Sun } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const Settings = ({
  onSave = () => {},
  initialSettings = {
    soundEnabled: true,
    darkMode: false,
    defaultGameDuration: 90,
    defaultPointsCap: 15,
    defaultTimeoutDuration: 70,
    autoSaveGames: true,
    playerStatsTracking: true,
    vibrationFeedback: true,
    language: "en",
  },
}) => {
  const [settings, setSettings] = useState(initialSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(settings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setSettings(initialSettings);
    setHasChanges(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-background">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Settings</CardTitle>
            <Button variant="outline" onClick={() => window.history.back()}>
              Back
            </Button>
          </div>
          <CardDescription>
            Configure your Ultimate Frisbee Scorekeeper preferences
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Game Settings */}
          <div>
            <h3 className="text-lg font-medium mb-4">Game Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="defaultGameDuration">
                  Default Game Duration (minutes)
                </Label>
                <Input
                  id="defaultGameDuration"
                  type="number"
                  value={settings.defaultGameDuration}
                  onChange={(e) =>
                    handleChange(
                      "defaultGameDuration",
                      parseInt(e.target.value) || 90,
                    )
                  }
                  min={1}
                  max={180}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultPointsCap">Default Points Cap</Label>
                <Input
                  id="defaultPointsCap"
                  type="number"
                  value={settings.defaultPointsCap}
                  onChange={(e) =>
                    handleChange(
                      "defaultPointsCap",
                      parseInt(e.target.value) || 15,
                    )
                  }
                  min={1}
                  max={30}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultTimeoutDuration">
                  Default Timeout Duration (seconds)
                </Label>
                <Input
                  id="defaultTimeoutDuration"
                  type="number"
                  value={settings.defaultTimeoutDuration}
                  onChange={(e) =>
                    handleChange(
                      "defaultTimeoutDuration",
                      parseInt(e.target.value) || 70,
                    )
                  }
                  min={30}
                  max={120}
                  step={10}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => handleChange("language", value)}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* App Preferences */}
          <div>
            <h3 className="text-lg font-medium mb-4">App Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="soundEnabled">Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable sound effects for scoring and timers
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {settings.soundEnabled ? (
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Switch
                    id="soundEnabled"
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) =>
                      handleChange("soundEnabled", checked)
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="darkMode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Use dark theme for the application
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {settings.darkMode ? (
                    <Moon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Sun className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Switch
                    id="darkMode"
                    checked={settings.darkMode}
                    onCheckedChange={(checked) =>
                      handleChange("darkMode", checked)
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoSaveGames">Auto-Save Games</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save games to history
                  </p>
                </div>
                <Switch
                  id="autoSaveGames"
                  checked={settings.autoSaveGames}
                  onCheckedChange={(checked) =>
                    handleChange("autoSaveGames", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="playerStatsTracking">
                    Player Stats Tracking
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Track individual player statistics during games
                  </p>
                </div>
                <Switch
                  id="playerStatsTracking"
                  checked={settings.playerStatsTracking}
                  onCheckedChange={(checked) =>
                    handleChange("playerStatsTracking", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="vibrationFeedback">Vibration Feedback</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable vibration feedback for button presses
                  </p>
                </div>
                <Switch
                  id="vibrationFeedback"
                  checked={settings.vibrationFeedback}
                  onCheckedChange={(checked) =>
                    handleChange("vibrationFeedback", checked)
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Settings;
