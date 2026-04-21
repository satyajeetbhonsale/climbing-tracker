"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/log", label: "Log Climb" },
  { href: "/calendar", label: "Calendar" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-3xl px-4">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="text-sm font-semibold tracking-tight text-gray-900">
            Climbing Tracker
          </Link>
          <div className="flex gap-1">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  pathname === href
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
