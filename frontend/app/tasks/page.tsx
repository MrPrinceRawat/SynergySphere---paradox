"use client";

import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import { RefreshCcw, Sparkles } from "lucide-react";
import TaskTable from "../projects/[project_id]/tasks-componenets/table";
import ProjectsTopBar from "../projects-top-bar";
import AddTaskDialog from "./addTaskDialog";
import { fetchWithAuth } from "../utils/customFetch";

const fetchTasksRequest = async () => {
  const token = Cookies.get("auth-token");
  const res = await fetch(`http://localhost:8080/api/tasks`, {
    method: "GET",
    headers: {
      Authorization: token || "",
      "Content-Type": "application/json",
    },
  });

  if (res.status === 200) {
    const data = await res.json();
    return data || [];
  } else {
    alert("Failed to fetch tasks.");
  }
};

const getProjectsRequest = async () => {
    var token = Cookies.get("auth-token");
    const res = await fetchWithAuth("http://localhost:8080/api/projects", {
      method: "GET",
      headers: {
        Authorization: token || "",
      },
    })

    const data = res.json();

    return data
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<any>([]);
  const [projects, setProjects] = useState<any>([]);
  const [rankedTaskList, setRankedTaskList] = useState<any>([]);

  const [rankedToggle, setRankedToggle] = useState(false);


  const fetchTasks = async () => {
    const tasks = await fetchTasksRequest();
    setTasks(tasks);
  };

  const fetchProjects = async () => {
    const data = await getProjectsRequest();
    setProjects(data);
  };

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  useEffect(() => {
    setRankedTaskList(rankTasks(tasks));
  }, [tasks]);

  return (
    <div className="flex-1 flex flex-col">
      <ProjectsTopBar />

      <div className="flex w-[calc(100vw-16rem)] ml-64 px-12">
        <div className="w-full mt-8 flex flex-col gap-8">
          <div className="flex flex-row items-center justify-between">
            <h1 className="text-xl font-bold capitalize">My Tasks</h1>
            <div className="flex flex-row gap-4 items-center">
                <Sparkles className={`h-6 w-6 text-gray-500 hover:text-black cursor-pointer transition-colors ${
                    rankedToggle ? "text-white" : "text-gray-500"
                }`} onClick={() => setRankedToggle(!rankedToggle)} />
              <RefreshCcw
                className="h-6 w-6 text-gray-500 hover:text-black cursor-pointer"
                onClick={fetchTasks}
              />
              <AddTaskDialog projectList={projects} taskList={tasks} />
            </div>
          </div>
          <TaskTable initialTasks={
            rankedToggle ? rankedTaskList : tasks
          } refreshTasks={fetchTasks} />
        </div>
      </div>
    </div>
  );
}

function calculatePriority(task, allTasks) {
    const now = new Date();
    const due = new Date(task.due_date);
    const daysUntilDue = Math.max((due - now) / (1000 * 60 * 60 * 24), 0.1); // prevent div by 0

    console.log(task.deadline, due, daysUntilDue);
  
    const urgency = 1 / daysUntilDue;
    const effort = task.estimated_effort || 1;
  
    const dependentTasks = allTasks.filter(t =>
      t.depends_on.includes(task.task_id) && t.status !== 'completed'
    );
    const dependencyCount = dependentTasks.length;
  
    const score = (5 * urgency) + (3 * dependencyCount) - (1 * effort);
    console.log(score, urgency, dependencyCount, effort);
    return score;

  }
  
  function rankTasks(tasks) {
    return tasks
      .filter(task => task.status !== 'completed')
      .map(task => ({ ...task, priority: calculatePriority(task, tasks) }))
      .sort((a, b) => b.priority - a.priority);
  }
  