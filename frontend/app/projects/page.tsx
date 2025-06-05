// redirect to /
"use client"

import { useRouter } from "next/navigation";

export default function ProjectsPage() {

    const router = useRouter();

    router.push("/")

  return <div></div>
}