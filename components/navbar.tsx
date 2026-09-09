'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Plus, MessageSquare, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Sākums' },
  { href: '/listings', label: 'Sludinājumi' },
  { href: '/categories', label: 'Kategorijas' },
  { href: '/about', label: 'Par mums' },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-[#1f1f2e] bg-[#0a0a0f]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7c3aed] text-sm font-bold text-white">
              S
            </div>
            <span className="text-lg font-semibold text-[#f0f0f5] tracking-tight">
              Sell<span className="text-[#a78bfa]">Buy</span>.lv
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                  pathname === link.href
                    ? 'text-[#f0f0f5] bg-[#1a1a25]'
                    : 'text-[#8888a0] hover:text-[#f0f0f5] hover:bg-[#12121a]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/listings"
              className="p-2 rounded-lg text-[#8888a0] hover:text-[#f0f0f5] hover:bg-[#12121a] transition-colors"
            >
              <Search className="h-5 w-5" />
            </Link>
            <Link
              href="/new-listing"
              className="p-2 rounded-lg text-[#8888a0] hover:text-[#f0f0f5] hover:bg-[#12121a] transition-colors"
            >
              <Plus className="h-5 w-5" />
            </Link>
            <Link
              href="/messages"
              className="p-2 rounded-lg text-[#8888a0] hover:text-[#f0f0f5] hover:bg-[#12121a] transition-colors"
            >
              <MessageSquare className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="ml-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors duration-150"
            >
              Ieiet
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-[#8888a0] hover:text-[#f0f0f5] hover:bg-[#12121a] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#1f1f2e] py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-[#f0f0f5] bg-[#1a1a25]'
                    : 'text-[#8888a0] hover:text-[#f0f0f5] hover:bg-[#12121a]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-3 border-t border-[#1f1f2e] mt-3 px-3">
              <Link
                href="/new-listing"
                onClick={() => setMobileOpen(false)}
                className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
              >
                <Plus className="h-4 w-4 inline mr-1" />
                Pievienot
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="border border-[#2a2a3a] text-[#f0f0f5] text-sm font-medium rounded-lg px-4 py-2 hover:bg-[#12121a] transition-colors"
              >
                Ieiet
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
