"use client"

import DashboardNavbar from "./navbar";
import { useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [page, setPage] = useState("projects");
  return (
    <div className="flex min-h-screen flex-row">
      <DashboardNavbar page={page} setPage={setPage} />
      {children}
    </div>
  )
}