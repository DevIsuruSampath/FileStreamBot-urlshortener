import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

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
            </nav>
            <p className="note" style={{ marginTop: 16 }}>
              First login: <b>admin@changeme.com</b> / <b>changeme</b>
            </p>
          </aside>
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
