import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <nav aria-label="Footer navigation">
          <Link href="/">Calculator</Link>
          <Link href="/schengen-calculator/">Schengen Calculator</Link>
          <Link href="/pro/">Pro</Link>
          <Link href="/about/">About</Link>
          <Link href="/privacy/">Privacy</Link>
          <Link href="/terms/">Terms</Link>
          <Link href="/contact/">Contact</Link>
        </nav>
        <p>
          SchengenCompass is a planning aid, not legal advice. Border
          officers make the final decision. Your trip dates stay in your
          browser and are never sent to a server.
        </p>
      </div>
    </footer>
  );
}
