type ResolveResponse = {
  code: string;
  targetUrl: string;
  requiresVerification: boolean;
  stepCount: number;
  stepSeconds: number[];
};

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

export default async function ShortCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const data = await getResolve(code);

  if (!data) {
    return <main className="wrap"><section className="card"><h1>Link not found</h1></section></main>;
  }

  if (!data.requiresVerification) {
    return (
      <main className="wrap">
        <section className="card">
          <h1>Ready</h1>
          <p className="muted">No verify steps needed for this visitor.</p>
          <a className="btn" href={data.targetUrl}>Open destination</a>
        </section>
      </main>
    );
  }

  return (
    <main className="wrap">
      <section className="card">
        <h1>Verification flow</h1>
        <p className="muted">Step count: {data.stepCount}</p>
        <p className="muted">Step timers: {data.stepSeconds.join(", ")} sec</p>
        <p className="muted">Implement client timer UI here (Step 1/2/3 with Continue).</p>
      </section>
    </main>
  );
}
