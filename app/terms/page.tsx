import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "SchengenCompass terms of use: a planning aid, not legal advice, with no guarantee of entry.",
  alternates: { canonical: "https://schengencompass.com/terms/" },
};

export default function TermsPage() {
  return (
    <article className="prose">
      <h1>Terms of Service</h1>
      <h2>What this site is</h2>
      <p>
        SchengenCompass provides a free calculator that estimates your
        position under the Schengen 90/180-day short-stay rule, plus reference
        information about long-stay and digital nomad visas. It is a planning
        aid, not legal advice.
      </p>
      <h2>No guarantee of entry</h2>
      <p>
        A result from this calculator does not guarantee entry to the Schengen
        Area, and it is not a visa. Border officers make the final decision
        based on all legal and document requirements. Always verify your
        position with official sources — including the European
        Commission&apos;s official Schengen calculator — before you travel.
      </p>
      <h2>Accuracy</h2>
      <p>
        The calculator implements the 90/180-day rule as published: on any
        date, the days present in the preceding 180 days must total 90 or
        fewer. Rules change, and individual circumstances (residence permits,
        long-stay visas, bilateral agreements) can change what counts. If a
        result looks wrong, do not rely on it — check with the relevant
        embassy or border authority.
      </p>
      <h2>Acceptable use</h2>
      <p>
        Use the site for lawful travel planning. Do not attempt to abuse,
        disrupt, or misrepresent the service, and do not rely on it to evade
        immigration rules.
      </p>
      <h2>Availability and liability</h2>
      <p>
        The site is provided free of charge and &quot;as is&quot;, without
        warranties of any kind. We are not liable for travel decisions made
        using it, for refused entry, fines, or any other consequence of an
        overstay.
      </p>
      <p className="disclaimer">
        Last reviewed: 16 November 2026.
      </p>
    </article>
  );
}
