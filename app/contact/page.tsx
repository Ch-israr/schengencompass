import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact SchengenCompass. Our business email address will be listed here soon.",
  alternates: { canonical: `${SITE_URL}/contact/` },
  openGraph: { url: `${SITE_URL}/contact/` },
};

export default function ContactPage() {
  return (
    <article className="prose">
      <h1>Contact</h1>
      <p>
        Our business email address will be listed here soon.
      </p>
      <p>
        In the meantime, if you find a mistake in a calculation or a visa
        fact, the most useful thing you can send is the exact dates involved
        and the official source that disagrees — that is how the site gets
        more accurate.
      </p>
    </article>
  );
}
