export default function DashboardPage() {
  return (
    <div className="grid" style={{ gap: 16 }}>
      <h1>Dashboard</h1>
      <p className="note">Only charts and data analysis (no earnings $ widgets).</p>

      <section className="grid grid-3">
        <div className="card"><div className="kpi">Total Links</div><div className="kpi-value">0</div></div>
        <div className="card"><div className="kpi">Clicks Today</div><div className="kpi-value">0</div></div>
        <div className="card"><div className="kpi">Content Posts</div><div className="kpi-value">0</div></div>
      </section>

      <section className="card">
        <h3>Traffic Trend</h3>
        <p className="note">Connect API analytics endpoints to render chart data.</p>
      </section>
    </div>
  );
}
