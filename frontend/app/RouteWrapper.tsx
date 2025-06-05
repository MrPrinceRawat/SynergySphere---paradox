"use client";

import { usePathname } from "next/navigation";
import DashboardNavbar from "./navbar";
import { useState } from "react";

const HIDE_SIDEBAR_ROUTES = ["/login", "/register"];

export default function RouteWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
const [page, setPage] = useState("projects");
  
  const hideSidebar = HIDE_SIDEBAR_ROUTES.includes(pathname);

  return (
    <div className="app-container">
      {!hideSidebar && <DashboardNavbar page={page} setPage={setPage} />}
      <main className={!hideSidebar ? "with-sidebar" : "full-width"}>
        {children}
      </main>
    </div>
  );
}
