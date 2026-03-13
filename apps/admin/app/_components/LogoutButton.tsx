"use client";

import { useRouter } from "next/navigation";
import { clearToken } from "../_lib/api";

export default function LogoutButton() {
  const router = useRouter();

  return (
    <button
      className="btn btn-ghost"
      onClick={() => {
        clearToken();
        router.replace("/login");
      }}
      type="button"
    >
      Logout
    </button>
  );
}
