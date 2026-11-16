import type { Metadata } from "next";
import Link from "next/link";
import { COUNTER_FAQ } from "@/data/faq";
import { Counter } from "@/features/counter";

export const metadata: Metadata = {
  // Absolute title: the layout template ("%s — SchengenCompass") is not
  // applied to the index route's string title by Next, so the full title
  // is spelled out here instead of relying on the template.
  title: {
    absolute: "Schengen 90/180 Day Calculator — SchengenCompass",
  },
  description:
    "Free Schengen 90/180-day calculator. Enter your past trips and a planned entry date to see days used, days remaining, your longest legal stay, and your earliest safe re-entry date.",
  alternates: {
    canonical: "https://schengencompass.com/schengen-calculator/",
  },
};

function JsonLd() {
  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: COUNTER_FAQ.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
  const webApplication = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SchengenCompass",
    url: "https://schengencompass.com/schengen-calculator/",
    applicationCategory: "TravelApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplication) }}
      />
    </>
  );
}

function Explainer() {
  return (
    <section className="prose" aria-label="Understanding the 90/180 rule">
      <h2>Understanding the Schengen 90/180-day rule</h2>
      <p>
        Most travellers who do not need a visa for Europe can stay in the{" "}
        <strong>Schengen Area</strong> for up to <strong>90 days within any
        rolling 180-day period</strong>. The rule covers tourism, visiting
        family, business meetings and transit — it does not cover work, study
        or living in a member state, which need a national long-stay visa or
        residence permit.
      </p>
      <p>
        The word that catches people out is <em>rolling</em>. The 180-day
        period is not a calendar half-year and it does not reset on 1 January
        or on the anniversary of your first trip. On any given day you look
        back exactly 180 days and add up the days you were physically present
        anywhere in the Schengen Area. If the total is 90 or fewer, you are
        within the limit on that date. Because older days continuously drop
        out of the window, time genuinely restores itself as it recedes into
        the past — a trip taken 200 days ago no longer affects today&apos;s
        count.
      </p>
      <h3>What this calculator does</h3>
      <ul>
        <li>
          <strong>Days already used</strong> in the 180-day window ending on
          your entry date, based on the past trips you enter.
        </li>
        <li>
          <strong>Longest stay</strong> from your planned entry date, checking
          every day of the trip against the 90-day limit — not just the entry
          day.
        </li>
        <li>
          <strong>Earliest re-entry date</strong> if you have no days left —
          the first date the rolling window drops below 90, and how many days
          you would have then.
        </li>
        <li>
          <strong>A day-by-day timeline</strong> so you can see which dates
          are used, planned, or free.
        </li>
      </ul>
      <p>
        Everything runs in your browser. Your trip dates are saved to local
        storage on your own device for convenience and are never sent to a
        server. You can clear them any time with Reset all.
      </p>
      <h3>Which countries count</h3>
      <p>
        The 90/180 count treats all 29 Schengen countries as one territory:
        25 EU member states plus Iceland, Liechtenstein, Norway and
        Switzerland. Bulgaria and Romania became full members on 1 January
        2025. Ireland and Cyprus remain outside Schengen and apply their own
        short-stay rules, so days spent there do not use the shared Schengen
        allowance. Neither do days in the United Kingdom.
      </p>
      <h3>How this works</h3>
      <ol>
        <li>Each day in Schengen counts toward a rolling 180-day window.</li>
        <li>The legal maximum is 90 days in any 180-day period.</li>
        <li>Use official border guidance for final decisions.</li>
      </ol>
      <p className="disclaimer">
        Planning aid, not legal advice. Border officers make the final
        decision. Verify the rule with the European Commission&apos;s official
        Schengen calculator before you travel.
      </p>
    </section>
  );
}

function Faq() {
  return (
    <section aria-label="Frequently asked questions">
      <h2>Frequently asked questions</h2>
      <div className="faq-list">
        {COUNTER_FAQ.map((entry) => (
          <details key={entry.question}>
            <summary>{entry.question}</summary>
            <p>{entry.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <JsonLd />
      <h1>Schengen 90/180-day calculator</h1>
      <p>
        Add your planned entry date and previous Schengen trips from the last
        180 days.
      </p>
      <Counter />
      <Explainer />
      <Faq />
      <section className="card" aria-label="SchengenCompass Pro">
        <h2>Need more than 3 trips?</h2>
        <p>
          The free counter saves up to 3 trips. Pro adds unlimited trips, PDF
          reports, overstay email alerts, multi-passport support and re-entry
          planning — for $49–$60 per year when it launches.{" "}
          <Link href="/pro/">See Pro</Link>
        </p>
      </section>
    </>
  );
}
