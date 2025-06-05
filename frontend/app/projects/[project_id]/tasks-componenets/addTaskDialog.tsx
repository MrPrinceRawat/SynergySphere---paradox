"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import Cookies from "js-cookie";

export default function AddTaskDialog({ project }: { project: any }) {
  const [assignees, setAssignees] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const token = Cookies.get("auth-token");

  // Fetch users from API
  const fetchUsers = async (query: string) => {
    if (!query || query.length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/users/find?username=${encodeURIComponent(
          query
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: token || "",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAssigneeToggle = (user: string) => {
    const isSelected = assignees.includes(user);

    if (isSelected) {
      setAssignees((prev) => prev.filter((id) => id !== user));
      setSelectedUsers((prev) => prev.filter((u) => u !== user));
    } else {
      setAssignees((prev) => [...prev, user]);
      setSelectedUsers((prev) => [...prev, user]);
    }

    setSearchQuery("");
    setUsers([]);

  };

  const removeAssignee = (userId: string) => {
    setAssignees((prev) => prev.filter((id) => id !== userId));
    setSelectedUsers((prev) => prev.filter((u) => u !== userId));
  };

  const createTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const taskName = formData.get("task_name");
    const taskDescription = formData.get("task_description");
    const taskPriority = formData.get("task_priority");
    const taskDueDate = formData.get("task_due_date");
    const taskAssignees = selectedUsers.map((user) => user);
    const taskStatus = formData.get("task_status");

    console.log(taskName, taskDescription, taskPriority, taskDueDate, taskAssignees);

    if (!taskName || !taskDescription || !taskPriority || !taskDueDate || !taskAssignees) {
      alert("Please fill in all required fields.");
      return;
    }

    const token = Cookies.get("auth-token");
    const res = await fetch(`http://localhost:8080/api/tasks`, {
      method: "POST",
      headers: {
        Authorization: token || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: taskName,
        project_id: project.project_id,
        description: taskDescription,
        priority: taskPriority,
        due_date: taskDueDate,
        assignees: taskAssignees,
      }),
    });

    if (res.status === 200) {
      alert("Task added successfully!");
    } else {
      alert("Failed to add task.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Task</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
          <DialogDescription>Add a new task to your project.</DialogDescription>
        </DialogHeader>
        <form onSubmit={createTask}>
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="task_name" className="block text-sm font-medium">
              Task Name
              <span className="text-red-500">*</span>
            </label>
            <Input id="task_name" placeholder="Task Name" name="task_name" />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="task_description"
              className="block text-sm font-medium "
            >
              Task Description <span className="text-red-500">*</span>
            </label>
            <Textarea id="task_description" placeholder="Task Description" name="task_description" />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="task_priority"
              className="block text-sm font-medium"
            >
              Task Priority <span className="text-red-500">*</span>
            </label>
            <Input
              id="task_priority"
              placeholder="Task Priority"
              type="number"
              name="task_priority"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="task_due_date"
              className="block text-sm font-medium"
            >
              Task Due Date <span className="text-red-500">*</span>
            </label>
            <Input
              id="task_due_date"
              placeholder="Task Due Date"
              type="datetime-local"
              name="task_due_date"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium">
              Task Assignees <span className="text-red-500">*</span>
            </label>

            {/* Selected assignees display */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedUsers.map((user) => (
                  <Badge
                    key={user}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {user}
                    <button
                      type="button"
                      onClick={() => removeAssignee(user)}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Search input */}
            <div className="relative">
              <Input
                placeholder="Type to search for users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                name="task_assignees"
              />

              {/* Search results dropdown */}
              {searchQuery.length >= 1 && (users.length > 0 || loading) && (
                <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                  {loading ? (
                    <div className="p-3 text-sm text-gray-500">
                      Searching...
                    </div>
                  ) : (
                    users.map((user) => (
                      <div
                        key={user}
                        onClick={() => handleAssigneeToggle(user)}
                        className="flex items-center gap-2 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <Check
                          className={`h-4 w-4 ${
                            assignees.includes(user)
                              ? "opacity-100 text-green-600"
                              : "opacity-0"
                          }`}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {user}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* No results message */}
              {searchQuery.length >= 2 && !loading && users.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3">
                  <div className="text-sm text-gray-500">No users found</div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-row gap-4">
          <Button>Save</Button>
          <Button variant="outline">Cancel</Button>
        </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
