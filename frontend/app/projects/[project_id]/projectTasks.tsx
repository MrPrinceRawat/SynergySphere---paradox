"use client";

import TaskTable from "./tasks-componenets/table";
import AddTaskDialog from "./tasks-componenets/addTaskDialog";
import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import { RefreshCcw } from "lucide-react";

const fetchTasksRequest = async (project_id: string) => {
  const token = Cookies.get("auth-token");
  const res = await fetch(
    `http://localhost:8080/api/tasks/project?project_id=${project_id}`,
    {
      method: "GET",
      headers: {
        Authorization: token || "",
        "Content-Type": "application/json",
      },
    }
  );

  if (res.status === 200) {
    const data = await res.json();
    return data || [];
  } else {
    alert("Failed to fetch tasks.");
  }
};

export default function ProjectTasks({ project }: { project: any }) {
  const [tasks, setTasks] = useState<any>([]);
  const [chat, setChat] = useState<any>({
    open: false,
    task: null,
  });

  const fetchTasks = async () => {
    const tasks = await fetchTasksRequest(project.project_id);
    setTasks(tasks);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="w-full h-full flex flex-row">
      <div className="w-full mt-8 flex flex-col gap-8">
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-xl font-bold capitalize">Project Tasks</h1>
          <div className="flex flex-row gap-4 items-center">
            <RefreshCcw
              className="h-6 w-6 text-gray-500 hover:text-black cursor-pointer"
              onClick={fetchTasks}
            />
            <AddTaskDialog project={project} />
          </div>
        </div>
        <TaskTable initialTasks={tasks} refreshTasks={fetchTasks} chat={chat} setChat={setChat} />
      </div>
      {
        chat.open && (
          <div className="w-[30%] h-full border-l ml-4"></div>
        )
      }
    </div>
  );
}
