"use client";

import { FormEvent, useEffect, useState } from "react";

import { api, ShortLinkItem } from "../_lib/api";

const FALLBACK_CATEGORIES = [
  "Movies",
  "TV-Series",
  "Music",
  "Games",
  "Software",
  "Courses",
  "Books",
  "Anime",
  "Sports",
  "Other",
];

export default function UrlsPage() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Other");
  const [categories, setCategories] = useState<string[]>(FALLBACK_CATEGORIES);
  const [links, setLinks] = useState<ShortLinkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function loadList() {
    try {
      const list = await api.listShortLinks(80);
      setLinks(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load links");
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const c = await api.categories();
        if (c?.categories?.length) setCategories(c.categories);
      } catch {}
      await loadList();
    })();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");
    setLoading(true);

    try {
      const res = await api.createShortLink({ original_url: originalUrl, category, title });
      setOk(`Generated: ${res.short_url}`);
      setOriginalUrl("");
      setTitle("");
      await loadList();
    } catch (err: any) {
      setError(err?.message || "Failed to generate URL");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid" style={{ gap: 14 }}>
      <section className="card">
        <h1>Gen URL</h1>
        <p className="note">Create short links with category and destination URL.</p>

        <form onSubmit={onSubmit} style={{ marginTop: 14 }}>
          <div className="form-row">
            <label>Original URL</label>
            <input
              className="input"
              type="url"
              placeholder="https://example.com/your-original-link"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-2">
            <div className="form-row">
              <label>Title (optional)</label>
              <input className="input" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="form-row">
              <label>Category</label>
              <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((c) => (
                  <option value={c} key={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? <p className="error">{error}</p> : null}
          {ok ? <p className="success">{ok}</p> : null}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Generating..." : "Gen URL"}
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Recent Links</h2>
        <div className="table-wrap" style={{ marginTop: 10 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Short</th>
                <th>Original</th>
                <th>Category</th>
                <th>Clicks</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {links.map((l) => (
                <tr key={l.code}>
                  <td>
                    <a href={l.short_url} target="_blank" rel="noreferrer">
                      {l.short_url}
                    </a>
                  </td>
                  <td>{l.original_url}</td>
                  <td>
                    <span className="badge">{l.category}</span>
                  </td>
                  <td>{l.click_count}</td>
                  <td>{new Date(l.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {!links.length ? (
                <tr>
                  <td colSpan={5} className="note">
                    No links yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
