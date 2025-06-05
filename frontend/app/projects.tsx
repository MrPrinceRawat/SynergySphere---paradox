import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchWithAuth } from "./utils/customFetch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flag, FolderMinus, PlusIcon, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getTagColor } from "./utils/tagColor";

export default function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    var token = Cookies.get("auth-token");
    fetchWithAuth("http://localhost:8080/api/projects", {
      method: "GET",
      headers: {
        Authorization: token || "",
      },
    })
      .then((res) => res.json())
      .then((data) => setProjects(data));
  }, []);

  return (
    <div className="w-full h-full flex flex-col p-6">
      <h1 className="text-2xl font-bold">Projects</h1>
      <Tabs defaultValue="grid">
        <div className="flex flex-row items-center gap-2">
          <TabsList className="ml-auto">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          <CreateProject />
        </div>
        <TabsContent value="list">
          <TableView projects={projects} />
        </TabsContent>
        <TabsContent value="grid">
          <GridView projects={projects} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TableView({ projects }: { projects: any[] }) {
  return (
    <Table className="mt-8">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Name</TableHead>
          <TableHead>Project ID</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created On</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead>Members</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project, index) => (
          <TableRow
            key={index}
            className="hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
          >
            <TableCell className="font-bold">{project.name}</TableCell>
            <TableCell className="font-medium">{project.project_id}</TableCell>
            <TableCell className="flex flex-row items-center gap-2">
              {project.status === "active" ? (
                <div className="w-2 h-2 rounded-full bg-green-500 text-white flex items-center justify-center"></div>
              ) : (
                <div className="w-2 h-2 rounded-full bg-red-500 text-white flex items-center justify-center"></div>
              )}
              {project.status === "active" ? (
                <span className="text-sm">Active</span>
              ) : (
                <span className="text-sm">Inactive</span>
              )}
            </TableCell>
            <TableCell>
              {new Date(project.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </TableCell>
            <TableCell>
              {new Date(project.updated_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </TableCell>
            <TableCell>
              {project.members.length > 0 &&
                project.members.map((member, index) => (
                  <Avatar>
                    <AvatarImage
                      src="https://loremflickr.com/200/200"
                      alt="@shadcn"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                ))}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function GridView({ projects }: { projects: any[] }) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 cursor-pointer">
      {projects.map((project, index) => (
        <div
          key={index}
          className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          onClick={() => router.push(`/projects/${project.project_id}`)}
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex flex-row">
              {project.tags.map((tag: any, index: number) => (
                <p
                  className={
                    tag.color === "red"
                      ? "mr-2 text-red-500 bg-red-950 px-2 rounded-sm text-xs"
                      : "mr-2 text-green-500 bg-green-950 px-2 rounded-sm text-sm"
                  }
                  key={index}
                >
                  {tag.tag}
                </p>
              ))}
            </div>
            <div
              className={`w-2 h-2 rounded-full ${
                project.status === "active" ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
          </div>
          <h3 className="font-medium text-2xl">{project.name}</h3>
          {project.description && (
            <p className="text-gray-600 text-sm text-ellipsis line-clamp-2">
              {project.description}
            </p>
          )}
          <img
            src={project.image_url}
            alt="project image"
            className="w-full h-52 object-cover mt-4 rounded-lg"
          />
          <div className="mt-6 flex flex-row items-start justify-between gap-2">
            <div className="flex flex-row items-start gap-2">
              <Flag className="w-5 h-5 text-gray-400 font-semibold" />
              <p className="text-sm text-gray-400 font-semibold mb-1">
                {project.deadline}
              </p>
            </div>
            <div className="flex flex-row items-start gap-2">
              <FolderMinus className="w-5 h-5 text-gray-400 font-semibold" />
              <p className="text-sm text-gray-400 font-semibold mb-1">
                {project.task_count} tasks
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CreateProject() {
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);

  const createProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    // cast amount as a float 32
    const projectName = formData.get("project_name") as string;
    const projectDescription = formData.get("project_description") as string;
    const projectImage = formData.get("project_image") as string;
    const projectDeadline = formData.get("project_deadline") as string;
    const projectBudget = parseFloat(formData.get("project_budget") as string);

    if (
      !projectName ||
      !projectDescription ||
      !projectDeadline ||
      !projectBudget
    ) {
      alert("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    const token = Cookies.get("auth-token");

    const res = await fetch("http://localhost:8080/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token || "",
      },
      body: JSON.stringify({
        name: projectName,
        description: projectDescription,
        image_url: projectImage,
        deadline: projectDeadline,
        budget: projectBudget,
        tags: tags,
      }),
    });

    if (res.status === 200) {
      alert("Project created successfully!");
    } else {
      alert("Failed to create project.");
    }

    setLoading(false);
    window.location.replace("/");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="w-5 h-5" />
          Create Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>Create a new project.</DialogDescription>
        </DialogHeader>
        <form onSubmit={createProject}>
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="project_name"
                className="block text-sm font-medium"
              >
                Project Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="project_name"
                name="project_name"
                placeholder="Enter project name"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="project_description"
                className="block text-sm font-medium"
              >
                Project Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="project_description"
                name="project_description"
                placeholder="Enter project description"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="project_image"
                className="block text-sm font-medium"
              >
                {" "}
                Project Image{" "}
              </label>
              <Input
                id="project_image"
                name="project_image"
                placeholder="Enter project image url"
              />
            </div>

            <TagsInput tags={tags} setTags={setTags} />
            <div className="flex flex-col gap-2">
              <label
                htmlFor="project_deadline"
                className="block text-sm font-medium"
              >
                {" "}
                Deadline <span className="text-red-500">*</span>
              </label>
              <Input
                id="project_deadline"
                name="project_deadline"
                placeholder="Enter project deadline"
                type="date"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="project_budget"
                className="block text-sm font-medium"
              >
                {" "}
                Project Budget <span className="text-red-500">*</span>
              </label>
              <Input
                id="project_budget"
                name="project_budget"
                placeholder="Enter project budget"
              />
            </div>
          </div>
          <DialogTrigger asChild>
            <div className="mt-4 flex justify-end gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </div>
          </DialogTrigger>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TagsInput({ tags, setTags }: { tags: []; setTags: any }) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      const newTag = input.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, {
          tag: newTag,
          color: getTagColor(newTag),
        }]);
      }
      setInput("");
    } else if (e.key === "Backspace" && !input && tags.length) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="project_tags" className="block text-sm font-medium">
        Project Tags
      </label>
      <div className="flex flex-wrap gap-2 border rounded-md p-2 min-h-[32px] dark:bg-input/30">
        {tags.map((tag) => (
          <span
            key={tag}
            className={`${getTagColor(
              tag.tag
            )} px-2 py-1 rounded-full flex items-center gap-1 text-sm`}
          >
            {tag.tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-blue-500 hover:text-blue-700"
            >
              &times;
            </button>
          </span>
        ))}
        <input
          id="project_tags"
          name="project_tags"
          className="flex-grow outline-none text-sm placeholder:text-sm"
          placeholder="Add a tag and press Enter"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
