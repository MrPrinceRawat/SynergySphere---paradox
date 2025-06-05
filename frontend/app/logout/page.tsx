"use client"

import { useEffect } from "react";
import Cookies from "js-cookie";

export default function LogoutPage() {

    useEffect(() => {
        Cookies.remove("auth-token");
        window.location.reload();
    }, []);

  return (
    <div> …</div>
    )
}