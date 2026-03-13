const categories = ["Movies","TV-Series","Music","Games","Software","Courses","Books","Anime","Sports","Other"];

export default function ContentHome() {
  return (
    <main className="wrap">
      <section className="card">
        <h1>adsexample.com Content Hub</h1>
        <p>Direct content visitors should not see verify buttons/wait timers.</p>
        <div style={{ marginTop: 12 }}>
          {categories.map((c) => <span className="tag" key={c}>{c}</span>)}
        </div>
      </section>
    </main>
  );
}
