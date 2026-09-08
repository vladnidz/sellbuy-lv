import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white">
                S
              </div>
              <span className="text-lg font-bold text-white">
                Sell<span className="text-violet-400">Buy</span>.lv
              </span>
            </div>
            <p className="text-sm text-white/50">
              Droši darījumi Latvijā. Smart-ID verifikācija, Escrow aizsardzība, Omniva/DPD piegāde.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Navigācija</h3>
            <ul className="space-y-2">
              <li><Link href="/listings" className="text-sm text-white/50 hover:text-white transition-colors">Sludinājumi</Link></li>
              <li><Link href="/categories" className="text-sm text-white/50 hover:text-white transition-colors">Kategorijas</Link></li>
              <li><Link href="/new-listing" className="text-sm text-white/50 hover:text-white transition-colors">Pievienot sludinājumu</Link></li>
              <li><Link href="/about" className="text-sm text-white/50 hover:text-white transition-colors">Par mums</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Konts</h3>
            <ul className="space-y-2">
              <li><Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors">Ieiet</Link></li>
              <li><Link href="/register" className="text-sm text-white/50 hover:text-white transition-colors">Reģistrēties</Link></li>
              <li><Link href="/messages" className="text-sm text-white/50 hover:text-white transition-colors">Ziņas</Link></li>
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Uzticamība</h3>
            <ul className="space-y-2">
              <li className="text-sm text-white/50">🔒 Smart-ID verifikācija</li>
              <li className="text-sm text-white/50">🛡️ Escrow aizsardzība</li>
              <li className="text-sm text-white/50">📦 Omniva/DPD piegāde</li>
              <li className="text-sm text-white/50">⭐ Pārdevēju vērtējumi</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/30">
            © 2026 SellBuy.lv. Visas tiesības aizsargātas.
          </p>
          <div className="flex gap-4">
            <Link href="/about" className="text-sm text-white/30 hover:text-white/60 transition-colors">Privātuma politika</Link>
            <Link href="/about" className="text-sm text-white/30 hover:text-white/60 transition-colors">Lietošanas noteikumi</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
