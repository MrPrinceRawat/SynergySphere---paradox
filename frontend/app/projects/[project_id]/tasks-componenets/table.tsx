"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  CalendarIcon,
  CheckCheck,
  CircleDashed,
  Clock,
  MessageCircle,
  Tag,
  User,
} from "lucide-react";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";

export interface Task {
  task_id: string;
  project_id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | string;
  created_by: string;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
  due_date: string; // ISO date string (YYYY-MM-DD)
  priority: "1" | "2" | "3" | string;
  assignees: string[];
  comments: string[] | null;
  tags: string[];
}

export default function TaskTable({ initialTasks, refreshTasks, chat, setChat }: any) {
  const [tasks, setTasks] = useState();
  const token = Cookies.get("auth-token");
  const [open, setOpen] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "1":
        return "bg-red-100 text-red-800";
      case "2":
        return "bg-orange-100 text-orange-800";
      case "3":
        return "bg-blue-100 text-blue-800";
      case "4":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "1":
        return "High";
      case "2":
        return "Medium";
      case "3":
        return "Normal";
      case "4":
        return "Low";
      default:
        return "Unknown";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const markTaskAsCompleted = async (taskId: string) => {
    const res = await fetch(`http://localhost:8080/api/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        Authorization: token || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "completed",
      }),
    });
    refreshTasks();
  };

  const markTaskAsActive = async (taskId: string) => {
    const res = await fetch(`http://localhost:8080/api/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        Authorization: token || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "active",
      }),
    });
    refreshTasks();
  };

  const deleteTask = async (taskId: string) => {
    await fetch(`http://localhost:8080/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        Authorization: token || "",
      },
    });
    refreshTasks();
  };

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  return (
    <div className="border rounded-md w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[10px]">Task ID</TableHead>
            <TableHead>Task Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assignees</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Created By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks &&
            tasks.map((task: any) => (
              <TableRow
                key={task.task_id}
                className={`cursor-pointer ${task.status === "completed" ? "opacity-50" : ""}`}

              >
                <Dialog >
                  <DialogTrigger asChild>
                    <TableCell
                      className={
                        task.status === "completed"
                          ? "line-through text-gray-500"
                          : ""
                      }
                    >
                      {task.task_id}
                    </TableCell>
                  </DialogTrigger>
                  <DialogContent className="w-full max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold ">
                        {task.name}
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 mt-2">
                      {/* Status and Priority */}
                      <div className="flex gap-3">
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          {task.status}
                        </Badge>
                        <Badge className={getPriorityColor(task.priority)}>
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {getPriorityLabel(task.priority)} Priority
                        </Badge>
                      </div>

                      {/* Description */}
                      <div>
                        <h3 className="text-sm font-medium mb-2">
                          Description
                        </h3>
                        <p className="text-gray-400 p-1 rounded-md">
                          {task.description}
                        </p>
                      </div>

                      {/* Task Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              Created By
                            </h3>
                            <p className="text-gray-400">{task.created_by}</p>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                              <CalendarIcon className="w-4 h-4 mr-1" />
                              Due Date
                            </h3>
                            <p className="text-gray-400">
                              {new Date(task.due_date).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-gray-600 mb-1">
                              Assignees
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {task.assignees.length > 0 ? (
                                task.assignees.map((assignee, index) => (
                                  <Badge key={index} variant="secondary">
                                    {assignee}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-gray-400 text-sm">
                                  No assignees
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              Created At
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {formatDate(task.created_at)}
                            </p>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              Updated At
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {formatDate(task.updated_at)}
                            </p>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                              <Tag className="w-4 h-4 mr-1" />
                              Tags
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {task.tags && task.tags.length > 0 ? (
                                task.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline">
                                    {tag}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-gray-500 text-sm">
                                  No tags
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Task ID */}
                      <div className="border-t pt-4">
                        <h3 className="text-sm font-medium text-gray-600 mb-1">
                          Task ID
                        </h3>
                        <code className="text-xs px-2 py-1 rounded text-gray-400 break-all">
                          {task.task_id}
                        </code>
                      </div>

                      {/* Comments Section */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-600 mb-2">
                          Comments
                        </h3>
                        <div className="p-3 rounded-md">
                          <p className="text-gray-500 text-sm">
                            {task.comments ? task.comments : "No comments yet"}
                          </p>
                        </div>
                      </div>
                    </div>
                  <DialogFooter>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          deleteTask(task.task_id)
                        }}
                      >
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogTrigger asChild>
                      {
                        task.status === "completed" ? (
                          <Button
                            variant="outline"
                            onClick={() => {
                              markTaskAsActive(task.task_id)
                            }}
                          >
                            Mark as Active
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => {
                              markTaskAsCompleted(task.task_id)
                            }}
                          >
                            Mark as Completed
                          </Button>
                        )
                      }
                    </DialogTrigger>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <TableCell
                  className={
                    task.status === "completed"
                      ? "line-through text-gray-500"
                      : ""
                  }
                >
                  {task.name}
                </TableCell>
                <TableCell
                  className={
                    task.status === "completed" ? " text-gray-500" : ""
                  }
                >
                  {task.description}
                </TableCell>
                <TableCell
                  className={
                    task.status === "completed" ? " text-gray-500" : ""
                  }
                >
                  {task.status}
                </TableCell>
                <TableCell
                  className={
                    task.status === "completed" ? " text-gray-500" : ""
                  }
                >
                  {task.priority}
                </TableCell>
                <TableCell
                  className={
                    task.status === "completed" ? " text-gray-500" : ""
                  }
                >
                  {task.assignees.length > 0 ? task.assignees.join(", ") : "—"}
                </TableCell>
                <TableCell
                  className={
                    new Date(task.due_date) < new Date() ? "text-red-500" : ""
                  }
                >
                  {new Date(task.due_date).toLocaleDateString()}
                </TableCell>
                <TableCell
                  className={
                    task.status === "completed" ? " text-gray-500" : ""
                  }
                >
                  {task.created_by}
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      {task.status === "completed" ? (
                        <CircleDashed className="h-4 w-4 text-red-500" />
                      ) : (
                        <CheckCheck className="h-4 w-4 text-green-500" />
                      )}
                    </DialogTrigger>
                    <DialogContent className="w-full">
                        <DialogHeader>
                          <DialogTitle>Mark {
                              task.status === "completed" ? "Active" : "Completed"
                            }</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to mark this task as {
                              task.status === "completed" ? "active" : "completed"
                            }?
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogTrigger asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogTrigger>
                          <DialogTrigger asChild>
                            {
                              task.status === "completed" ? (
                                <Button
                                  variant="outline"
                                  onClick={() => markTaskAsActive(task.task_id)}
                                >
                                  Yes
                                </Button>
                              ) : (
                                <Button
                              variant="outline"
                              onClick={() => markTaskAsCompleted(task.task_id)}
                            >
                              Yes
                            </Button>
                              )
                            }
                          </DialogTrigger>
                        </DialogFooter>
                      </DialogContent>
                  </Dialog>
                </TableCell>
                <TableCell>
                  <MessageCircle className="w-4 h-4 text-gray-500 hover:text-black cursor-pointer" onClick={() => setChat({ open: !chat, task: task })} />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
