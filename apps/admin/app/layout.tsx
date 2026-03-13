import "./globals.css";
import type { Metadata } from "next";

import AdminShell from "./_components/AdminShell";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "FileStreamBot URL Shortener Admin"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
