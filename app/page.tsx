import { Suspense } from 'react';
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
  ChevronDown,
} from 'lucide-react';
import { buildTrilingualMetadata, BRAND } from '@/app/lib/seo';
import { prisma } from '@/app/lib/prisma';
import { ListingCard } from '@/components/listing-card';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildTrilingualMetadata('/', {
  lv: { title: `Sākumlapa | ${BRAND}`, description: 'SellBuy.lv - labākais sludinājumu portāls Latvijā.' },
  ru: { title: `Главная | ${BRAND}`, description: 'SellBuy.lv - лучший портал объявлений в Латвии.' },
  en: { title: `Home | ${BRAND}`, description: 'SellBuy.lv - the best classifieds portal in Latvia.' },
});

async function RecentListings() {
  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: 'desc' },
    take: 8,
    include: { category: { select: { name: true } } },
  });

  if (listings.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          id={listing.id}
          title={listing.title}
          price={Number(listing.price)}
          images={listing.images as string[]}
          city={listing.city}
          categoryName={listing.category?.name || 'Cits'}
        />
      ))}
    </div>
  );
}

export default async function HomePage() {
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

  return (
    <div className="flex flex-col gap-12 sm:gap-20">
      {/* 1. HERO */}
      <section className="relative w-full bg-[#0a0a0f] py-24 sm:py-32 border-b border-[#1f1f2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-[#f0f0f5] tracking-tight mb-8">
            Pērc un pārdod visā Latvijā
          </h1>
          <div className="max-w-3xl mx-auto bg-[#12121a] border border-[#1f1f2e] p-2 rounded-2xl flex items-center ">
            <button className="flex items-center gap-2 px-4 py-3 text-[#8888a0] border-r border-[#1f1f2e] hover:text-[#f0f0f5]">
              <span>Kategorija</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <input
              type="text"
              placeholder="Meklēt preces..."
              className="flex-1 px-4 py-3 bg-transparent text-[#f0f0f5] placeholder-[#55556a] focus:outline-none"
            />
            <Button className="bg-[#7c3aed] text-white hover:bg-[#6d28d9] rounded-xl px-6">
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h2 className="text-2xl font-bold text-[#f0f0f5] mb-12">Kategorijas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.path}
              href={cat.path}
              className="group block rounded-2xl border border-[#1f1f2e] bg-[#12121a] p-6 transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg hover:border-[#2a2a3a]"
            >
              <cat.icon className="w-8 h-8 text-[#7c3aed] mb-4" />
              <span className="text-lg font-medium text-[#f0f0f5]">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. LISTINGS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h2 className="text-2xl font-bold text-[#f0f0f5] mb-12">Jaunākie sludinājumi</h2>
        <Suspense fallback={<div className="text-[#8888a0]">Ielādē...</div>}>
          <RecentListings />
        </Suspense>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="bg-[#12121a] py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#f0f0f5] mb-12 text-center">Kā tas darbojas?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
            {[
              { icon: Search, title: 'Atrodi preci', desc: 'Meklē tūkstošos sludinājumu' },
              { icon: MessageCircle, title: 'Sazinies', desc: 'Droša saziņa caur platformu' },
              { icon: ShieldCheck, title: 'Drošs darījums', desc: 'Escrow aizsardzība' },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#1a1033] flex items-center justify-center text-[#7c3aed] font-bold text-2xl mb-6 border border-[#7c3aed]/20">
                  {i + 1}
                </div>
                <h3 className="text-xl font-bold text-[#f0f0f5] mb-2">{step.title}</h3>
                <p className="text-[#8888a0]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-24 sm:pb-32">
        <div className="bg-[#7c3aed] rounded-xl p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">Gatavs sākt?</h2>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-white text-[#7c3aed] hover:bg-gray-100 rounded-xl px-8">
              Pievienot sludinājumu
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 rounded-xl px-8">
              Skatīt visus
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
