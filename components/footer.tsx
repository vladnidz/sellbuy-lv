import Link from 'next/link';
import { ShieldCheck, Truck, BadgeCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border)' }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <span className="text-lg font-bold bg-gradient-to-r from-[#7c5aed] to-[#a78bfa] bg-clip-text text-transparent">
              SellBuy.lv
            </span>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
              Drošs veids, kā pirkt un pārdot Latvijā.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Navigācija</h3>
            <div className="space-y-2">
              <Link href="/listings" className="block text-sm transition-colors" style={{ color: 'var(--text-tertiary)' }}>Sludinājumi</Link>
              <Link href="/categories" className="block text-sm transition-colors" style={{ color: 'var(--text-tertiary)' }}>Kategorijas</Link>
              <Link href="/new-listing" className="block text-sm transition-colors" style={{ color: 'var(--text-tertiary)' }}>Ievietot</Link>
              <Link href="/about" className="block text-sm transition-colors" style={{ color: 'var(--text-tertiary)' }}>Par mums</Link>
            </div>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Konts</h3>
            <div className="space-y-2">
              <Link href="/login" className="block text-sm transition-colors" style={{ color: 'var(--text-tertiary)' }}>Ieiet</Link>
              <Link href="/register" className="block text-sm transition-colors" style={{ color: 'var(--text-tertiary)' }}>Reģistrēties</Link>
              <Link href="/messages" className="block text-sm transition-colors" style={{ color: 'var(--text-tertiary)' }}>Ziņojumi</Link>
            </div>
          </div>

          {/* Trust */}
          <div>
            <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Drošība</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: 'var(--accent)' }} />
                <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Escrow aizsardzība</span>
              </div>
              <div className="flex items-center gap-2.5">
                <BadgeCheck className="h-4 w-4 shrink-0" style={{ color: 'var(--accent)' }} />
                <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Smart-ID verifikācija</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Truck className="h-4 w-4 shrink-0" style={{ color: 'var(--accent)' }} />
                <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Omniva/DPD piegāde</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>© 2026 SellBuy.lv</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>Privātuma politika</Link>
            <Link href="/terms" className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>Noteikumi</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
