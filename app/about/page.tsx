import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "About SchengenCompass: a free, correct Schengen 90/180-day calculator.",
  alternates: { canonical: `${SITE_URL}/about/` },
  openGraph: { url: `${SITE_URL}/about/` },
};

export default function AboutPage() {
  return (
    <article className="prose">
      <h1>About SchengenCompass</h1>
      <p>
        SchengenCompass is a small independent project. It started from a
        simple frustration: the 90/180-day rule is easy to state and easy to
        get wrong, and the official calculator answers one question at a time
        without remembering your trips.
      </p>
      <h2>What it does</h2>
      <p>
        The counter checks your trips day by day against the rolling 180-day
        window and shows you three things: how many days you have used, how
        many you have left, and the earliest date you can safely re-enter. The
        visa directory (coming after launch) lists digital nomad and long-stay
        routes by country, each with its income threshold shown as a formula,
        an official source, and a visible review date.
      </p>
      <h2>What it is not</h2>
      <p>
        It is not legal advice, not a visa service, and not an immigration
        consultancy. It does not apply for anything on your behalf, and it
        cannot guarantee entry anywhere. Border officers make the final
        decision.
      </p>
      <h2>How it works</h2>
      <p>
        Everything runs in your browser. Your trip dates are stored on your
        own device and never sent to a server. There is no account to create
        and nothing to install.
      </p>
      <p className="disclaimer">
        Last reviewed: 16 November 2026.
      </p>
    </article>
  );
}
