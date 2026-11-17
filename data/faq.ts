/**
 * FAQ content for the counter pages. Every answer states only facts that
 * are visible on the page or verified in the 2026-11-16 research:
 * - 29 Schengen states; Ireland, Cyprus and the UK outside.
 * - EES operational since 10 Apr 2026; ETIAS not live, no start date.
 * - Trips never leave the browser.
 * An entry may carry one outbound `link`, rendered after the answer text.
 */
import { EC_CALCULATOR_URL } from "@/lib/site";

export interface FaqEntry {
  question: string;
  answer: string;
  /** Optional outbound link, rendered after the answer (new tab). */
  link?: { href: string; label: string };
}

export const COUNTER_FAQ: FaqEntry[] = [
  {
    question: "Does this tool guarantee entry to the Schengen Area?",
    answer:
      "No. Border officers make the final decision based on all legal and document requirements. The calculator only estimates your position under the 90/180-day rule.",
  },
  {
    question: "How does the 90/180-day rule work?",
    answer:
      "On any given day, look back exactly 180 days and add up the days you were physically present anywhere in the Schengen Area. If the total is 90 or fewer, you are within the limit on that date. The 180-day period is rolling — it does not reset on 1 January or on the anniversary of your first trip. Because older days continuously drop out of the window, time genuinely restores itself as days recede.",
  },
  {
    question: "Should I include day trips in my past trips?",
    answer:
      "Yes. Any calendar day you spent inside the Schengen Area — including short day trips across a border — counts as a full day toward the 90-day limit. Entry and exit days count too.",
  },
  {
    question: "Which countries count toward the 90 days?",
    answer:
      "The 90/180 count treats all 29 Schengen countries as one territory: 25 EU member states plus Iceland, Liechtenstein, Norway and Switzerland. Bulgaria and Romania became full members on 1 January 2025. Ireland and Cyprus remain outside Schengen and apply their own short-stay rules, so days spent there do not use the shared Schengen allowance. Neither do days in the United Kingdom.",
  },
  {
    question: "Where can I verify the 90/180 rule?",
    answer:
      "The European Commission publishes the official Schengen short-stay rules and an official visa calculator. Use them for final decisions — this site is a planning aid, not legal advice.",
    link: {
      href: EC_CALCULATOR_URL,
      label: "European Commission's official Schengen calculator",
    },
  },
  {
    question: "Are my trip dates sent to a server?",
    answer:
      "No. Everything runs in your browser. Your trip dates are saved to local storage on your own device for convenience and are never sent to a server. You can clear them any time with Reset all.",
  },
  {
    question: "What about EES and ETIAS?",
    answer:
      "The Entry/Exit System (EES) is operational since 10 April 2026 and records your crossings automatically. ETIAS is not open: there is nothing to apply for and nothing to pay. Neither changes the 90/180-day rule itself.",
  },
];
