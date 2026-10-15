'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Car, Building2, Smartphone, Briefcase, Home, Shirt, Baby, ChevronRight, Layers } from 'lucide-react';
import { useLocale } from '@/app/lib/locale-context';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Automobiļi': Car,
  'Transports': Car,
  'Darbs': Briefcase,
  'Dzīvnieki': Baby,
  'Mode un stils': Shirt,
  'Nekustamie īpašumi': Building2,
  'Elektronika': Smartphone,
  'Māja un dārzs': Home,
};

export interface SubCategoryItem {
  id: string;
  name: string;
  slug: string;
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  nameRu?: string | null;
  nameEn?: string | null;
  nameUk?: string | null;
  items?: SubCategoryItem[];
}

export interface MainCategory {
  id: string;
  name: string;
  slug: string;
  nameRu?: string | null;
  nameEn?: string | null;
  nameUk?: string | null;
  subcategories?: SubCategory[];
}

export default function CategoriesPageClient({ categories }: { categories: MainCategory[] }) {
  const { t, locale } = useLocale();
  const [activeCategoryId, setActiveCategoryId] = useState<string>(categories[0]?.id || '');

  const activeCategory = categories.find((c) => c.id === activeCategoryId) || categories[0];

  const getLocalizedName = (cat?: { name: string; nameRu?: string | null; nameEn?: string | null; nameUk?: string | null }) => {
    if (!cat) return '';
    if (locale === 'ru' && cat.nameRu) return cat.nameRu;
    if (locale === 'en' && cat.nameEn) return cat.nameEn;
    if (locale === 'uk' && cat.nameUk) return cat.nameUk;
    return cat.name;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold mb-2 transition-colors hover:text-purple-400"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {t('common.return_home')}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5" style={{ color: 'var(--text-primary)' }}>
            <Layers className="w-7 h-7 text-purple-400" />
            {t('categories.title') || 'Preču un pakalpojumu katalogs'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Viss vienuviet — no auto līdz nekustamajiem īpašumiem un ikdienas precēm
          </p>
        </div>
      </div>

      {/* Main 2-Column Desktop Taxonomy Layout (Fast SS.lv tree + Modern Visuals) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Root Sectors (Sticky) */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider block px-3 mb-2" style={{ color: 'var(--text-tertiary)' }}>
            Nozares & Galvenās Kategorijas
          </span>
          <div className="space-y-1.5">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.name] || Smartphone;
              const isActive = cat.id === activeCategoryId;
              const displayName = getLocalizedName(cat);

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`w-full text-left flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-purple-600/10 border-purple-500/50 text-purple-300 font-bold shadow-sm'
                      : 'hover:bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)]'
                  }`}
                  style={{
                    backgroundColor: isActive ? undefined : 'var(--bg-surface)',
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isActive
                          ? 'bg-purple-600 text-white'
                          : 'bg-purple-500/10 text-purple-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm truncate">{displayName}</span>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isActive ? 'translate-x-0.5 text-purple-400' : 'text-gray-500'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Multi-Level Subcategories & Attribute Leaves */}
        <div className="lg:col-span-8">
          {activeCategory ? (
            <div
              className="rounded-2xl border p-6 sm:p-8 space-y-8"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border)',
              }}
            >
              {/* Active Category Header */}
              <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {getLocalizedName(activeCategory)}
                  </h2>
                  <span className="text-xs text-purple-400 font-medium">
                    Kataloga ceļš: {activeCategory.slug}
                  </span>
                </div>
                <Link
                  href={`/listings?category=${encodeURIComponent(activeCategory.slug || activeCategory.id)}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-sm"
                >
                  Skatīt visus sludinājumus <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Subcategories Grid */}
              {activeCategory.subcategories && activeCategory.subcategories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeCategory.subcategories.map((sub) => {
                    const subDisplayName = getLocalizedName(sub);

                    return (
                      <div
                        key={sub.id}
                        className="rounded-xl border p-4 space-y-3"
                        style={{
                          backgroundColor: 'var(--bg-elevated)',
                          borderColor: 'var(--border)',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <Link
                            href={`/listings?category=${encodeURIComponent(sub.slug || sub.id)}`}
                            className="font-bold text-sm hover:text-purple-400 transition-colors flex items-center gap-1.5"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            <span>{subDisplayName}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                          </Link>
                          <span className="text-[10px] px-2 py-0.5 rounded font-mono" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-tertiary)' }}>
                            {sub.items?.length || 0} apakšgrupas
                          </span>
                        </div>

                        {/* 3rd/4th Level Leaves (Brands, Models, Types) */}
                        {sub.items && sub.items.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {sub.items.map((leaf) => (
                              <Link
                                key={leaf.id}
                                href={`/listings?category=${encodeURIComponent(leaf.slug || leaf.id)}`}
                                className="text-xs px-2.5 py-1 rounded-lg border hover:border-purple-500/40 hover:text-purple-300 transition-all"
                                style={{
                                  backgroundColor: 'var(--bg-surface)',
                                  borderColor: 'var(--border)',
                                  color: 'var(--text-secondary)',
                                }}
                              >
                                {leaf.name}
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs italic" style={{ color: 'var(--text-tertiary)' }}>
                            Tiešās kategorijas sludinājumi pieejami meklēšanā.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
                  <p className="text-sm">Šajā kategorijā pašlaik nav papildu apakškatalogu.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
              Izvēlieties kategoriju no saraksta
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
