"use client"

import DashboardNavbar from "./navbar";
import { useState } from "react";
import Projects from "./projects";
import ProjectsTopBar from "./projects-top-bar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [page, setPage] = useState("projects");
  return (
<div className="flex min-h-screen">
  {/* <DashboardNavbar page={page} setPage={setPage} /> */}
  
  <div className="flex-1 flex flex-col">
    <ProjectsTopBar />
    
    <div className="flex w-[calc(100vw-16rem)] ml-64">
      <div className="w-full">
        {page === "projects" && <Projects />}
      </div>
      
      <div className="flex-1">
        {page !== "projects" && (
          <div>Current page content</div>
        )}
      </div>
    </div>
  </div>
</div>
  )
}