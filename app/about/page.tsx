'use client';

import Link from 'next/link';
import { ArrowLeft, ShieldCheck, BadgeCheck, Truck } from 'lucide-react';
import { useLocale } from '@/app/lib/locale-context';

export default function AboutPage() {
  const { t } = useLocale();

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-8 transition-colors" style={{ color: 'var(--text-tertiary)' }}>
        <ArrowLeft className="h-3.5 w-3.5" /> {t('common.return_home')}
      </Link>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>Par SellBuy.lv</h1>
      <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
        Moderns, drošs un ātrs sludinājumu portāls, kas maina to, kā latvieši pērk un pārdod internetā.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <ShieldCheck className="h-6 w-6 mb-3" style={{ color: 'var(--accent)' }} />
          <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Escrow aizsardzība</h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>Nauda tiek atbrīvota tikai pēc preces saņemšanas.</p>
        </div>
        <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <BadgeCheck className="h-6 w-6 mb-3" style={{ color: 'var(--accent)' }} />
          <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Smart-ID verifikācija</h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>Visi pārdevēji ir verificēti ar Smart-ID.</p>
        </div>
        <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <Truck className="h-6 w-6 mb-3" style={{ color: 'var(--accent)' }} />
          <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Omniva/DPD piegāde</h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>Ātra piegāde visā Latvijā.</p>
        </div>
      </div>
    </div>
  );
}
