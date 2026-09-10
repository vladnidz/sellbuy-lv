'use client';

import Link from 'next/link';
import { ArrowLeft, Car, Building2, Smartphone, Hammer, Briefcase, Home, Shirt, Baby } from 'lucide-react';
import { useLocale } from '@/app/lib/locale-context';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Automobiļi': Car, 'Darbs': Briefcase, 'Dzīvnieki': Baby,
  'Mode un stils': Shirt, 'Nekustamie īpašumi': Building2,
  'Pakalpojumi': Hammer, 'Elektronika': Smartphone, 'Māja un dārzs': Home,
};

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function CategoriesPageClient({ categories }: { categories: Category[] }) {
  const { t } = useLocale();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-8 transition-colors" style={{ color: 'var(--text-tertiary)' }}>
        <ArrowLeft className="h-3.5 w-3.5" /> {t('common.return_home')}
      </Link>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-8" style={{ color: 'var(--text-primary)' }}>
        {t('categories.title')}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.name] || Smartphone;
          return (
            <Link
              key={cat.id}
              href={`/listings?category=${cat.id}`}
              className="group flex items-center gap-4 p-5 rounded-xl border transition-all duration-200"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(124, 90, 237, 0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--accent-soft)' }}>
                <Icon className="h-6 w-6" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{cat.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
