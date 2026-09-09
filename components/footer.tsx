import Link from 'next/link';
import { Shield, Truck, BadgeCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[#1f1f2e] bg-[#0a0a0f]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7c3aed] text-sm font-bold text-white">
                S
              </div>
              <span className="text-lg font-semibold text-[#f0f0f5] tracking-tight">
                Sell<span className="text-[#a78bfa]">Buy</span>.lv
              </span>
            </div>
            <p className="text-sm text-[#55556a] leading-relaxed">
              Uzticams sludinājumu portāls Latvijā. Droši darījumi ar Escrow aizsardzību.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-[#55556a] mb-4">Navigācija</h3>
            <ul className="space-y-3">
              {[
                { href: '/listings', label: 'Sludinājumi' },
                { href: '/categories', label: 'Kategorijas' },
                { href: '/new-listing', label: 'Pievienot sludinājumu' },
                { href: '/about', label: 'Par mums' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[#8888a0] hover:text-[#f0f0f5] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-[#55556a] mb-4">Konts</h3>
            <ul className="space-y-3">
              {[
                { href: '/login', label: 'Ieiet' },
                { href: '/register', label: 'Reģistrēties' },
                { href: '/messages', label: 'Ziņas' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[#8888a0] hover:text-[#f0f0f5] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-[#55556a] mb-4">Uzticamība</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-[#8888a0]">
                <BadgeCheck className="h-4 w-4 text-[#7c3aed]" />
                Smart-ID verifikācija
              </li>
              <li className="flex items-center gap-2 text-sm text-[#8888a0]">
                <Shield className="h-4 w-4 text-[#7c3aed]" />
                Escrow aizsardzība
              </li>
              <li className="flex items-center gap-2 text-sm text-[#8888a0]">
                <Truck className="h-4 w-4 text-[#7c3aed]" />
                Omniva/DPD piegāde
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#1f1f2e] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#55556a]">
            © 2026 SellBuy.lv. Visas tiesības aizsargātas.
          </p>
          <div className="flex gap-6">
            <Link href="/about" className="text-xs text-[#55556a] hover:text-[#8888a0] transition-colors">
              Privātuma politika
            </Link>
            <Link href="/about" className="text-xs text-[#55556a] hover:text-[#8888a0] transition-colors">
              Lietošanas noteikumi
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
