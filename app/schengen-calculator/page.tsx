import type { Metadata } from "next";
import { COUNTER_FAQ } from "@/data/faq";
import { Counter } from "@/features/counter";

export const metadata: Metadata = {
  title: "Schengen Calculator — 90/180 Day Counter",
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
        <p>
          The 90/180 count treats all 29 Schengen countries as one territory:
          25 EU member states plus Iceland, Liechtenstein, Norway and
          Switzerland. Ireland and Cyprus remain outside Schengen, as does the
          United Kingdom.
        </p>
        <p className="disclaimer">
          Planning aid, not legal advice. Border officers make the final
          decision. Verify the rule with the European Commission&apos;s
          official Schengen calculator before you travel.
        </p>
      </section>
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
    </>
  );
}
