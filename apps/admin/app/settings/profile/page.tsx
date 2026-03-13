"use client";

import { FormEvent, useEffect, useState } from "react";

import { api, setToken } from "../../_lib/api";

export default function ProfileSettingsPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const me = await api.me();
        setEmail(me.email);
        setFullName(me.full_name);
      } catch (e: any) {
        setError(e?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");
    setSaving(true);

    try {
      if (!newPassword.trim()) {
        throw new Error("New password is required");
      }
      const res = await api.changeCredentials({
        current_password: currentPassword,
        new_email: email,
        new_password: newPassword,
        full_name: fullName,
      });
      setToken(res.access_token);
      setCurrentPassword("");
      setNewPassword("");
      setOk("Profile credentials updated.");
    } catch (err: any) {
      setError(err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card" style={{ maxWidth: 700 }}>
      <h1>Profile Settings</h1>
      <p className="note">Update admin email, password, and profile details.</p>

      {loading ? <p className="note">Loading profile…</p> : null}

      <form onSubmit={onSubmit} style={{ marginTop: 14 }}>
        <div className="form-row">
          <label>Full Name</label>
          <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>

        <div className="form-row">
          <label>Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="grid grid-2">
          <div className="form-row">
            <label>Current Password</label>
            <input
              className="input"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <label>New Password</label>
            <input
              className="input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
        </div>

        {error ? <p className="error">{error}</p> : null}
        {ok ? <p className="success">{ok}</p> : null}

        <button className="btn btn-primary" type="submit" disabled={saving || loading}>
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </section>
  );
}
