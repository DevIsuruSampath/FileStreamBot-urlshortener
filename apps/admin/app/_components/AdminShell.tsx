"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import AuthGate from "./AuthGate";
import LogoutButton from "./LogoutButton";

const AUTH_PAGES = new Set(["/login", "/force-change"]);

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const authOnly = AUTH_PAGES.has(pathname);

  if (authOnly) {
    return (
      <div className="auth-shell">
        <main className="auth-main">
          <AuthGate>{children}</AuthGate>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Admin Panel</div>
        <nav className="nav">
          <Link href="/">Dashboard</Link>
          <Link href="/urls">Gen URL</Link>
          <Link href="/content">Content (.md)</Link>
          <Link href="/settings/steps">Step Settings</Link>
          <Link href="/settings/profile">Profile</Link>
        </nav>
        <div style={{ marginTop: 12 }}>
          <LogoutButton />
        </div>
      </aside>
      <main className="main">
        <AuthGate>{children}</AuthGate>
      </main>
    </div>
  );
}
