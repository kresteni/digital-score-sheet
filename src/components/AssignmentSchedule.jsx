import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Calendar, Clock, MapPin, Users, Edit, Save, X, Trash } from "lucide-react";
import { Input } from "./ui/input";

const AssignmentSchedule = ({
  assignments = [],
  onAssignmentUpdate = () => {},
  onAssignmentDelete = () => {},
  userRole,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editedAssignment, setEditedAssignment] = useState(null);

  const canEdit = userRole === "head-marshall";

  const handleEdit = (assignment) => {
    setEditingId(assignment.id);
    setEditedAssignment({ ...assignment });
  };

  const handleSave = () => {
    if (editedAssignment) {
      onAssignmentUpdate(editedAssignment);
      setEditingId(null);
      setEditedAssignment(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedAssignment(null);
  };

  const handleChange = (field, value) => {
    if (editedAssignment) {
      setEditedAssignment({ ...editedAssignment, [field]: value });
    }
  };

  const handleDelete = (assignmentId) => {
    onAssignmentDelete(assignmentId);
  };

  // Group assignments by date
  const groupedAssignments = {};
  assignments.forEach((assignment) => {
    if (!groupedAssignments[assignment.date]) {
      groupedAssignments[assignment.date] = [];
    }
    groupedAssignments[assignment.date].push(assignment);
  });

  // Sort dates
  const sortedDates = Object.keys(groupedAssignments).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  return (
    <div className="space-y-6">
      {sortedDates.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No assignments scheduled yet.
          </CardContent>
        </Card>
      ) : (
        sortedDates.map((date) => (
          <Card key={date} className="overflow-hidden">
            <CardHeader className="bg-primary/10 pb-2">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Pitch</TableHead>
                    <TableHead>Teams</TableHead>
                    <TableHead>Marshall</TableHead>
                    {canEdit && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedAssignments[date].map((assignment) => (
                    <TableRow key={assignment.id}>
                      {editingId === assignment.id ? (
                        // Editing mode
                        <>
                          <TableCell>
                            <Input
                              value={editedAssignment?.time || ""}
                              onChange={(e) =>
                                handleChange("time", e.target.value)
                              }
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={editedAssignment?.pitch || ""}
                              onChange={(e) =>
                                handleChange("pitch", e.target.value)
                              }
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={editedAssignment?.teams || ""}
                              onChange={(e) =>
                                handleChange("teams", e.target.value)
                              }
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={editedAssignment?.marshallName || ""}
                              onChange={(e) =>
                                handleChange("marshallName", e.target.value)
                              }
                              className="w-full"
                              disabled
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSave}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancel}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        // View mode
                        <>
                          <TableCell>
                            <div className="flex items-center">
                              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                              {assignment.time}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                              {assignment.pitch}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                              {assignment.teams}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {assignment.marshallName}
                          </TableCell>
                          {canEdit && (
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(assignment)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(assignment.id)}
                                >
                                  <Trash className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default AssignmentSchedule;
