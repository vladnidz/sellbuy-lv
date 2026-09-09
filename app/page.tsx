import Link from 'next/link';
import { Metadata } from 'next';
import {
  Car,
  Building2,
  Smartphone,
  Hammer,
  Briefcase,
  Home as HomeIcon,
  Shirt,
  Baby,
  Search,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { buildTrilingualMetadata, BRAND } from '@/app/lib/seo';
import { prisma } from '@/app/lib/prisma';
import { ListingCard } from '@/components/listing-card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = buildTrilingualMetadata('/', {
  lv: { title: `Sākumlapa | ${BRAND}`, description: 'SellBuy.lv - labākais sludinājumu portāls Latvijā.' },
  ru: { title: `Главная | ${BRAND}`, description: 'SellBuy.lv - лучший портал объявлений в Латвии.' },
  en: { title: `Home | ${BRAND}`, description: 'SellBuy.lv - the best classifieds portal in Latvia.' },
});

const categories = [
  { name: 'Transports', path: '/categories/transports', icon: Car },
  { name: 'Nekustamie īpašumi', path: '/categories/nekustamie-ipasumi', icon: Building2 },
  { name: 'Elektronika', path: '/categories/elektronika', icon: Smartphone },
  { name: 'Celtniecība', path: '/categories/celtnieciba', icon: Hammer },
  { name: 'Darbs & Bizness', path: '/categories/darbs-bizness', icon: Briefcase },
  { name: 'Māja & Dārzs', path: '/categories/maja-darzs', icon: HomeIcon },
  { name: 'Apģērbi', path: '/categories/apgerbi', icon: Shirt },
  { name: 'Bērniem', path: '/categories/berniem', icon: Baby },
];

const steps = [
  { title: 'Atrodi preci', description: 'Meklē tūkstošos sludinājumu', icon: Search },
  { title: 'Sazinies ar pārdevēju', description: 'Droša saziņa caur platformu', icon: MessageCircle },
  { title: 'Drošs darījums', description: 'Escrow aizsardzība līdz preces saņemšanai', icon: ShieldCheck },
];

export default async function Home() {
  let recentListings: Awaited<ReturnType<typeof prisma.listing.findMany>> = [];

  try {
    recentListings = await prisma.listing.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { category: true },
    });
  } catch {
    // Database may not be available during build
  }

  const listingsForCard = recentListings.map((l) => ({
    id: l.id,
    title: l.title,
    price: Number(l.price),
    images: l.images,
    city: l.city,
    categoryName: l.category?.name ?? '',
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Subtle gradient background — only here, not on every element */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-600/5 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-white mb-6">
              Pērc un pārdod visā Latvijā
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10">
              Tūkstoši sludinājumu no uzticamiem pārdevējiem. Smart-ID verificēts, ar Escrow aizsardzību.
            </p>

            {/* Search Bar */}
            <form
              action="/listings"
              method="get"
              className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-8"
            >
              <div className="relative flex-shrink-0 sm:w-48">
                <select
                  name="category"
                  className="w-full h-12 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm px-4 appearance-none cursor-pointer hover:border-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
                >
                  <option value="">Visas kategorijas</option>
                  {categories.map((cat) => (
                    <option key={cat.path} value={cat.path}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  name="q"
                  placeholder="Ko Tu meklē?"
                  className="w-full h-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 pl-11 pr-4 text-sm hover:border-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-12 px-8 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl"
              >
                Meklēt
              </Button>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="h-11 px-6 bg-white text-slate-950 hover:bg-white/90 font-medium rounded-xl"
                asChild
              >
                <Link href="/listings/new">Ievietot sludinājumu</Link>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="h-11 px-6 text-white/70 hover:text-white hover:bg-white/5 font-medium rounded-xl"
                asChild
              >
                <Link href="/listings">
                  Pārlūkot
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl font-semibold text-white mb-8">
          Populārākās kategorijas
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link key={cat.path} href={cat.path}>
                <div className="group flex items-center gap-3 p-4 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all duration-200">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 group-hover:bg-violet-600/10 transition-colors">
                    <Icon className="h-5 w-5 text-white/50 group-hover:text-violet-400 transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                    {cat.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent Listings */}
      {recentListings.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-white">
              Jaunākie sludinājumi
            </h2>
            <Link
              href="/listings"
              className="text-sm text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
            >
              Visi sludinājumi
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentListings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                title={listing.title}
                price={Number(listing.price)}
                images={listing.images}
                city={listing.city}
                categoryName={listing.category.name}
              />
            ))}
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl font-semibold text-white text-center mb-12">
          Kā tas strādā
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="text-center group"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 mb-5 group-hover:bg-violet-600/10 transition-colors">
                  <Icon className="h-5 w-5 text-white/50 group-hover:text-violet-400 transition-colors" />
                </div>
                <div className="text-xs font-medium text-white/30 mb-3 tracking-wider uppercase">
                  {index + 1}. solis
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-white/50 max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-white mb-4">
            Gatavs sākt?
          </h2>
          <p className="text-white/50 mb-8 max-w-md mx-auto">
            Pievienojies tūkstošiem lietotāju, kas jau tirgojas droši.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="h-11 px-6 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl"
              asChild
            >
              <Link href="/register">Reģistrēties</Link>
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="h-11 px-6 text-white/70 hover:text-white hover:bg-white/5 font-medium rounded-xl"
              asChild
            >
              <Link href="/listings">Pārlūkot sludinājumus</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
