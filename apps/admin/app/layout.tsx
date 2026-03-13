import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

import AuthGate from "./_components/AuthGate";
import LogoutButton from "./_components/LogoutButton";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "FileStreamBot URL Shortener Admin"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <aside className="sidebar">
            <div className="brand">Admin Panel</div>
            <nav className="nav">
              <Link href="/">Dashboard</Link>
              <Link href="/urls">Gen URL</Link>
              <Link href="/content">Content (.md)</Link>
              <Link href="/settings/steps">Step Settings</Link>
              <Link href="/settings/profile">Profile</Link>
              <Link href="/login">Login</Link>
            </nav>
            <p className="note" style={{ marginTop: 16 }}>
              Default first login: <b>admin@changeme.com</b> / <b>changeme</b>
            </p>
            <div style={{ marginTop: 12 }}>
              <LogoutButton />
            </div>
          </aside>
          <main className="main">
            <AuthGate>{children}</AuthGate>
          </main>
        </div>
      </body>
    </html>
  );
}
