import type { Metadata } from "next";
import { COUNTER_FAQ } from "@/data/faq";
import { Counter } from "@/features/counter";
import { EC_CALCULATOR_URL, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Schengen Calculator — 90/180 Day Counter",
  description:
    "Free Schengen 90/180-day calculator. Enter your past trips and a planned entry date to see days used, days remaining, your longest legal stay, and your earliest safe re-entry date.",
  alternates: {
    canonical: `${SITE_URL}/schengen-calculator/`,
  },
  openGraph: {
    url: `${SITE_URL}/schengen-calculator/`,
  },
};

function JsonLd() {
  const webApplication = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SchengenCompass",
    url: `${SITE_URL}/schengen-calculator/`,
    applicationCategory: "TravelApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplication) }}
    />
  );
}

export default function SchengenCalculatorPage() {
  return (
    <>
      <JsonLd />
      <h1>Schengen calculator — 90/180 day counter</h1>
      <p>
        Add your planned entry date and previous Schengen trips from the last
        180 days. The calculator checks every day of your planned stay against
        the rolling 180-day window — not just the entry day.
      </p>
      <Counter />
      <section className="prose" aria-label="How the 90/180 rule works">
        <h2>How the 90/180 rule works</h2>
        <p>
          On any given day, look back exactly 180 days and add up the days
          you were physically present anywhere in the Schengen Area. If the
          total is 90 or fewer, you are within the limit on that date. The
          window is rolling — it never resets on a calendar date.
        </p>
        <h3>What this calculator does</h3>
        <ul>
          <li>
            <strong>Days already used</strong> in the 180-day window ending
            on your entry date, based on the past trips you enter.
          </li>
          <li>
            <strong>Longest stay</strong> from your planned entry date,
            checking every day of the trip against the 90-day limit — not
            just the entry day.
          </li>
          <li>
            <strong>Earliest re-entry date</strong> if you have no days left
            — the first date the rolling window drops below 90, and how many
            days you would have then.
          </li>
          <li>
            <strong>A day-by-day timeline</strong> so you can see which dates
            are used, planned, or free.
          </li>
        </ul>
        <h3>Which countries count</h3>
        <p>
          The 90/180 count treats all 29 Schengen countries as one
          territory: 25 EU member states plus Iceland, Liechtenstein, Norway
          and Switzerland. Bulgaria and Romania became full members on 1
          January 2025. Ireland and Cyprus remain outside Schengen and apply
          their own short-stay rules, so days spent there do not use the
          shared Schengen allowance. Neither do days in the United Kingdom.
        </p>
        <h3>How this works</h3>
        <ol>
          <li>
            Each day in Schengen counts toward a rolling 180-day window.
          </li>
          <li>The legal maximum is 90 days in any 180-day period.</li>
          <li>Use official border guidance for final decisions.</li>
        </ol>
        <p className="disclaimer">
          Planning aid, not legal advice. Border officers make the final
          decision. Verify the rule with the{" "}
          <a
            href={EC_CALCULATOR_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            European Commission&apos;s official Schengen calculator
          </a>{" "}
          before you travel.
        </p>
      </section>
      <section aria-label="Frequently asked questions">
        <h2>Frequently asked questions</h2>
        <div className="faq-list">
          {COUNTER_FAQ.map((entry) => (
            <details key={entry.question}>
              <summary>{entry.question}</summary>
              <p>
                {entry.answer}
                {entry.link ? (
                  <>
                    {" "}
                    <a
                      href={entry.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {entry.link.label}
                    </a>
                  </>
                ) : null}
              </p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
