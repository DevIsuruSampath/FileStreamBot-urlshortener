"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { api, setToken } from "../_lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      setToken(res.access_token);
      if (res.must_change_password) {
        router.replace("/force-change");
      } else {
        router.replace("/");
      }
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card" style={{ maxWidth: 520, width: "100%" }}>
      <h1>Admin Login</h1>
      <p className="note">Use your admin credentials to sign in.</p>

      <form onSubmit={onSubmit} style={{ marginTop: 14 }}>
        <div className="form-row">
          <label>Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter admin email" required />
        </div>

        <div className="form-row">
          <label>Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required />
        </div>

        {error ? <p className="error">{error}</p> : null}

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </section>
  );
}
