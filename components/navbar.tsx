'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { useLocale } from '@/app/lib/locale-context';

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLocale();

  const navLinks = [
    { href: '/listings', label: t('nav.sludinājumi') },
    { href: '/categories', label: t('nav.kategorijas') },
    { href: '/about', label: t('nav.par_mums') },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ backgroundColor: 'var(--nav-bg)', borderColor: 'var(--border)' }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-lg font-bold bg-gradient-to-r from-[#7c5aed] to-[#a78bfa] bg-clip-text text-transparent">
              SellBuy.lv
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm transition-colors relative"
                  style={{ color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                >
                  {link.label}
                  {active && (
                    <span className="absolute -bottom-[17px] left-0 right-0 h-[2px] rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link href="/new-listing" className="flex items-center gap-1.5 text-sm transition-colors px-2 py-1.5" style={{ color: 'var(--text-secondary)' }}>
              <Plus className="h-4 w-4" /> {t('nav.ievietot')}
            </Link>
            <Link href="/login" className="text-sm transition-colors px-2 py-1.5" style={{ color: 'var(--text-secondary)' }}>
              {t('nav.ieiet')}
            </Link>
            <Link href="/register" className="text-sm text-white px-3.5 py-1.5 rounded-lg transition-colors" style={{ backgroundColor: 'var(--accent)' }}>
              {t('nav.registrēties')}
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 transition-colors" style={{ color: 'var(--text-secondary)' }} aria-label="Menu">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t py-3 space-y-1" style={{ borderColor: 'var(--border)' }}>
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm rounded-lg transition-colors"
                  style={{ color: active ? 'var(--text-primary)' : 'var(--text-secondary)', backgroundColor: active ? 'var(--bg-elevated)' : 'transparent' }}>
                  {link.label}
                </Link>
              );
            })}
            <div className="border-t pt-3 mt-3 space-y-1" style={{ borderColor: 'var(--border)' }}>
              <Link href="/new-listing" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg" style={{ color: 'var(--text-secondary)' }}>
                <Plus className="h-4 w-4" /> {t('nav.ievietot')}
              </Link>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm rounded-lg" style={{ color: 'var(--text-secondary)' }}>{t('nav.ieiet')}</Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-white rounded-lg text-center" style={{ backgroundColor: 'var(--accent)' }}>{t('nav.registrēties')}</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
