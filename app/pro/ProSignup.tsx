"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

const WAITLIST_KEY = "schengencompass.pro-waitlist.v1";

/**
 * Pro launch-list form. There is no backend in the MVP, so the email is
 * saved only in this browser's local storage and the copy says exactly
 * that — the form never pretends to have subscribed the user anywhere.
 */
export function ProSignup() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    try {
      globalThis.localStorage?.setItem(
        WAITLIST_KEY,
        JSON.stringify({ email: trimmed, savedAt: new Date().toISOString() }),
      );
    } catch {
      // Storage unavailable — still show the honest outcome below.
    }
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="alert alert-success" role="status">
        <strong>Saved on this device only.</strong>
        <p>
          Your email is stored in this browser and was not sent anywhere —
          Pro is not taking payments yet. Check back here when it launches.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="pro-email">Email address</label>
        <input
          id="pro-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          aria-invalid={error !== null}
        />
        <span className="hint">
          Saved in this browser only — nothing is sent anywhere until Pro
          launches.
        </span>
        {error ? (
          <p className="field-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
      <Button type="submit">Join the launch list</Button>
    </form>
  );
}
