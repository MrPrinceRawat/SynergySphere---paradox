"use client"

import { ModeToggle } from "@/components/mode-toggle";
import { Input } from "@/components/ui/input";
import { MessageCircleQuestion, Settings } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
  import { usePathname } from "next/navigation";

export default function ProjectsTopBar() {
    const pathname = usePathname();
    const pathItems: any[] = [];
    const paths = pathname.split("/");
  
    paths.forEach((path, index) => {
      if (path) {
          pathItems.push({
            label: path,
            href: `${paths.slice(0, index + 1).join("/")}`,
          });
        // if (path !== "dashboard") {
        // }
      }
    });

  return (
    <div className="h-14 w-[calc(100vw-16rem)] flex flex-row items-center justify-between border-b px-4 pr-6 gap-6 ml-64">
      <Breadcrumb className="w-full">
        <BreadcrumbList>
          {pathItems &&
            pathItems.map((item, index) => (
              <>
                {index !== 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem key={index}>
                  <BreadcrumbLink href={item.href}>
                    <p className="text-sm text-muted-foreground capitalize">
                      {item.label}
                    </p>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="w-fit h-full flex items-center gap-3">
        <Input
          width={200}
          placeholder="Search..."
          className="w-96"
          type="search"
        />
        <Settings className="w-5 h-5 cursor-pointer text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors" />
        <MessageCircleQuestion className="w-5 h-5 cursor-pointer text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors" />
        <div className="h-full w-fit py-3">
          <div className="h-full w-1 border-r"></div>
        </div>
        <ModeToggle />
      </div>
    </div>
  );
}
