"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { api, clearToken, getToken, MeResponse } from "../_lib/api";

const PUBLIC_PATHS = new Set(["/login"]);

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [ready, setReady] = useState(false);
  const [me, setMe] = useState<MeResponse | null>(null);

  useEffect(() => {
    let alive = true;

    async function run() {
      if (PUBLIC_PATHS.has(pathname)) {
        if (alive) setReady(true);
        return;
      }

      const token = getToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const info = await api.me();
        if (!alive) return;
        setMe(info);

        if (info.must_change_password && pathname !== "/force-change") {
          router.replace("/force-change");
          return;
        }

        if (!info.must_change_password && pathname === "/force-change") {
          router.replace("/");
          return;
        }

        setReady(true);
      } catch {
        clearToken();
        router.replace("/login");
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [pathname, router]);

  if (!ready) {
    return <div className="card">Checking session...</div>;
  }

  return (
    <>
      {me ? (
        <div className="note" style={{ marginBottom: 12 }}>
          Signed in as <b>{me.full_name}</b> ({me.email})
        </div>
      ) : null}
      {children}
    </>
  );
}
