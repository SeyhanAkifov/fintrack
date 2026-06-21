"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { UserMenu } from "./UserMenu";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
  { href: "/budgets", label: "Budgets" },
  { href: "/recurring", label: "Recurring" },
  { href: "/categories", label: "Categories" },
];

export function NavBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const linkClass = (href: string) =>
    cn(
      "text-sm font-medium px-3 py-1.5 rounded-lg transition-all",
      pathname === href
        ? "text-indigo-600 bg-indigo-50"
        : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
    );

  return (
    <nav className="sticky top-0 z-40 border-b border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 font-bold text-lg shrink-0"
          onClick={() => setOpen(false)}
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
            </svg>
          </span>
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            FinTrack
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(l.href)}>
              {l.label}
            </Link>
          ))}
          <div className="ml-2 pl-2 border-l border-gray-200">
            <UserMenu />
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="md:hidden p-2 -mr-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden border-t border-white/60 bg-white/90 backdrop-blur-xl px-4 py-3 flex flex-col gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={linkClass(l.href)}
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-2 pt-2 border-t border-gray-200">
            <UserMenu />
          </div>
        </div>
      )}
    </nav>
  );
}
