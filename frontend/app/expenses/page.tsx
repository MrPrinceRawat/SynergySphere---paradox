"use client";

import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import { RefreshCcw, Sparkles } from "lucide-react";
import TaskTable from "../projects/[project_id]/tasks-componenets/table";
import ProjectsTopBar from "../projects-top-bar";
import { fetchWithAuth } from "../utils/customFetch";
import StandAloneExpenseTable from "./table";

const fetchExpensesRequest = async () => {
    const token = Cookies.get("auth-token");
    const res = await fetch(`http://localhost:8080/api/expenses`, {
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
    }
  };

export default function TasksPage() {

   const [expenses, setExpenses] = useState<any>([]);
 
   const fetchExpenses = async () => {   
     const tasks = await fetchExpensesRequest();
     setExpenses(tasks);
   };
 
   useEffect(() => {
     fetchExpenses();
   }, []);

  return (
    <div className="flex-1 flex flex-col">
      <ProjectsTopBar />

      <div className="flex w-[calc(100vw-16rem)] ml-64 px-12">
        <div className="w-full mt-8 flex flex-col gap-8">
              <div className="flex flex-row items-center justify-between">
                <h1 className="text-xl font-bold capitalize">Project Expenses</h1>
                <div className="flex flex-row gap-4 items-center">
                    <RefreshCcw className="h-6 w-6 text-gray-500 hover:text-black cursor-pointer" onClick={fetchExpenses} />
                  {/* <AddExpenseDialog parentId={project.project_id} parentType="project" /> */}
                </div>
              </div>
              <StandAloneExpenseTable initialExpenses={expenses} refreshExpenses={fetchExpenses} />
            </div>
      </div>
    </div>
  );
}
