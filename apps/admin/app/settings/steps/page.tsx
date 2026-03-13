export default function StepSettingsPage() {
  return (
    <section className="card">
      <h1>Verification Steps</h1>
      <p className="note">Configure Step 1/2/3 and time per step from admin.</p>
      <ul>
        <li>Step count: 1 to 3</li>
        <li>Step 1 time</li>
        <li>Step 2 time</li>
        <li>Step 3 time</li>
      </ul>
      <p className="note">Use API: <code>GET/PUT /v1/settings/verification</code>.</p>
    </section>
  );
}
