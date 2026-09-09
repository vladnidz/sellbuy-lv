import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-[#1e1e2a] bg-[#0a0a0f]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="text-lg font-semibold text-[#e8e8ed] tracking-tight">
              Sell<span className="text-[#7c5aed]">Buy</span>.lv
            </Link>
            <p className="mt-3 text-sm text-[#6a6a7a] leading-relaxed">
              Drošs veids, kā pirkt un pārdot Latvijā.
            </p>
          </div>

          {/* Navigate */}
          <div>
            <h3 className="text-xs font-medium text-[#6a6a7a] uppercase tracking-wider mb-3">Navigācija</h3>
            <ul className="space-y-2">
              <li><Link href="/listings" className="text-sm text-[#8a8a9a] hover:text-[#e8e8ed] transition-colors">Sludinājumi</Link></li>
              <li><Link href="/categories" className="text-sm text-[#8a8a9a] hover:text-[#e8e8ed] transition-colors">Kategorijas</Link></li>
              <li><Link href="/new-listing" className="text-sm text-[#8a8a9a] hover:text-[#e8e8ed] transition-colors">Ievietot</Link></li>
              <li><Link href="/about" className="text-sm text-[#8a8a9a] hover:text-[#e8e8ed] transition-colors">Par mums</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-xs font-medium text-[#6a6a7a] uppercase tracking-wider mb-3">Konts</h3>
            <ul className="space-y-2">
              <li><Link href="/login" className="text-sm text-[#8a8a9a] hover:text-[#e8e8ed] transition-colors">Ieiet</Link></li>
              <li><Link href="/register" className="text-sm text-[#8a8a9a] hover:text-[#e8e8ed] transition-colors">Reģistrēties</Link></li>
              <li><Link href="/messages" className="text-sm text-[#8a8a9a] hover:text-[#e8e8ed] transition-colors">Ziņojumi</Link></li>
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h3 className="text-xs font-medium text-[#6a6a7a] uppercase tracking-wider mb-3">Drošība</h3>
            <ul className="space-y-2 text-sm text-[#6a6a7a]">
              <li>Escrow aizsardzība</li>
              <li>Smart-ID verifikācija</li>
              <li>Šifrēta saziņa</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#1e1e2a] text-xs text-[#4a4a5a]">
          © 2026 SellBuy.lv
        </div>
      </div>
    </footer>
  );
}
