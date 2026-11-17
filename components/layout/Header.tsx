"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  // One Calculator link only, to the canonical counter URL
  // (/schengen-calculator/). Home ("/") is reached via the brand link.
  { href: "/schengen-calculator/", label: "Calculator" },
  { href: "/pro/", label: "Pro" },
  { href: "/about/", label: "About" },
  { href: "/contact/", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="brand">
          SchengenCompass
        </Link>
        <nav className="site-nav" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
