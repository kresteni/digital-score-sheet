import React, { useState, useEffect } from "react";
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
import { db, auth } from "../firebase";
import { 
  addDoc, 
  collection, 
  serverTimestamp, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const TournamentSetup = ({ onSaveTournament, userRole }) => {
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
  const [existingTournament, setExistingTournament] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        checkExistingTournament(firebaseUser.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const checkExistingTournament = async (userId) => {
    try {
      // Check for active tournaments (not marked as finished)
      const tournamentsCollection = collection(db, "tournaments");
      const activeQuery = query(
        tournamentsCollection, 
        where("status", "!=", "finished"),
        where("createdBy", "==", userId)
      );

      // If no active tournaments found, try to find one without status field
      // (for backward compatibility with existing data)
      const querySnapshot = await getDocs(activeQuery);
      
      if (!querySnapshot.empty) {
        // Tournament exists and is active
        const tournament = querySnapshot.docs[0];
        const tournamentData = tournament.data();
        setExistingTournament({
          id: tournament.id,
          ...tournamentData
        });
        setTournamentData({
          name: tournamentData.name || "",
          startDate: tournamentData.startDate || new Date().toISOString().split("T")[0],
          endDate: tournamentData.endDate || new Date(Date.now() + 86400000).toISOString().split("T")[0],
          location: tournamentData.location || "",
          maxTeams: tournamentData.maxTeams || 12,
          format: tournamentData.format || "round-robin",
          pointsCap: tournamentData.pointsCap || 15,
          gameDuration: tournamentData.gameDuration || 90,
          timeoutDuration: tournamentData.timeoutDuration || 70,
          halftimeDuration: tournamentData.halftimeDuration || 10,
        });
        setIsEditing(true);
      } else {
        // Check for tournaments with no status field (older data)
        const noStatusQuery = query(
          tournamentsCollection,
          where("createdBy", "==", userId)
        );
        
        const noStatusSnapshot = await getDocs(noStatusQuery);
        
        if (!noStatusSnapshot.empty) {
          // For each tournament without status, check if it has a finishedAt field
          let activeTournament = null;
          
          for (const tournamentDoc of noStatusSnapshot.docs) {
            const tournamentData = tournamentDoc.data();
            if (!tournamentData.finishedAt) {
              activeTournament = {
                id: tournamentDoc.id,
                ...tournamentData
              };
              break;
            }
          }
          
          if (activeTournament) {
            setExistingTournament(activeTournament);
            setTournamentData({
              name: activeTournament.name || "",
              startDate: activeTournament.startDate || new Date().toISOString().split("T")[0],
              endDate: activeTournament.endDate || new Date(Date.now() + 86400000).toISOString().split("T")[0],
              location: activeTournament.location || "",
              maxTeams: activeTournament.maxTeams || 12,
              format: activeTournament.format || "round-robin",
              pointsCap: activeTournament.pointsCap || 15,
              gameDuration: activeTournament.gameDuration || 90,
              timeoutDuration: activeTournament.timeoutDuration || 70,
              halftimeDuration: activeTournament.halftimeDuration || 10,
            });
            setIsEditing(true);
          }
        }
      }
    } catch (error) {
      console.error("Error checking for existing tournaments:", error);
    } finally {
      setLoading(false);
    }
  };

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

    try {
      if (isEditing && existingTournament) {
        // Update existing tournament
        const tournamentRef = doc(db, "tournaments", existingTournament.id);
        await updateDoc(tournamentRef, {
          ...tournamentData,
          updatedAt: serverTimestamp(),
        });
        
        alert("Tournament updated successfully!");
        onSaveTournament({ 
          id: existingTournament.id, 
          ...tournamentData,
          createdBy: user.uid,
          status: "active"
        });
      } else {
        // Create new tournament
        const newTournament = {
          ...tournamentData,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
          status: "active" // Add status field to make querying easier
        };

        const docRef = await addDoc(collection(db, "tournaments"), newTournament);
        alert("Tournament created successfully!");
        onSaveTournament({ id: docRef.id, ...newTournament });
      }
    } catch (error) {
      console.error("Error with tournament:", error);
      alert("Failed to save tournament.");
    }
  };

  if (userRole !== "head-marshall") {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-xl">Access Restricted</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Only Head Marshalls can set up tournaments. Please contact a Head
            Marshall for assistance.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-xl">Loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Checking for existing tournaments...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-background">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {isEditing ? "Edit Tournament" : "Tournament Setup"}
          </CardTitle>
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

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onSaveTournament(null)}
              >
                Back
              </Button>
              <Button type="submit" size="lg">
                {isEditing ? "Update Tournament" : "Create Tournament"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TournamentSetup;