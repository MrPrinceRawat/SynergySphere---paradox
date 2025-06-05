"use client";

import ProjectsTopBar from "@/app/projects-top-bar";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import { AvatarCircles } from "@/components/magicui/avatar-circles";
import TabNavigation from "./tabNavigation";

const getProjectInfo = async (project_id: string) => {
  const token = Cookies.get("auth-token");
  const res = await fetch(`http://localhost:8080/api/projects/${project_id}`, {
    method: "GET",
    headers: {
      Authorization: token || "",
    },
  });
  const data = await res.json();
  console.log(data);
  return data;
};

export default function ProjectPage() {
  const params = useParams();
  const project_id = params.project_id;
  const [project_info, setProjectInfo] = useState({});

  useEffect(() => {
    const fetchProjectInfo = async () => {
      const projectInfo = await getProjectInfo(project_id);
      setProjectInfo(projectInfo);
    };
    fetchProjectInfo();
  }, [project_id]);

  return (
    <div className="flex-1 flex flex-col">
      <ProjectsTopBar />

      <div className="flex w-[calc(100vw-16rem)] ml-64">
        <div className="flex min-h-screen w-full flex-col">
          <div className="w-full h-[25vh] flex flex-row items-center justify-between px-16">
            <div>
              <h1 className="text-2xl font-bold capitalize">
                {project_info.name}
              </h1>
              <p className="text-neutral-900 dark:text-gray-600 text-sm ">
                {project_info.project_id}
              </p>
              <p className="text-neutral-900 dark:text-gray-300 text-sm w-1/2 line-clamp-2 mt-2">
                {project_info.description}
              </p>
            </div>
            <div className="text-sm">
              {project_info.members && (
                <AvatarCircles
                  numPeople={project_info.members.length}
                  avatarUrls={project_info.members.map((member) => {
                    return {
                      "imageUrl": "https://loremflickr.com/cache/resized/defaultImage.small_200_200_nofilter.jpg"
                    }
                  })}
                />
              )}
            </div>
          </div>
          <TabNavigation project={project_info} />
        </div>
      </div>
    </div>
  );
}
