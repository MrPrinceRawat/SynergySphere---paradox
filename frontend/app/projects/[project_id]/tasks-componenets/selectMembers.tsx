"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Input } from "@/components/ui/input";

const addMemberRequest = async (username: string, project_id: string, currentMembers: string[]) => {

  
  const token = Cookies.get("auth-token");
  const res = await fetch(`http://localhost:8080/api/projects/${project_id}`, {
    method: "PUT",
    headers: {
      Authorization: token || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      members: currentMembers,
    }),
  });

  if (res.status === 200) {
    alert("Member added successfully!");
  } else {
    alert("Failed to add member.");
  }
  window.location.reload();
};

export default function AddMemberList({
  project_id,
  members,
}: {
  project_id: string;
  members: string[];
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const token = Cookies.get("auth-token");

  useEffect(() => {
    const fetchUsers = async () => {
      if (!search.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:8080/api/users/find?username=${encodeURIComponent(search)}`,
          {
            method: "GET",
            headers: {
              Authorization: token || "",
            },
          }
        );
        const data = await res.json();
        setResults(data || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchUsers, 300);

    return () => clearTimeout(debounce);
  }, [search]);

  const handleSelect = async (user: string) => {
    if (selected.includes(user)) return; // Avoid duplicates

    const updatedList = [...members, ...selected, user];
    await addMemberRequest(user, project_id, updatedList);

    setSelected((prev) => [...prev, user]);
    setSearch("");
    setResults([]);
  };

  return (
    <div className="flex flex-col gap-1 mt-2 relative w-2/3">
      <h1 className="font-semibold">Add a member</h1>
      <Input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search for a member..."
      />

      {loading && <div className="text-sm text-gray-500 mt-1">Searching...</div>}

      {results.length > 0 && (
        <ul
          className="absolute z-10 mt-1 w-full max-h-40 overflow-y-auto
          bg-white dark:bg-gray-800 
          border border-gray-300 dark:border-gray-600 
          text-black dark:text-white 
          rounded shadow"
        >
          {results.map((user: string) => (
            <li
              key={user}
              onClick={() => handleSelect(user)}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {user}
            </li>
          ))}
        </ul>
      )}

      {selected.length > 0 && (
        <div className="text-sm text-green-600 dark:text-green-400 mt-2">
          ✅ Added members: {selected.map((u) => <strong key={u}>{u} </strong>)}
        </div>
      )}
    </div>
  );
}
