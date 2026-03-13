"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { api, getToken, setToken } from "../_lib/api";

export default function ForceChangePage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("changeme");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [fullName, setFullName] = useState("Admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) router.replace("/login");
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.changeCredentials({
        current_password: currentPassword,
        new_email: newEmail.trim() || undefined,
        new_password: newPassword,
        full_name: fullName.trim() || undefined,
      });
      setToken(res.access_token);
      router.replace("/");
    } catch (err: any) {
      setError(err?.message || "Failed to change credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card" style={{ maxWidth: 560 }}>
      <h1>First Login: Change Credentials</h1>
      <p className="note">You must change admin email/password before using dashboard.</p>

      <form onSubmit={onSubmit} style={{ marginTop: 14 }}>
        <div className="form-row">
          <label>Current Password</label>
          <input className="input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
        </div>

        <div className="form-row">
          <label>New Email</label>
          <input className="input" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="admin@yourdomain.com" />
        </div>

        <div className="form-row">
          <label>New Password</label>
          <input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} required />
        </div>

        <div className="form-row">
          <label>Full Name</label>
          <input className="input" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>

        {error ? <p className="error">{error}</p> : null}

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save and continue"}
        </button>
      </form>
    </section>
  );
}
