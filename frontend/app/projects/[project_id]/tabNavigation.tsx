"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import ProjectInfo from "./info";
import ProjectTasks from "./projectTasks";
import ProjectExpenses from "./projectExpenses";


const tabs = [
  {
    name: "Overview",
    label: "info",
  },
  {
    name: "Tasks",
    label: "tasks",
  },
  {
    name: "Expenses",
    label: "expenses",
  }
];


export default function TabNavigation({ project }: { project: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("info");
  
  const [loading, setLoading] = useState(true);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const [docs, setDocs] = useState<any>([]);

  return (
    <div className="w-full h-full flex flex-col ">
      <div className="flex flex-row gap-4 border-b px-4">
        {tabs.map((tab) => (
          <div
            className={`flex flex-col items-center justify-center cursor-pointer p-2 ${
              activeTab === tab.label
                ? "border-b-2 border-accent-foreground"
                : ""
            }`}
            onClick={() => handleTabClick(tab.label)}
            key={tab.label}
          >
            <p className="text-sm text-accent-foreground">{tab.name}</p>
          </div>
        ))}
      </div>
      <div className="h-full flex px-6 ">
        {activeTab === "info" && <ProjectInfo unmodified_project={project} />}
        {activeTab === "tasks" && <ProjectTasks project={project} />}
        {activeTab === "expenses" && <ProjectExpenses project={project} />}
      </div>
    </div>
  );
}
