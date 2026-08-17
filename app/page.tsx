import { prisma } from './lib/prisma';

export const dynamic = "force-dynamic";

const categories = [
  { name: 'Transports', icon: '🚗', path: 'transports' },
  { name: 'Nekustamie īpašumi', path: 'nekustamie_ipasumi', icon: '🏠' },
  { name: 'Elektronika & Sadzīves tehnika', path: 'elektronika_sadzives_tehnika', icon: '📱' },
  { name: 'Celtniecība & Remonts', path: 'celtnieciba_remonts', icon: '🛠️' },
  { name: 'Darbs & Bizness', path: 'darbs_bizness', icon: '💼' },
  { name: 'Māja & Dārzs', path: 'maja_darzs', icon: '🏡' },
  { name: 'Apģērbi & Aksesuāri', path: 'apgerbi_aksesuari', icon: '👕' },
  { name: 'Bērnu pasaule', path: 'bernu_pasaule', icon: '👶' },
];

export default async function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white font-sans">
      <nav className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black tracking-tight text-blue-400">SellBuy.lv</h1>
          <div className="flex gap-4">
            <button className="text-sm font-semibold hover:text-blue-400 transition-colors">Meklēt</button>
            <button className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full transition-all">Pievienot Sludinājumu</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <header className="text-center mb-16">
          <h2 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-200">Uzticams tirgus Tavā telefonā</h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg">Moderns, drošs un ātrs sludinājumu portāls ar Omniva/DPD integrāciju un Smart-ID pārbaudi.</p>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {categories.map((cat) => (
            <div key={cat.path} className="flex flex-col items-center justify-center p-8 bg-slate-800/50 border border-slate-700/50 rounded-2xl hover:border-blue-500/50 transition-all cursor-pointer group hover:shadow-lg hover:shadow-blue-500/10">
              <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">{cat.icon}</span>
              <h3 className="font-bold text-center text-slate-100 group-hover:text-blue-400 transition-colors">{cat.name}</h3>
            </div>
          ))}
        </section>

        <section className="bg-slate-800/30 border border-slate-700/50 p-8 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="text-2xl font-bold mb-2 text-blue-400">Cik ātri var pārdot?</h3>
            <p className="text-slate-300">SellBuy.lv ievieš Smart-ID verifikāciju – 87% lietotāju pārdod jau pirmajā dienā!</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors shrink-0">Uzzināt vairāk</button>
        </section>
      </main>

      <footer className="border-t border-slate-800 bg-slate-900 py-8 text-center text-sm text-slate-500">
        © 2026 SellBuy.lv - Viss Jūsu darījumiem
      </footer>
    </div>
  );
}
