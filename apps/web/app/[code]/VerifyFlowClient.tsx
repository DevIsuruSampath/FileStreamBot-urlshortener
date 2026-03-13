"use client";

import { useEffect, useMemo, useState } from "react";

type ResolveResponse = {
  code: string;
  targetUrl: string;
  requiresVerification: boolean;
  stepCount: number;
  stepSeconds: number[];
};

function sanitizeStepCount(n: number): number {
  const x = Number(n) || 1;
  return Math.max(1, Math.min(3, x));
}

export default function VerifyFlowClient({ data }: { data: ResolveResponse }) {
  const stepCount = sanitizeStepCount(data.stepCount);
  const stepSeconds = useMemo(() => {
    const base = [10, 10, 10];
    return [0, 1, 2].map((i) => {
      const raw = Number(data.stepSeconds?.[i] ?? base[i]);
      return Math.max(1, raw || base[i]);
    });
  }, [data.stepSeconds]);

  const [step, setStep] = useState(1);
  const [remaining, setRemaining] = useState(stepSeconds[0]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRemaining(stepSeconds[step - 1]);
    setReady(false);
  }, [step, stepSeconds]);

  useEffect(() => {
    if (ready) return;
    if (remaining <= 0) {
      setReady(true);
      return;
    }

    const id = window.setTimeout(() => setRemaining((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [remaining, ready]);

  if (!data.requiresVerification) {
    return (
      <section className="card">
        <h1>Ready</h1>
        <p className="muted">Direct visitor detected. No verify steps needed.</p>
        <a className="btn" href={data.targetUrl}>
          Open destination
        </a>
      </section>
    );
  }

  const finalStepReached = step >= stepCount;

  return (
    <section className="card">
      <h1>Step {step} of {stepCount}</h1>
      <p className="muted">Please wait {remaining > 0 ? remaining : 0} seconds...</p>

      {!ready ? (
        <p className="muted">Verification button is hidden until timer ends.</p>
      ) : null}

      {ready ? (
        <>
          {!finalStepReached ? (
            <button className="btn" type="button" onClick={() => setStep((s) => Math.min(stepCount, s + 1))}>
              Verify and Continue to Step {step + 1}
            </button>
          ) : (
            <a className="btn" href={data.targetUrl}>
              Continue to destination
            </a>
          )}
        </>
      ) : null}

      <div style={{ marginTop: 16 }}>
        <p className="muted">Configured times:</p>
        <ul className="muted">
          <li>Step 1: {stepSeconds[0]}s</li>
          <li>Step 2: {stepSeconds[1]}s</li>
          <li>Step 3: {stepSeconds[2]}s</li>
        </ul>
      </div>
    </section>
  );
}
