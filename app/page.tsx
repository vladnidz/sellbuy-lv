import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from 'next/link';

const categories = [
  { name: 'Transports', icon: '🚗', path: '/categories/transports' },
  { name: 'Nekustamie īpašumi', path: '/categories/nekustamie-ipasumi', icon: '🏠' },
  { name: 'Elektronika', path: '/categories/elektronika', icon: '📱' },
  { name: 'Celtniecība', path: '/categories/celtnieciba', icon: '🛠️' },
  { name: 'Darbs & Bizness', path: '/categories/darbs-bizness', icon: '💼' },
  { name: 'Māja & Dārzs', path: '/categories/maja-darzs', icon: '🏡' },
  { name: 'Apģērbi', path: '/categories/apgerbi', icon: '👕' },
  { name: 'Bērniem', path: '/categories/berniem', icon: '👶' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              SellBuy.lv
            </Link>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm">Meklēt</Button>
              <Link href="/new-listing">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Pievienot Sludinājumu</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
            Uzticams tirgus Tavā telefonā
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg mb-8">
            Moderns, drošs un ātrs sludinājumu portāls ar Omniva/DPD integrāciju un Smart-ID pārbaudi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            <Input placeholder="Ko Tu meklē?" className="h-12 bg-slate-900/50 border-slate-700" />
            <Button size="lg" className="h-12 px-8 bg-blue-600 hover:bg-blue-700">Meklēt</Button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {categories.map((cat) => (
            <Link key={cat.path} href={cat.path}>
              <Card className="group bg-slate-900/50 border-slate-800 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer h-full">
                <CardHeader>
                  <span className="text-5xl mb-2 group-hover:scale-110 transition-transform inline-block">{cat.icon}</span>
                  <CardTitle className="text-lg group-hover:text-blue-400 transition-colors">{cat.name}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        {/* Trust Badge Section */}
        <Card className="bg-gradient-to-br from-blue-950/50 to-indigo-950/50 border-blue-900/30 p-8">
          <CardContent className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2 text-blue-400">100% Droši darījumi</h3>
              <p className="text-slate-300">Smart-ID verifikācija un escrow aizsardzība katram darījumam.</p>
            </div>
            <Link href="/about">
              <Button size="lg" variant="outline" className="border-blue-600 text-blue-400 hover:bg-blue-950">
                Uzzināt vairāk
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
          © 2026 SellBuy.lv — Viss Jūsu darījumiem
        </div>
      </footer>
    </div>
  );
}
