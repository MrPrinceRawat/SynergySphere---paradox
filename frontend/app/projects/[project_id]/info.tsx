"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2 } from "lucide-react";
import AddMember from "./addMember";
import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import AddMemberList from "./tasks-componenets/selectMembers";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const removeMemberRequest = async (
  username: string,
  project_id: string,
  members: string[]
) => {
  const token = Cookies.get("auth-token");
  const res = await fetch(`http://localhost:8080/api/projects/${project_id}`, {
    method: "PUT",
    headers: {
      Authorization: token || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      members: members.filter((member) => member !== username),
    }),
  });
};

const updateProjectRequest = async (
  field: any,
  value: any,
  project_id: string
) => {
  const token = Cookies.get("auth-token");
  const res = await fetch(`http://localhost:8080/api/projects/${project_id}`, {
    method: "PUT",
    headers: {
      Authorization: token || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      [field]: value,
    }),
  });
};

const deleteProjectRequest = async (project_id: string) => {
  const token = Cookies.get("auth-token");
  const res = await fetch(`http://localhost:8080/api/projects/${project_id}`, {
    method: "DELETE",
    headers: {
      Authorization: token || "",
    },
  });
  window.location.replace("/");
};

export default function ProjectInfo({
  unmodified_project,
}: {
  unmodified_project: any;
}) {
  const [modified_project, setModified_project] = useState(unmodified_project);

  useEffect(() => {
    setModified_project(unmodified_project);
  }, [unmodified_project]);

  return (
    <div className="w-full flex flex-col">
      {/* // Basic Info */}
      <div className="w-full h-fit flex flex-row px-4 mt-6 py-6 border-b justify-between">
        <div>
          <div>
            <h1 className="text-xl font-bold capitalize">Basic Info</h1>
          </div>
          <p className="text-neutral-900 dark:text-gray-600 text-sm ">
            Basic Info about the project.
          </p>
        </div>
        <div className="flex flex-col gap-8 text-sm w-2/3">
          <div className="flex flex-col gap-1">
            <p className="font-semibold">Project ID:</p>
            <Input
              className="w-2/3 text-lg"
              value={unmodified_project.project_id}
              disabled
            />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-semibold">Name:</p>
            <div className="flex flex-row items-center gap-2">
              <Input
                className="w-2/3"
                value={modified_project.name}
                onChange={(e) =>
                  setModified_project({
                    ...modified_project,
                    name: e.target.value,
                  })
                }
              />
              {modified_project.name != unmodified_project.name && (
                <Button
                  onClick={async () => {
                    await updateProjectRequest(
                      "name",
                      modified_project.name,
                      unmodified_project.project_id
                    );
                    window.location.reload();
                  }}
                >
                  Save
                </Button>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-semibold">Description:</p>
            <div className="flex flex-row items-center gap-2">
              <Textarea
                className="w-2/3"
                value={modified_project.description}
                onChange={(e) =>
                  setModified_project({
                    ...modified_project,
                    description: e.target.value,
                  })
                }
              />
              {modified_project.description !=
                unmodified_project.description && (
                <Button
                  onClick={async () => {
                    await updateProjectRequest(
                      "description",
                      modified_project.description,
                      unmodified_project.project_id
                    );
                    window.location.reload();
                  }}
                >
                  Save
                </Button>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-semibonullld">Deadline</p>
            <Input
              className="w-2/3"
              value={new Date(unmodified_project.deadline).toLocaleString()}
            />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-semibold">Created On:</p>
            <Input
              className="w-2/3"
              value={new Date(unmodified_project.created_at).toLocaleString()}
              disabled
            />
          </div>{" "}
          <div className="flex flex-col gap-1">
            <p className="font-semibold">Last Updated On:</p>
            <Input
              className="w-2/3"
              value={new Date(unmodified_project.updated_at).toLocaleString()}
              disabled
            />
          </div>
        </div>
      </div>

      {/* // Members */}
      <div className="w-full h-fit flex flex-row px-4 mt-6 py-6 border-b justify-between">
        <div>
          <h1 className="text-xl font-bold capitalize">Members Info</h1>
          <p className="text-neutral-900 dark:text-gray-600 text-sm ">
            Member Info about the project.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm w-2/3">
          <h1 className="font-semibold">Members</h1>
          {unmodified_project.members &&
            unmodified_project.members.map((member, index) => (
              <div className="flex flex-row items-center gap-1" key={index}>
                <Input className="w-2/3" value={member} disabled />{" "}
                {member != unmodified_project.created_by && (
                  <Trash2
                    className="w-5 h-5 text-red-500 hover:text-red-900 dark:text-red-400 dark:hover:text-red-100 transition-colors cursor-pointer"
                    onClick={async () => {
                      await removeMemberRequest(
                        member,
                        unmodified_project.project_id,
                        unmodified_project.members || []
                      );
                      window.location.reload();
                    }}
                  />
                )}
              </div>
            ))}
          <AddMemberList
            project_id={unmodified_project.project_id}
            members={unmodified_project.members || []}
          />
        </div>
      </div>

      {/* // Budget */}
      <div className="w-full h-fit flex flex-row px-4 mt-6 py-6 border-b justify-between">
        <div>
          <h1 className="text-xl font-bold capitalize">Budget</h1>
          <p className="text-neutral-900 dark:text-gray-600 text-sm ">
            Project's Budget Management.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-sm w-2/3">
          <div className="flex flex-col gap-2">
            <p className="font-semibold">Budget:</p>
            <div className="flex flex-row items-center gap-2">
              <div className="flex h-10 w-2/3 rounded-md border border-input bg-background text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                
                <div className="w-fit border-r rounded-l-md px-4 py-2 text-sm text-muted-foreground">
                ₹
                </div>
                <div className="flex-1 bg-background px-3 py-2 text-sm text-muted-foreground">
                  {unmodified_project.budget}
                </div>
                <div className="right-4 flex items-center px-3">
                  <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-row gap-2">
            <p className="font-semibold">Total Expenses:</p>
            <p>{unmodified_project.spend}</p>
          </div>
          <Progress value={unmodified_project.spend/unmodified_project.budget*100} className="w-2/3" />
        </div>
      </div>

      {/* Actions */}
      <div className="w-full h-fit flex flex-row px-4 mt-6 py-6 border-b justify-between">
        <div>
          <h1 className="text-xl font-bold capitalize">Delete Project</h1>
          <p className="text-neutral-900 dark:text-gray-600 text-sm ">
            Delete a project.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-sm w-2/3">
          <Dialog>
            <DialogTrigger asChild>
            <Button variant="destructive"
            className="w-1/5"
          >Delete</Button>
            </DialogTrigger>
            <DialogContent className="w-full max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Delete Project</DialogTitle>
                <DialogDescription>Are you sure you want to delete this project?</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogTrigger>
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    onClick={() => deleteProjectRequest(unmodified_project.project_id)}
                  >
                    Delete
                  </Button>
                </DialogTrigger>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
