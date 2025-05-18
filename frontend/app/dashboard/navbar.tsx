export default function DashboardNavbar({ page, setPage }: { page: string, setPage: React.Dispatch<React.SetStateAction<string>> }) {
  return (
    <div className="flex flex-col items-center border w-[12%] py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">SynergySphere</h1>
      </div>
      <div className={"flex items-start justify-between w-full mt-6 px-4 border-t py-4 cursor-pointer" + (page === "projects" ? " bg-neutral-900" : "")} onClick={() => setPage("projects")}>
        <h3>
            Projects
        </h3>
      </div>
      <div className={"flex items-start justify-between w-full px-4 border-t border-b py-4 cursor-pointer" + (page === "myTasks" ? " bg-neutral-900" : "")} onClick={() => setPage("myTasks")}>
        <h3>
            My Tasks
        </h3>
      </div>
    </div>
  )
}