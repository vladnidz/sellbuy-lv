'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SUPPORTED_LOCALES, LOCALE_LABELS, LOCALE_FLAGS, Locale } from '@/app/lib/i18n';
import { useLocale } from '@/app/lib/locale-context';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm text-[#8a8a9a] hover:text-[#e8e8ed] transition-colors"
      >
        <span>{LOCALE_FLAGS[locale]}</span>
        <span className="hidden sm:inline uppercase text-xs font-medium">{locale}</span>
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-[#12121a] border border-[#1e1e2a] rounded-lg py-1 min-w-[160px] shadow-xl shadow-black/20">
            {SUPPORTED_LOCALES.map((loc) => (
              <button
                key={loc}
                onClick={() => { setLocale(loc as Locale); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                  loc === locale
                    ? 'text-[#e8e8ed] bg-[#7c5aed]/10'
                    : 'text-[#8a8a9a] hover:text-[#e8e8ed] hover:bg-[#1a1a25]'
                }`}
              >
                <span>{LOCALE_FLAGS[loc as Locale]}</span>
                <span>{LOCALE_LABELS[loc as Locale]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
