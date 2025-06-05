"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const addMemberRequest = async (username: string, project_id: string, members: string[]) => {
  const token = Cookies.get("auth-token");
  const res = await fetch(`http://localhost:8080/api/projects/${project_id}`, {
    method: "PUT",
    headers: {
      Authorization: token || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      members: members.concat(username),
    }),
  });

  if (res.status === 200) {
    alert("Member added successfully!");
  } else {
    alert("Failed to add member.");
  }
};

export default function AddMember({ unmodified_project }: { unmodified_project: any }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
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
        const res = await fetch(`http://localhost:8080/api/users/find?username=${encodeURIComponent(search)}`, {
            method: "GET",
            headers: {
                Authorization: token || "",
            },
        });
        const data = await res.json();
        setResults(data || []); // adjust if your API wraps in a `{ users: [] }` object
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchUsers, 300); // debounce input

    return () => clearTimeout(debounce);
  }, [search]);

  const handleSelect = async (user: string) => {
    setSelected(user);
    setSearch("");
    setResults([]);

    addMemberRequest(user, unmodified_project.project_id, unmodified_project.members || []);
    // You could also fire off a POST here to actually "add" the member
  };

  return (
    <div className="flex flex-col gap-1 mt-2 relative w-2/3">
      <h1 className="font-semibold">Add a member</h1>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded px-3 py-2 focus:outline-none"
        placeholder="Search for a member..."
      />

      {loading && <div className="text-sm text-gray-500 mt-1">Searching...</div>}

      {results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full max-h-40 overflow-y-auto
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

      {selected && (
        <div className="text-sm text-green-600 dark:text-green-400 mt-2">
          ✅ <strong>{selected}</strong> selected!
        </div>
      )}
    </div>
  );
}
