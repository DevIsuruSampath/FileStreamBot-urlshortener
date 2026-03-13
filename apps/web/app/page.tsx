import Link from "next/link";
import { headers } from "next/headers";

const categories = ["Movies", "TV-Series", "Music", "Games", "Software", "Courses", "Books", "Anime", "Sports", "Other"];

type ContentItem = {
  slug: string;
  title: string;
  category: string;
  published: boolean;
  created_at: string;
};

function normalizeHost(host: string): string {
  return (host || "").split(":")[0].trim().toLowerCase();
}

function hostMatches(targetHost: string, currentHost: string): boolean {
  if (!targetHost || !currentHost) return false;
  return currentHost === targetHost || currentHost.endsWith(`.${targetHost}`);
}

async function currentHostFromHeaders(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-host") || "";
  const direct = h.get("host") || "";
  return normalizeHost(forwarded || direct);
}

async function getContentList(category?: string): Promise<ContentItem[]> {
  try {
    const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const qs = new URLSearchParams();
    qs.set("limit", "80");
    if (category) qs.set("category", category);
    const res = await fetch(`${api}/v1/content?${qs.toString()}`, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; mode?: string }>;
}) {
  const { category, mode } = await searchParams;

  const host = await currentHostFromHeaders();
  const contentHost = normalizeHost(process.env.NEXT_PUBLIC_CONTENT_HOST || "adsexample.com");
  const contentMode = mode === "content" || hostMatches(contentHost, host);

  if (contentMode) {
    const active = categories.includes(category || "") ? category : undefined;
    const posts = await getContentList(active);

    return (
      <main className="wrap">
        <section className="card">
          <h1>adsexample.com Content Hub</h1>
          <p className="note">Direct content visitors do not see verify/wait buttons.</p>

          <div style={{ marginTop: 12 }}>
            <Link className="tag" href="/">
              All
            </Link>
            {categories.map((c) => (
              <Link className="tag" href={`/?category=${encodeURIComponent(c)}`} key={c}>
                {c}
              </Link>
            ))}
          </div>

          <div className="list">
            {posts.map((post) => (
              <article className="item" key={post.slug}>
                <h3>
                  <Link href={`/${post.slug}`}>{post.title}</Link>
                </h3>
                <div>
                  <span className="tag">{post.category}</span>
                  <span className="note">{new Date(post.created_at).toLocaleString()}</span>
                </div>
              </article>
            ))}

            {!posts.length ? <p className="note">No posts found.</p> : null}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="wrap">
      <section className="card stack">
        <h1>exa.com URL Shortener</h1>
        <p className="muted">Generate short URLs and route via configurable step flow.</p>
        <p className="muted">Open short links like: <code>exa.com/abc123</code></p>
      </section>
    </main>
  );
}
