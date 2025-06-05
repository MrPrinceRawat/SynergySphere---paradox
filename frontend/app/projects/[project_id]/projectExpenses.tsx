"use client";

import TaskTable from "./tasks-componenets/table";
import AddTaskDialog from "./tasks-componenets/addTaskDialog";
import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import { RefreshCcw } from "lucide-react";
import ExpenseTable from "./expenses-component/table";
import AddExpenseDialog from "./expenses-component/addExpense";

const fetchExpensesRequest = async (project_id: string) => {
  const token = Cookies.get("auth-token");
  const res = await fetch(`http://localhost:8080/api/projects/${project_id}/expenses`, {
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

export default function ProjectExpenses({ project }: { project: any }) {

  const [expenses, setExpenses] = useState<any>([]);

  const fetchExpenses = async () => {   
    const tasks = await fetchExpensesRequest(project.project_id);
    setExpenses(tasks);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <div className="w-full mt-8 flex flex-col gap-8">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-xl font-bold capitalize">Project Expenses</h1>
        <div className="flex flex-row gap-4 items-center">
            <RefreshCcw className="h-6 w-6 text-gray-500 hover:text-black cursor-pointer" onClick={fetchExpenses} />
          <AddExpenseDialog parentId={project.project_id} parentType="project" />
        </div>
      </div>
      <ExpenseTable initialExpenses={expenses} refreshExpenses={fetchExpenses} />
    </div>
  );
}
