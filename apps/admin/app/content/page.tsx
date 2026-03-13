export default function ContentPage() {
  return (
    <section className="card">
      <h1>Content (.md)</h1>
      <p className="note">Upload or paste markdown content with categories.</p>
      <p className="note">Use API: <code>POST /v1/content</code>.</p>
    </section>
  );
}
