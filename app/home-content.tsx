'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { 
  Search, Car, Building2, Smartphone, Hammer, Briefcase, Home, Shirt, Baby, 
  ShieldCheck, Lock, Truck, ArrowRight, Sparkles, Plus 
} from 'lucide-react';
import { ListingCard } from '@/components/listing-card';
import { useLocale } from '@/app/lib/locale-context';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Automobiļi': Car,
  'Darbs': Briefcase,
  'Dzīvnieki': Baby,
  'Mode un stils': Shirt,
  'Nekustamie īpašumi': Building2,
  'Pakalpojumi': Hammer,
  'Elektronika': Smartphone,
  'Telefoni': Smartphone,
  'Māja un dārzs': Home,
};

interface Listing {
  id: string;
  title: string;
  price: number;
  images: string[];
  city: string | null;
  categoryName: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface HomePageContentProps {
  listings: Listing[];
  categories: Category[];
}

export function HomePageContent({ listings, categories }: HomePageContentProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/listings?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/listings');
    }
  };

  return (
    <main className="flex-1 bg-[var(--background)]">
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-[var(--border)] bg-gradient-to-b from-[var(--surface)] to-[var(--background)]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-purple-500/10 blur-[120px] pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-300 mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Modernākais sludinājumu portāls Latvijā</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] max-w-4xl mx-auto leading-[1.15]">
            {t('hero.title') || 'Pērc un pārdod visā Latvijā ar pilnu drošību'}
          </h1>
          
          <p className="mt-6 text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed font-normal">
            {t('hero.subtitle') || 'Verificēti lietotāji, droši darījumi un pakomātu piegāde rokas stiepiena attālumā.'}
          </p>

          {/* Search Input Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-10 max-w-2xl mx-auto">
            <div className="relative flex items-center p-2 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xl focus-within:ring-2 focus-within:ring-purple-500/50 transition-all">
              <Search className="w-5 h-5 text-[var(--text-secondary)] ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ko jūs šodien meklējat? (piem., iPhone 15, BMW, Dzīvoklis)..."
                className="w-full bg-transparent px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-md transition-all shrink-0 hover:scale-[1.02]"
              >
                Meklēt
              </button>
            </div>
          </form>

          {/* Quick Stats / Trust Badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" /> Smart-ID Verifikācija
            </span>
            <span className="flex items-center gap-1.5 text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              <Lock className="w-4 h-4" /> Escrow Aizsardzība
            </span>
            <span className="flex items-center gap-1.5 text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              <Truck className="w-4 h-4" /> Omniva / DPD Piegāde
            </span>
          </div>
        </div>
      </section>

      {/* Categories Grid Section */}
      <section className="py-16 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Populārākās kategorijas</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Atrast visu nepieciešamo starp tūkstošiem sludinājumu</p>
            </div>
            <Link 
              href="/categories" 
              className="inline-flex items-center gap-1 text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors"
            >
              Visas kategorijas <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.name] || Home;
              return (
                <Link
                  key={cat.id}
                  href={`/listings?category=${encodeURIComponent(cat.slug || cat.id)}`}
                  className="group relative p-5 rounded-2xl bg-[var(--background)] border border-[var(--border)] hover:border-purple-500/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col items-center text-center"
                >
                  <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors mb-3">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-purple-400 transition-colors line-clamp-1">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Feature Highlights */}
      <section className="py-16 border-b border-[var(--border)] bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Pārbaudīti pārdevēji</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Smart-ID un eParaksts verifikācijas žetoni garantē, ka tirgojaties ar reālām fiziskām un juridiskām personām.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Escrow darījumu aizsardzība</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Maksājums tiek droši uzglabāts līdz brīdim, kad pircējs apstiprina preces saņemšanu un atbilstību aprakstam.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Ērta pakomātu piegāde</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Integrēts Omniva, DPD un Latvijas Pasts pakomātu tīkls visā Baltijā ar automātisku sūtījuma izsekošanu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Listings Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Jaunākie sludinājumi</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Nesen pievienoti priekšmeti un piedāvājumi</p>
            </div>
            <Link 
              href="/listings" 
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl shadow transition-all"
            >
              Visi sludinājumi <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} {...listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
              <p className="text-[var(--text-secondary)] text-base">Pašlaik nav pieejamu sludinājumu.</p>
              <Link
                href="/new-listing"
                className="mt-4 inline-flex items-center gap-2 bg-purple-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow"
              >
                <Plus className="w-4 h-4" /> Ievietot pirmo sludinājumu
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
