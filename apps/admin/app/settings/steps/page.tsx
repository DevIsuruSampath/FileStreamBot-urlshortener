"use client";

import { FormEvent, useEffect, useState } from "react";

import { api, VerificationSettings } from "../../_lib/api";

const INIT: VerificationSettings = {
  step_count: 3,
  step1_seconds: 10,
  step2_seconds: 10,
  step3_seconds: 10,
};

export default function StepSettingsPage() {
  const [form, setForm] = useState<VerificationSettings>(INIT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const current = await api.getVerification();
        setForm(current);
      } catch (e: any) {
        setError(e?.message || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");
    setSaving(true);

    try {
      const payload: VerificationSettings = {
        step_count: Math.max(1, Math.min(3, Number(form.step_count) || 1)),
        step1_seconds: Math.max(1, Number(form.step1_seconds) || 1),
        step2_seconds: Math.max(1, Number(form.step2_seconds) || 1),
        step3_seconds: Math.max(1, Number(form.step3_seconds) || 1),
      };
      const updated = await api.updateVerification(payload);
      setForm(updated);
      setOk("Verification step settings saved.");
    } catch (err: any) {
      setError(err?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card" style={{ maxWidth: 700 }}>
      <h1>Verification Steps</h1>
      <p className="note">Configure Step 1/2/3 and time per step from admin.</p>

      {loading ? <p className="note">Loading settings...</p> : null}

      <form onSubmit={onSubmit} style={{ marginTop: 14 }}>
        <div className="form-row">
          <label>Step Count (1-3)</label>
          <input
            className="input"
            type="number"
            min={1}
            max={3}
            value={form.step_count}
            onChange={(e) => setForm((s) => ({ ...s, step_count: Number(e.target.value) }))}
            required
          />
        </div>

        <div className="grid grid-3">
          <div className="form-row">
            <label>Step 1 Time (sec)</label>
            <input
              className="input"
              type="number"
              min={1}
              value={form.step1_seconds}
              onChange={(e) => setForm((s) => ({ ...s, step1_seconds: Number(e.target.value) }))}
              required
            />
          </div>
          <div className="form-row">
            <label>Step 2 Time (sec)</label>
            <input
              className="input"
              type="number"
              min={1}
              value={form.step2_seconds}
              onChange={(e) => setForm((s) => ({ ...s, step2_seconds: Number(e.target.value) }))}
              required
            />
          </div>
          <div className="form-row">
            <label>Step 3 Time (sec)</label>
            <input
              className="input"
              type="number"
              min={1}
              value={form.step3_seconds}
              onChange={(e) => setForm((s) => ({ ...s, step3_seconds: Number(e.target.value) }))}
              required
            />
          </div>
        </div>

        {error ? <p className="error">{error}</p> : null}
        {ok ? <p className="success">{ok}</p> : null}

        <button className="btn btn-primary" type="submit" disabled={saving || loading}>
          {saving ? "Saving..." : "Save Step Settings"}
        </button>
      </form>
    </section>
  );
}
