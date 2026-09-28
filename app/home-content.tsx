'use client';

import Link from 'next/link';
import { Search, Car, Building2, Smartphone, Hammer, Briefcase, Home, Shirt, Baby } from 'lucide-react';
import { ListingCard } from '@/components/listing-card';
import { useLocale } from '@/app/lib/locale-context';
import { colors, typography, components, spacing } from '@/app/lib/design-system';

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

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className={`${spacing.section} border-b border-border bg-base`}>
        <div className={spacing.container + " text-center"}>
          <h1 className={typography.display + " text-text-primary"}>
            {t('hero.title')}
          </h1>
          <p className={typography.body + " text-text-secondary mt-6 max-w-2xl mx-auto"}>
            {t('hero.subtitle')}
          </p>
          <div className="mt-10 flex justify-center">
            <Link href="/listings" className={components.buttonPrimary}>
              <Search className="w-4 h-4 mr-2" />
              {t('hero.browse_btn')}
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className={`${spacing.section} bg-surface`}>
        <div className={spacing.container}>
          <h2 className={typography.h2 + " text-text-primary mb-10"}>Kategorijas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.name] || Home;
              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className={`${components.card} p-6 flex flex-col items-center text-center`}
                >
                  <Icon className="w-8 h-8 text-accent mb-4" />
                  <span className={typography.h3 + " text-text-primary"}>{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className={spacing.section}>
        <div className={spacing.container}>
          <h2 className={typography.h2 + " text-text-primary mb-10"}>Jaunākie sludinājumi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
