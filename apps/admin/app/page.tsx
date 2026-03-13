"use client";

import { useEffect, useMemo, useState } from "react";
import { api, AnalyticsOverview } from "./_lib/api";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<AnalyticsOverview | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.analyticsOverview();
        if (!alive) return;
        setData(res);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Failed to load analytics");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const dayMax = useMemo(() => {
    const max = Math.max(...(data?.links_last_7_days.map((x) => x.value) || [0]));
    return max || 1;
  }, [data]);

  const catMax = useMemo(() => {
    const max = Math.max(...(data?.links_by_category.map((x) => x.value) || [0]));
    return max || 1;
  }, [data]);

  return (
    <div className="grid" style={{ gap: 16 }}>
      <h1>Dashboard</h1>
      <p className="note">Only charts and data analysis (no earnings $ widgets).</p>

      {loading ? <section className="card">Loading analytics…</section> : null}
      {error ? <section className="card error">{error}</section> : null}

      {data ? (
        <>
          <section className="grid grid-3">
            <div className="card">
              <div className="kpi">Total Links</div>
              <div className="kpi-value">{data.total_links}</div>
            </div>
            <div className="card">
              <div className="kpi">Total Clicks</div>
              <div className="kpi-value">{data.total_clicks}</div>
            </div>
            <div className="card">
              <div className="kpi">Content Posts</div>
              <div className="kpi-value">{data.total_content_posts}</div>
            </div>
          </section>

          <section className="card">
            <h3>Links Created (Last 7 Days)</h3>
            <div className="chart" style={{ marginTop: 10 }}>
              {data.links_last_7_days.map((d) => (
                <div className="bar-row" key={d.day}>
                  <span className="note">{d.day.slice(5)}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${Math.max(3, Math.round((d.value / dayMax) * 100))}%` }} />
                  </div>
                  <b>{d.value}</b>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <h3>Links by Category</h3>
            <div className="chart" style={{ marginTop: 10 }}>
              {(data.links_by_category.length ? data.links_by_category : [{ category: "No data", value: 0 }]).map((c) => (
                <div className="bar-row" key={c.category}>
                  <span className="note">{c.category}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${Math.max(3, Math.round((c.value / catMax) * 100))}%` }} />
                  </div>
                  <b>{c.value}</b>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
