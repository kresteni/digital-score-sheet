import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar, Trophy, Users, Clock } from "lucide-react";
import { db, auth } from "../firebase"; // ✅ adjust path to your firebase.js
import { addDoc, collection, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const TournamentSetup = () => {
  const navigate = useNavigate();
  const { tournamentId } = useParams();
  const [tournamentData, setTournamentData] = useState({
    name: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    location: "",
    maxTeams: 12,
    format: "round-robin",
    pointsCap: 15,
    gameDuration: 90,
    timeoutDuration: 70,
    halftimeDuration: 10,
  });

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTournament = async () => {
      if (tournamentId && tournamentId !== "new") {
        try {
          const tournamentDoc = await getDoc(doc(db, "tournaments", tournamentId));
          if (tournamentDoc.exists()) {
            setTournamentData(tournamentDoc.data());
          }
        } catch (error) {
          console.error("Error fetching tournament:", error);
        }
      }
      setLoading(false);
    };

    fetchTournament();
  }, [tournamentId]);

  const handleChange = (field, value) => {
    setTournamentData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in to create a tournament.");
      return;
    }

    const newTournament = {
      ...tournamentData,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      isFinished: false,
    };

    try {
      const docRef = await addDoc(collection(db, "tournaments"), newTournament);
      alert("Tournament created successfully!");
      navigate(`/tournament/${docRef.id}/teams`);
    } catch (error) {
      console.error("Error creating tournament:", error);
      alert("Failed to create tournament.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-xl">Access Restricted</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            You must be logged in to access this page.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-background">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Tournament Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Tournament Information
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="name">Tournament Name</Label>
                  <Input
                    id="name"
                    value={tournamentData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Ultimate Frisbee Championship 2023"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="startDate"
                        type="date"
                        value={tournamentData.startDate}
                        onChange={(e) => handleChange("startDate", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="endDate"
                        type="date"
                        value={tournamentData.endDate}
                        onChange={(e) => handleChange("endDate", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={tournamentData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="City Sports Complex"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Tournament Format
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxTeams">Maximum Teams</Label>
                    <Input
                      id="maxTeams"
                      type="number"
                      value={tournamentData.maxTeams}
                      onChange={(e) =>
                        handleChange("maxTeams", parseInt(e.target.value) || 12)
                      }
                      min={2}
                      max={32}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="format">Tournament Format</Label>
                    <Select
                      value={tournamentData.format}
                      onValueChange={(value) => handleChange("format", value)}
                    >
                      <SelectTrigger id="format">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="round-robin">Round Robin</SelectItem>
                        <SelectItem value="single-elimination">
                          Single Elimination
                        </SelectItem>
                        <SelectItem value="double-elimination">
                          Double Elimination
                        </SelectItem>
                        <SelectItem value="swiss">Swiss System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Game Rules
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pointsCap">Points Cap</Label>
                    <Input
                      id="pointsCap"
                      type="number"
                      value={tournamentData.pointsCap}
                      onChange={(e) =>
                        handleChange("pointsCap", parseInt(e.target.value) || 15)
                      }
                      min={1}
                      max={30}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gameDuration">Game Duration (minutes)</Label>
                    <Input
                      id="gameDuration"
                      type="number"
                      value={tournamentData.gameDuration}
                      onChange={(e) =>
                        handleChange("gameDuration", parseInt(e.target.value) || 90)
                      }
                      min={30}
                      max={180}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeoutDuration">Timeout Duration (seconds)</Label>
                    <Input
                      id="timeoutDuration"
                      type="number"
                      value={tournamentData.timeoutDuration}
                      onChange={(e) =>
                        handleChange("timeoutDuration", parseInt(e.target.value) || 70)
                      }
                      min={30}
                      max={120}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="halftimeDuration">Halftime Duration (minutes)</Label>
                    <Input
                      id="halftimeDuration"
                      type="number"
                      value={tournamentData.halftimeDuration}
                      onChange={(e) =>
                        handleChange("halftimeDuration", parseInt(e.target.value) || 10)
                      }
                      min={5}
                      max={20}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
              >
                Cancel
              </Button>
              <Button type="submit">
                {tournamentId === "new" ? "Create Tournament" : "Update Tournament"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TournamentSetup;