import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { ProSignup } from "./ProSignup";

export const metadata: Metadata = {
  title: "Pro — Unlimited Trips, PDF Reports, Overstay Alerts",
  description:
    "SchengenCompass Pro: unlimited saved trips, PDF reports, overstay email alerts, multi-passport support and re-entry planning. $49–$60 per year when it launches.",
  alternates: { canonical: `${SITE_URL}/pro/` },
  openGraph: { url: `${SITE_URL}/pro/` },
};

export default function ProPage() {
  return (
    <article className="prose">
      <h1>SchengenCompass Pro</h1>
      <p>
        The free counter saves up to 3 trips and answers the essential
        question: how many days do I have left? Pro is for people who live
        the 90/180 rule — frequent travellers, nomads, and anyone planning
        months ahead.
      </p>
      <h2>What Pro adds</h2>
      <ul>
        <li>Unlimited saved trips</li>
        <li>PDF reports of your stay history</li>
        <li>Overstay email alerts before a planned trip becomes illegal</li>
        <li>Multi-passport support</li>
        <li>Re-entry planning across multiple future trips</li>
      </ul>
      <h2>Price</h2>
      <p>
        Pro will cost $49–$60 per year when it launches. Pro is not taking
        payments yet — there is no account to create and no card to enter.
      </p>
      <h2>Join the launch list</h2>
      <ProSignup />
      <p className="disclaimer">
        Planning aid, not legal advice. Border officers make the final
        decision.
      </p>
    </article>
  );
}
