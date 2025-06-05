'use client'

import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";

const getUser = async () => {
    const token = Cookies.get("auth-token");
    const res = await fetch(`http://localhost:8080/api/users/me`, {
      method: "GET",
      headers: {
        Authorization: token || "",
      },
    });
  
    if (res.status === 200) {
      const data = await res.json();
      return data;
    } else {
    }
  };

export default function UserSectionNavbar() {
    const token = Cookies.get("auth-token");
    const [user, setUser] = useState();

    useEffect(() => {
        const fetchUser = async () => {
            const user = await getUser();
            setUser(user);
        };
        fetchUser();
    }, []);
    
    return (
        <div className="mt-auto p-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
          <div className="text-sm">
            <p className="font-medium text-neutral-900 dark:text-white">
              {
                user && user.Username
              }
            </p>
            <p className="text-neutral-500 dark:text-neutral-400">
              {
                user && user.Email
              }
            </p>
          </div>
          <LogOut
            className="w-5 ml-2 cursor-pointer"
            onClick={() => {
              Cookies.remove("auth-token");
              window.location.reload();
            }}
          />
        </div>
      </div>
    )
}