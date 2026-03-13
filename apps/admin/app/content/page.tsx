"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import { api, ContentItem } from "../_lib/api";

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

export default function ContentPage() {
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Other");
  const [categories, setCategories] = useState<string[]>(FALLBACK_CATEGORIES);
  const [markdown, setMarkdown] = useState("");
  const [published, setPublished] = useState(true);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function loadItems() {
    try {
      const list = await api.listAdminContent(120);
      setItems(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load content list");
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const c = await api.categories();
        if (c?.categories?.length) setCategories(c.categories);
      } catch {}
      await loadItems();
    })();
  }, []);

  async function onMarkdownFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setMarkdown(text);
    if (!title) {
      setTitle(file.name.replace(/\.md$/i, ""));
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");
    setLoading(true);

    try {
      const s = slug.trim().toLowerCase();
      await api.createContent({
        slug: s,
        title,
        category,
        markdown,
        published,
      });
      setOk(`Saved content: ${s}`);
      setSlug("");
      setTitle("");
      setMarkdown("");
      setPublished(true);
      await loadItems();
    } catch (err: any) {
      setError(err?.message || "Failed to save content");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid" style={{ gap: 14 }}>
      <section className="card">
        <h1>Content (.md)</h1>
        <p className="note">Create category blog/content posts from markdown.</p>

        <form onSubmit={onSubmit} style={{ marginTop: 14 }}>
          <div className="grid grid-2">
            <div className="form-row">
              <label>Slug</label>
              <input
                className="input"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="example-post"
                required
              />
            </div>
            <div className="form-row">
              <label>Title</label>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-2">
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
            <div className="form-row">
              <label>Upload .md</label>
              <input className="input" type="file" accept=".md,text/markdown,text/plain" onChange={onMarkdownFile} />
            </div>
          </div>

          <div className="form-row">
            <label>Markdown</label>
            <textarea className="textarea" value={markdown} onChange={(e) => setMarkdown(e.target.value)} required />
          </div>

          <div className="form-row">
            <label>
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Published
            </label>
          </div>

          {error ? <p className="error">{error}</p> : null}
          {ok ? <p className="success">{ok}</p> : null}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Content"}
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Content List</h2>
        <div className="table-wrap" style={{ marginTop: 10 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Slug</th>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map((x) => (
                <tr key={x.slug}>
                  <td>{x.slug}</td>
                  <td>{x.title}</td>
                  <td>
                    <span className="badge">{x.category}</span>
                  </td>
                  <td>{x.published ? "Published" : "Draft"}</td>
                  <td>{new Date(x.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {!items.length ? (
                <tr>
                  <td colSpan={5} className="note">
                    No content posts yet.
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
