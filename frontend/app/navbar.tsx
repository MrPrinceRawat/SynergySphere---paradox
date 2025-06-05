
import { usePathname } from "next/navigation";

import {
  ClipboardList,
  Inbox,
  KanbanSquare,
  LogOut,
  Receipt,
  WalletCards,
} from "lucide-react";
import Cookies from "js-cookie";
import Link from "next/link";
import UserSectionNavbar from "./user-section-navbar";

export default function DashboardNavbar({
  page,
  setPage,
}: {
  page: string;
  setPage: React.Dispatch<React.SetStateAction<string>>;
}) {

  const pathname = usePathname();

  return (
    <div className="flex flex-col h-screen w-64 min-w-[16rem] border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-1 fixed left-0 top-0">
      <div className="flex items-center justify-center p-4 mb-6 mt-2 w-full">
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
          SynergySphere
        </h1>
      </div>

      <nav className="flex flex-col gap-1 flex-1 px-2">
        <Link href="/">
          <div
            className={`flex items-center w-full p-3 rounded-lg cursor-pointer transition-colors ${
              pathname === "/" || pathname.includes("/projects")
                ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            }`}
          >
            <KanbanSquare className="w-5 h-5 mr-3" />
            <span className="text-sm">Projects</span>
          </div>
        </Link>
        <Link href="/tasks">
          <div
            className={`flex items-center w-full p-3 rounded-lg cursor-pointer transition-colors ${
              pathname === "/tasks"
                ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            }`}
            onClick={() => setPage("myTasks")}
          >
            <ClipboardList className="w-5 h-5 mr-3" />
            <span className="text-sm">My Tasks</span>
          </div>
        </Link>

        <Link href="/expenses">
        <div
          className={`flex items-center w-full p-3 rounded-lg cursor-pointer transition-colors ${
            pathname === "/expenses"
              ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
          }`}
          onClick={() => setPage("Receipts")}
        >
          <Receipt className="w-5 h-5 mr-3" />
          <span className="text-sm">Expenses</span>
        </div>
        </Link>
      </nav>

      <UserSectionNavbar />
    </div>
  );
}
