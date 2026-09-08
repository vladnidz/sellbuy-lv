'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Plus, MessageSquare, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

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
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white">
              S
            </div>
            <span className="text-lg font-bold text-white">
              Sell<span className="text-violet-400">Buy</span>.lv
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/listings">
              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                <Search className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/new-listing">
              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                <Plus className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/messages">
              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                <MessageSquare className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white">
                Ieiet
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white/60 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2 border-t border-white/10 mt-2 px-3">
              <Link href="/new-listing" onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white">
                  <Plus className="h-4 w-4 mr-1" />
                  Pievienot
                </Button>
              </Link>
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button size="sm" variant="outline" className="border-white/20 text-white">
                  Ieiet
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
