import type { DayStatus } from "@/lib/schengen/types";

interface TimelineProps {
  timeline: DayStatus[];
}

function monthLabel(yearMonth: string): string {
  const date = new Date(`${yearMonth}-01T00:00:00Z`);
  return date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

const STATUS_LABEL: Record<DayStatus["status"], string> = {
  used: "Used",
  planned: "Planned",
  free: "Free",
};

/**
 * The calculation made visible: every date in the 180-day window ending on
 * the planned exit, grouped by month. Status is shown by colour AND by a
 * text label (title/aria-label and the legend), so it never depends on
 * colour alone.
 */
export function Timeline({ timeline }: TimelineProps) {
  if (timeline.length === 0) return null;

  const months = new Map<string, DayStatus[]>();
  for (const day of timeline) {
    const key = day.date.slice(0, 7);
    const list = months.get(key) ?? [];
    list.push(day);
    months.set(key, list);
  }

  return (
    <section className="card counter-timeline" aria-label="Day-by-day timeline">
      <h2>Day by day</h2>
      <ul className="legend" aria-label="Legend">
        <li>
          <span className="swatch swatch-used" aria-hidden="true" /> Used — a
          day you were in Schengen
        </li>
        <li>
          <span className="swatch swatch-planned" aria-hidden="true" />{" "}
          Planned — a day of your planned stay
        </li>
        <li>
          <span className="swatch swatch-free" aria-hidden="true" /> Free — a
          day still available
        </li>
      </ul>
      {[...months.entries()].map(([yearMonth, days]) => (
        <div key={yearMonth} className="timeline-month">
          <h3>{monthLabel(yearMonth)}</h3>
          <ul className="timeline-grid tnum">
            {days.map((day) => (
              <li
                key={day.date}
                className={`day-cell day-${day.status}`}
                title={`${day.date} — ${STATUS_LABEL[day.status]}`}
                aria-label={`${day.date}: ${STATUS_LABEL[day.status]}`}
              >
                {Number(day.date.slice(8, 10))}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
