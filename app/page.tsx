export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Search, ArrowRight, MessageCircle, ShieldCheck } from 'lucide-react';
import { prisma } from '@/app/lib/prisma';
import { ListingCard } from '@/components/listing-card';
import { buildTrilingualMetadata, BRAND } from '@/app/lib/seo';
import { Metadata } from 'next';

export const metadata: Metadata = buildTrilingualMetadata('/', {
  lv: { title: `Sākumlapa | ${BRAND}`, description: 'Pērc un pārdod visā Latvijā. Droši darījumi ar Escrow aizsardzību.' },
  ru: { title: `${BRAND} — Купля и продажа в Латвии`, description: 'Покупайте и продавайте по всей Латвии.' },
  en: { title: `${BRAND} — Buy and Sell in Latvia`, description: 'Buy and sell across Latvia with Escrow protection.' },
});

const CATEGORIES = [
  { name: 'Automobiļi', slug: 'automobili', icon: '🚗' },
  { name: 'Nekustamie īpašumi', slug: 'nekustamie-ipasumi', icon: '🏠' },
  { name: 'Elektronika', slug: 'elektronika', icon: '📱' },
  { name: 'Celtniecība', slug: 'celtnieciba', icon: '🔨' },
  { name: 'Darbs', slug: 'darbs', icon: '💼' },
  { name: 'Māja un dārzs', slug: 'maja-un-darzs', icon: '🏡' },
  { name: 'Apģērbi', slug: 'apgerbi', icon: '👕' },
  { name: 'Bērniem', slug: 'berniem', icon: '👶' },
];

export default async function Home() {
  let recentListings: { id: string; title: string; price: unknown; images: string[]; city: string | null; category: { name: string } | null }[] = [];

  try {
    recentListings = await prisma.listing.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { category: { select: { name: true } } },
    });
  } catch {
    // DB not available — show empty state
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
    <main className="flex-1">
      {/* Hero */}
      <section className="py-16 sm:py-24 border-b border-[#1e1e2a]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-5xl font-semibold text-[#e8e8ed] tracking-tight leading-tight">
            Pērc un pārdod<br className="hidden sm:block" /> visā Latvijā
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#6a6a7a] max-w-xl mx-auto">
            Tūkstoši sludinājumu no uzticamiem pārdevējiem. Smart-ID verificēts, ar Escrow aizsardzību.
          </p>

          {/* Search */}
          <div className="mt-8 max-w-lg mx-auto">
            <form action="/listings" method="get" className="flex items-center bg-[#12121a] border border-[#1e1e2a] rounded-lg overflow-hidden">
              <input
                type="text"
                name="q"
                placeholder="Meklēt sludinājumus..."
                className="flex-1 bg-transparent px-4 py-3 text-sm text-[#e8e8ed] placeholder:text-[#4a4a5a] outline-none"
              />
              <button type="submit" className="px-4 py-3 text-[#6a6a7a] hover:text-[#e8e8ed] transition-colors">
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/new-listing" className="text-sm bg-[#7c5aed] hover:bg-[#6a4bd4] text-white px-5 py-2.5 rounded-lg transition-colors">
              Ievietot sludinājumu
            </Link>
            <Link href="/listings" className="text-sm text-[#8a8a9a] hover:text-[#e8e8ed] border border-[#1e1e2a] hover:border-[#2a2a3a] px-5 py-2.5 rounded-lg transition-colors">
              Pārlūkot
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#e8e8ed] tracking-tight mb-8">
            Kategorijas
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="group flex items-center gap-3 p-4 bg-[#12121a] border border-[#1e1e2a] rounded-lg hover:border-[#2a2a3a] transition-colors"
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="text-sm text-[#8a8a9a] group-hover:text-[#e8e8ed] transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      {listingsForCard.length > 0 && (
        <section className="py-16 sm:py-20 border-t border-[#1e1e2a]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#e8e8ed] tracking-tight">
                Jaunākie sludinājumi
              </h2>
              <Link href="/listings" className="text-sm text-[#8a8a9a] hover:text-[#e8e8ed] transition-colors flex items-center gap-1">
                Visi <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {listingsForCard.map((listing) => (
                <ListingCard key={listing.id} {...listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-16 sm:py-20 border-t border-[#1e1e2a]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#e8e8ed] tracking-tight mb-10 text-center">
            Kā tas strādā
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: Search, title: 'Atrodi preci', desc: 'Meklē tūkstošos sludinājumu pēc kategorijas, cenas vai atrašanās vietas.' },
              { icon: MessageCircle, title: 'Sazinies ar pārdevēju', desc: 'Droša saziņa caur platformu — nav jādala savs telefona numurs.' },
              { icon: ShieldCheck, title: 'Drošs darījums', desc: 'Escrow aizsardzība — nauda tiek atbrīvota tikai pēc preces saņemšanas.' },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-lg bg-[#12121a] border border-[#1e1e2a] flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-5 w-5 text-[#7c5aed]" />
                </div>
                <h3 className="text-sm font-medium text-[#e8e8ed] mb-2">{step.title}</h3>
                <p className="text-sm text-[#6a6a7a] leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 border-t border-[#1e1e2a]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#e8e8ed] tracking-tight mb-4">
            Gatavs sākt?
          </h2>
          <p className="text-sm text-[#6a6a7a] mb-6">Bezmaksas reģistrācija. Nav slēptu maksu.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="text-sm bg-[#7c5aed] hover:bg-[#6a4bd4] text-white px-5 py-2.5 rounded-lg transition-colors">
              Reģistrēties
            </Link>
            <Link href="/listings" className="text-sm text-[#8a8a9a] hover:text-[#e8e8ed] border border-[#1e1e2a] hover:border-[#2a2a3a] px-5 py-2.5 rounded-lg transition-colors">
              Pārlūkot sludinājumus
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
