import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "SchengenCompass privacy policy: your trip dates stay in your browser and are never sent to a server.",
  alternates: { canonical: `${SITE_URL}/privacy/` },
  openGraph: { url: `${SITE_URL}/privacy/` },
};

export default function PrivacyPage() {
  return (
    <article className="prose">
      <h1>Privacy Policy</h1>
      <p>
        SchengenCompass is a planning aid for the Schengen 90/180-day rule.
        This page explains what data the site handles — which is very little.
      </p>
      <h2>Your trip dates stay in your browser</h2>
      <p>
        The counter runs entirely in your browser. The trips you enter are
        saved to local storage on your own device so they are still there when
        you come back. They are never sent to a server, never shared with
        anyone, and never sold. You can clear them any time with Reset all on
        the calculator page, or by clearing your browser&apos;s site data.
      </p>
      <h2>Accounts</h2>
      <p>
        There are no accounts. The site does not ask for your name, email, or
        passport details to use the calculator.
      </p>
      <h2>Pro launch list</h2>
      <p>
        If you leave an email on the Pro page, it is stored only in your own
        browser until Pro launches. It is not sent anywhere. When Pro launches,
        this page will explain how the list works before anything is collected.
      </p>
      <h2>Analytics and cookies</h2>
      <p>
        The site does not run an analytics SDK or advertising cookies at
        launch. The hosting provider may keep standard server logs (such as
        the pages requested and the time of the request) as part of operating
        the service. Those logs do not contain your trip dates, which never
        leave your browser.
      </p>
      <h2>Changes</h2>
      <p>
        If this policy changes — for example, if accounts or analytics are
        added — this page will be updated before the change takes effect, and
        the change will be described here in plain language.
      </p>
      <p className="disclaimer">
        Last reviewed: 16 November 2026.
      </p>
    </article>
  );
}
