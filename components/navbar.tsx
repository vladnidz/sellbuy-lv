'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';

const navLinks = [
  { href: '/listings', label: 'Sludinājumi' },
  { href: '/categories', label: 'Kategorijas' },
  { href: '/about', label: 'Par mums' },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-[#1e1e2a]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-lg font-bold bg-gradient-to-r from-[#7c5aed] to-[#a78bfa] bg-clip-text text-transparent">
              SellBuy.lv
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-colors relative ${
                    active
                      ? 'text-[#e8e8ed] font-medium'
                      : 'text-[#8a8a9a] hover:text-[#e8e8ed]'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-[#7c5aed] rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link
              href="/new-listing"
              className="flex items-center gap-1.5 text-sm text-[#8a8a9a] hover:text-[#e8e8ed] transition-colors px-2 py-1.5"
            >
              <Plus className="h-4 w-4" />
              Ievietot
            </Link>
            <Link
              href="/login"
              className="text-sm text-[#8a8a9a] hover:text-[#e8e8ed] transition-colors px-2 py-1.5"
            >
              Ieiet
            </Link>
            <Link
              href="/register"
              className="text-sm bg-[#7c5aed] hover:bg-[#6a4bd4] text-white px-3.5 py-1.5 rounded-lg transition-colors"
            >
              Reģistrēties
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-[#8a8a9a] hover:text-[#e8e8ed] transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#1e1e2a] py-3 space-y-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                    active
                      ? 'text-[#e8e8ed] bg-[#15151f]'
                      : 'text-[#8a8a9a] hover:text-[#e8e8ed] hover:bg-[#15151f]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="border-t border-[#1e1e2a] pt-3 mt-3 space-y-1">
              <Link href="/new-listing" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-[#8a8a9a] hover:text-[#e8e8ed] rounded-lg">
                <Plus className="h-4 w-4" /> Ievietot
              </Link>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-[#8a8a9a] hover:text-[#e8e8ed] rounded-lg">Ieiet</Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm bg-[#7c5aed] text-white rounded-lg text-center">Reģistrēties</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
