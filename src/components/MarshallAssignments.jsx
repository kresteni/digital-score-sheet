import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  Plus,
  Trash2,
  UserPlus,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import AssignmentSchedule from "./AssignmentSchedule";

const MarshallAssignments = ({
  userRole,
  onBack = () => window.history.back(),
}) => {
  const [marshalls, setMarshalls] = useState([
    { id: "1", name: "Charlene Layo", assignments: 2 },
    { id: "2", name: "Chris", assignments: 1 },
    { id: "3", name: "Earl", assignments: 2 },
  ]);

  const [assignments, setAssignments] = useState([
    {
      id: "1",
      marshallId: "1",
      marshallName: "Charlene Layo",
      time: "7:00-7:40",
      pitch: "Pitch 1",
      teams: "LA vs VA",
      date: "2023-06-15",
    },
    {
      id: "2",
      marshallId: "1",
      marshallName: "Charlene Layo",
      time: "9:10-10:00",
      pitch: "Pitch 2",
      teams: "US vs PH",
      date: "2023-06-15",
    },
    {
      id: "3",
      marshallId: "2",
      marshallName: "Chris",
      time: "10:30-11:20",
      pitch: "Pitch 1",
      teams: "Team A vs Team B",
      date: "2023-06-16",
    },
    {
      id: "4",
      marshallId: "3",
      marshallName: "Earl",
      time: "13:00-13:50",
      pitch: "Pitch 3",
      teams: "Team C vs Team D",
      date: "2023-06-16",
    },
    {
      id: "5",
      marshallId: "3",
      marshallName: "Earl",
      time: "15:30-16:20",
      pitch: "Pitch 2",
      teams: "Team E vs Team F",
      date: "2023-06-17",
    },
  ]);

  const [newMarshall, setNewMarshall] = useState({
    name: "",
  });

  const [selectedMarshall, setSelectedMarshall] = useState("1");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("manage");

  const handleAddMarshall = () => {
    if (!newMarshall.name) return;

    const marshall = {
      id: Date.now().toString(),
      name: newMarshall.name,
      assignments: 0,
    };

    setMarshalls([...marshalls, marshall]);
    setNewMarshall({ name: "" });
    setIsAddDialogOpen(false);
  };

  const _handleDeleteMarshall = (marshallId) => {
    setMarshalls(marshalls.filter((marshall) => marshall.id !== marshallId));
  };

  const handleAssign = (marshallId) => {
    setMarshalls(
      marshalls.map((marshall) => {
        if (marshall.id === marshallId) {
          return {
            ...marshall,
            assignments: marshall.assignments + 1,
          };
        }
        return marshall;
      }),
    );
  };

  const handleRemove = (marshallId) => {
    setMarshalls(
      marshalls.map((marshall) => {
        if (marshall.id === marshallId && marshall.assignments > 0) {
          return {
            ...marshall,
            assignments: marshall.assignments - 1,
          };
        }
        return marshall;
      }),
    );
  };

  const handleViewAssignments = (marshallId) => {
    setSelectedMarshall(marshallId);
    setActiveTab("assignments");
  };

  // Only Head Marshalls can access this feature
  if (userRole !== "head-marshall") {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            Access Restricted
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Only Head Marshalls can manage marshall assignments. Please contact
            a Head Marshall for assistance.
          </p>
          <div className="flex justify-center mt-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Menu
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedMarshallData = marshalls.find((m) => m.id === selectedMarshall);
  const marshallAssignments = assignments.filter(
    (a) => a.marshallId === selectedMarshall,
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-background">
      <Card className="border-2 border-primary/10 shadow-lg">
        <CardHeader className="bg-primary/20 pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">
              Digital Score Sheet
            </CardTitle>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="manage">Manage Marshalls</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
            </TabsList>

            <TabsContent value="manage" className="mt-0">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Current Marshalls</h3>
                <Dialog
                  open={isAddDialogOpen}
                  onOpenChange={setIsAddDialogOpen}
                >
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Marshall
                  </Button>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Marshall</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="marshallName">Marshall Name</Label>
                        <Input
                          id="marshallName"
                          value={newMarshall.name}
                          onChange={(e) =>
                            setNewMarshall({ name: e.target.value })
                          }
                          placeholder="Enter name"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleAddMarshall}
                        disabled={!newMarshall.name}
                      >
                        Add Marshall
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Assignments</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marshalls.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center py-4 text-muted-foreground"
                      >
                        No marshalls added yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    marshalls.map((marshall) => (
                      <TableRow key={marshall.id}>
                        <TableCell
                          className="font-medium cursor-pointer hover:text-primary hover:underline"
                          onClick={() => handleViewAssignments(marshall.id)}
                        >
                          {marshall.name}
                        </TableCell>
                        <TableCell>{marshall.assignments}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewAssignments(marshall.id)}
                              title="View Assignments"
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAssign(marshall.id)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemove(marshall.id)}
                              disabled={marshall.assignments <= 0}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <div className="mt-6 flex justify-center gap-4">
                <Button className="bg-green-600 hover:bg-green-700">
                  Assign/Reassign Marshalls
                </Button>
                <Button variant="outline" onClick={onBack}>
                  Main Menu
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="assignments" className="mt-0">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-center mb-2">
                  Assignments
                </h2>
                <h3 className="text-lg font-semibold text-center mb-4">
                  {selectedMarshallData?.name || "Select a Marshall"}
                </h3>

                <AssignmentSchedule
                  assignments={marshallAssignments}
                  userRole={userRole}
                  onAssignmentUpdate={(updatedAssignment) => {
                    setAssignments(
                      assignments.map((a) =>
                        a.id === updatedAssignment.id ? updatedAssignment : a,
                      ),
                    );
                  }}
                  onAssignmentDelete={(assignmentId) => {
                    setAssignments(
                      assignments.filter((a) => a.id !== assignmentId),
                    );
                  }}
                />
              </div>

              <div className="flex flex-col gap-2 mt-6">
                <Button className="bg-red-600 hover:bg-red-700 w-full">
                  Reschedule
                </Button>
                <Button
                  variant="outline"
                  className="bg-green-600 hover:bg-green-700 text-white w-full"
                  onClick={() => setActiveTab("manage")}
                >
                  Main Menu
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarshallAssignments;
