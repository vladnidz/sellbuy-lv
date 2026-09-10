import Link from 'next/link';
import { Search, ArrowRight, CheckCircle, ShieldCheck, ShoppingCart, Box, Droplets, Bike, Music, Camera, Utensils, Shirt, Baby, Sparkles, Building2 } from 'lucide-react';
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
  { name: 'Automobiļi', slug: 'automobili', icon: Box },
  { name: 'Nekustamie īpašumi', slug: 'nekustamie-ipasumi', icon: Building2 },
  { name: 'Elektronika', slug: 'elektronika', icon: ShoppingCart },
  { name: 'Mēbeles', slug: 'mebeles', icon: Utensils },
  { name: 'Apģērbi', slug: 'apgerbi', icon: Shirt },
  { name: 'Sports', slug: 'sports', icon: Bike },
  { name: 'Mūzika', slug: 'muzika', icon: Music },
  { name: 'Bērniem', slug: 'berniem', icon: Baby },
];

const STEPS = [
  { number: 1, title: 'Piesakies', description: 'Izveido bezmaksas lietotāju un ievadi savus datus.' },
  { number: 2, title: 'Pievieno sludinājumu', description: 'Uzliec attēlus, aprakstu un cenu.' },
  { number: 3, title: 'Dari darījumu', description: 'Izmanto Escrow aizsardzību par drošu pārdošanu.' },
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
    images: l.images || [],
    city: l.city,
    categoryName: l.category?.name || 'Nepārskatāms',
  }));

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0d0d15] to-[#12121a]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#7c5aed]/10 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#7c5aed]/5 rounded-full blur-3xl opacity-30" />

        <div className="relative px-6 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-[#e8e8ed] mb-6 leading-tight">
              Pērc un pārdod visā Latvijā
            </h1>
            <p className="text-lg md:text-xl text-[#8a8a9a] mb-10 max-w-2xl mx-auto">
              Droši darījumi ar Escrow aizsardzību. Mēs nodrošinām, ka tavs pārdevējs saņem naudu, bet tu saņem preci.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto bg-[#12121a] border border-[#1e1e2a] rounded-2xl p-2">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a8a9a]" />
                  <input
                    type="text"
                    placeholder="Meklēt preces, vietnes, transportu..."
                    className="w-full bg-transparent text-[#e8e8ed] placeholder-[#8a8a9a] pl-12 pr-4 py-4 outline-none"
                  />
                </div>
                <select className="md:w-48 bg-[#12121a] border border-[#1e1e2a] text-[#e8e8ed] rounded-xl px-4 py-4 outline-none cursor-pointer hover:border-[#7c5aed]/30 transition-colors">
                  <option value="">Visas kategorijas</option>
                  <option value="automobili">Automobiļi</option>
                  <option value="nekustamie-ipasumi">Nekustamie īpašumi</option>
                  <option value="elektronika">Elektronika</option>
                </select>
                <button className="bg-[#7c5aed] text-white font-bold rounded-xl px-8 py-4 hover:bg-[#6b4fd4] transition-colors flex items-center justify-center gap-2">
                  Meklēt
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#e8e8ed] mb-4">
              Popularākās kategorijas
            </h2>
            <p className="text-[#8a8a9a] text-lg">
              Atrodi to, kuru meklē
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.slug}
                  href={`/listings?category=${category.slug}`}
                  className="group block bg-[#12121a] border border-[#1e1e2a] rounded-xl p-6 hover:border-[#7c5aed]/30 hover:shadow-lg hover:shadow-[#7c5aed]/5 transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-[#7c5aed]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#7c5aed]/20 transition-colors">
                    <Icon className="w-7 h-7 text-[#7c5aed]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#e8e8ed] mb-2">{category.name}</h3>
                  <p className="text-sm text-[#8a8a9a]">Pārlūkot sludinājumus</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="px-6 py-20 bg-[#0d0d15]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#e8e8ed] mb-2">
                Jaunie sludinājumi
              </h2>
              <p className="text-[#8a8a9a] text-lg">
                Vislabākie jaunumi šodien
              </p>
            </div>
            <Link
              href="/listings"
              className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-[#12121a] border border-[#1e1e2a] text-[#e8e8ed] font-medium rounded-xl px-6 py-3 hover:border-[#7c5aed]/30 hover:shadow-lg hover:shadow-[#7c5aed]/5 transition-all duration-300"
            >
              Skatīt visus
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {listingsForCard.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {listingsForCard.map((listing) => (
                <ListingCard key={listing.id} {...listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-[#8a8a9a] text-lg">Šobrīd nav sludinājumu</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#e8e8ed] mb-4">
              Kā tas darbojas
            </h2>
            <p className="text-[#8a8a9a] text-lg">
              Tikai 3 vienkāršas darbības
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div key={step.number} className="relative">
                <div className="bg-[#12121a] border border-[#1e1e2a] rounded-2xl p-8 h-full hover:border-[#7c5aed]/30 hover:shadow-lg hover:shadow-[#7c5aed]/5 transition-all duration-300">
                  <div className="w-16 h-16 bg-[#7c5aed] rounded-full flex items-center justify-center mb-6">
                    <span className="text-2xl font-bold text-white">{step.number}</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#e8e8ed] mb-3">{step.title}</h3>
                  <p className="text-[#8a8a9a]">{step.description}</p>
                </div>
                {step.number < 3 && (
                  <div className="hidden md:block absolute top-8 left-1/2 -translate-x-1/2 w-full h-0.5 bg-gradient-to-r from-transparent via-[#7c5aed]/30 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-br from-[#12121a] via-[#0d0d15] to-[#0a0a0f]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-[#12121a] border border-[#1e1e2a] rounded-2xl p-10 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#7c5aed]/10 rounded-full blur-3xl opacity-20" />

            <div className="relative z-10">
              <Sparkles className="w-12 h-12 text-[#7c5aed] mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-[#e8e8ed] mb-4">
                Sāc mūsdienīgu tirdzniecību
              </h2>
              <p className="text-[#8a8a9a] text-lg mb-8 max-w-xl mx-auto">
                Izveido bezmaksas kontu un sāc sludināt jau šodien. Drošas pārdošanas ar Escrow aizsardzību.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center gap-2 bg-[#7c5aed] text-white font-bold rounded-xl px-8 py-4 hover:bg-[#6b4fd4] transition-colors"
                >
                  Reģistrēties
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/listings/new"
                  className="inline-flex items-center justify-center gap-2 bg-transparent border border-[#1e1e2a] text-[#e8e8ed] font-bold rounded-xl px-8 py-4 hover:border-[#7c5aed]/30 hover:shadow-lg hover:shadow-[#7c5aed]/5 transition-all duration-300"
                >
                  Sākt pārdot
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
