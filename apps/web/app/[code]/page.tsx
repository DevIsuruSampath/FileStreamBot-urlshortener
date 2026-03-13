import Link from "next/link";
import { headers } from "next/headers";
import { marked } from "marked";

import VerifyFlowClient from "./VerifyFlowClient";

type ResolveResponse = {
  code: string;
  targetUrl: string;
  requiresVerification: boolean;
  stepCount: number;
  stepSeconds: number[];
};

type ContentOut = {
  slug: string;
  title: string;
  category: string;
  markdown: string;
};

function normalizeHost(host: string): string {
  return (host || "").split(":")[0].trim().toLowerCase();
}

function hostMatches(targetHost: string, currentHost: string): boolean {
  if (!targetHost || !currentHost) return false;
  return currentHost === targetHost || currentHost.endsWith(`.${targetHost}`);
}

function currentHostFromHeaders(): string {
  const h = headers();
  const forwarded = h.get("x-forwarded-host") || "";
  const direct = h.get("host") || "";
  return normalizeHost(forwarded || direct);
}

async function getResolve(code: string): Promise<ResolveResponse | null> {
  try {
    const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${api}/v1/resolve/${code}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getPost(slug: string): Promise<ContentOut | null> {
  try {
    const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${api}/v1/content/${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function ShortCodePage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { code } = await params;
  const { mode } = await searchParams;

  const host = currentHostFromHeaders();
  const contentHost = normalizeHost(process.env.NEXT_PUBLIC_CONTENT_HOST || "adsexample.com");
  const contentMode = mode === "content" || hostMatches(contentHost, host);

  if (contentMode) {
    const post = await getPost(code);

    if (!post) {
      return (
        <main className="wrap">
          <section className="card">
            <h1>Post not found</h1>
            <Link href="/">Back to content hub</Link>
          </section>
        </main>
      );
    }

    const html = marked.parse(post.markdown) as string;

    return (
      <main className="wrap">
        <section className="card">
          <p>
            <Link href="/">← Back</Link>
          </p>
          <h1>{post.title}</h1>
          <span className="tag">{post.category}</span>
          <article className="md" dangerouslySetInnerHTML={{ __html: html }} />
        </section>
      </main>
    );
  }

  const data = await getResolve(code);

  if (!data) {
    return (
      <main className="wrap">
        <section className="card">
          <h1>Link not found</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="wrap">
      <VerifyFlowClient data={data} />
    </main>
  );
}
