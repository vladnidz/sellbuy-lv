'use client';

import Link from 'next/link';
import { Search, ArrowRight, MessageCircle, ShieldCheck, Car, Building2, Smartphone, Hammer, Briefcase, Home, Shirt, Baby } from 'lucide-react';
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

  const steps = [
    { icon: Search, title: t('how_it_works.step1_title'), desc: t('how_it_works.step1_desc') },
    { icon: MessageCircle, title: t('how_it_works.step2_title'), desc: t('how_it_works.step2_desc') },
    { icon: ShieldCheck, title: t('how_it_works.step3_title'), desc: t('how_it_works.step3_desc') },
  ];

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="py-16 sm:py-24 border-b" style={{ borderColor: 'var(--border)', background: 'linear-gradient(135deg, var(--bg-base) 0%, var(--bg-surface) 100%)' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>
            {t('hero.title')}
          </h1>
          <p className="mt-4 text-base sm:text-lg max-w-xl mx-auto" style={{ color: 'var(--text-tertiary)' }}>
            {t('hero.subtitle')}
          </p>
          <div className="mt-8 max-w-lg mx-auto">
            <form action="/listings" method="get" className="flex items-center rounded-lg overflow-hidden border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
              <input type="text" name="q" placeholder={t('hero.search_placeholder')} className="flex-1 bg-transparent px-4 py-3 text-sm outline-none" style={{ color: 'var(--text-primary)' }} />
              <button type="submit" className="px-4 py-3 transition-colors" style={{ color: 'var(--text-tertiary)' }}>
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/new-listing" className="text-sm text-white px-5 py-2.5 rounded-lg transition-colors" style={{ backgroundColor: 'var(--accent)' }}>
              {t('hero.cta_primary')}
            </Link>
            <Link href="/listings" className="text-sm border px-5 py-2.5 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
              {t('hero.cta_secondary')}
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-8" style={{ color: 'var(--text-primary)' }}>
            {t('categories.title')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.name] || Smartphone;
              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="group flex items-center gap-3 p-4 rounded-xl border transition-all duration-200"
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(124, 90, 237, 0.3)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent-soft)' }}>
                    <Icon className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                  </div>
                  <span className="text-sm font-medium transition-colors" style={{ color: 'var(--text-secondary)' }}>
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      {listings.length > 0 && (
        <section className="py-16 sm:py-20 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {t('listings.title')}
              </h2>
              <Link href="/listings" className="text-sm transition-colors flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                {t('cta.browse')} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} {...listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-16 sm:py-20 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-10 text-center" style={{ color: 'var(--text-primary)' }}>
            {t('how_it_works.title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--accent-soft)' }}>
                  <step.icon className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: 'var(--text-tertiary)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 border-t" style={{ borderColor: 'var(--border)', background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-base) 100%)' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>
            {t('cta.title')}
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>{t('cta.subtitle')}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="text-sm text-white px-5 py-2.5 rounded-lg transition-colors" style={{ backgroundColor: 'var(--accent)' }}>
              {t('cta.register')}
            </Link>
            <Link href="/listings" className="text-sm border px-5 py-2.5 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
              {t('cta.browse')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
