export const dynamic = "force-dynamic";
import { prisma } from "@/app/lib/prisma";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Grid, List, Filter, ChevronDown, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CategoryCard } from "./CategoryCard";
import { buildTrilingualMetadata } from "@/app/lib/seo";
import { BRAND } from "@/app/lib/seo";

export const metadata: Metadata = buildTrilingualMetadata("/categories", {
  lv: {
    title: "Kategorijas | SellBuy.lv",
    description:
      "Pārlūkojiet visas kategorijas SellBuy.lv. Transports, nekustamie īpašumi, elektronika, celtniecība, darbs, māja, apģērbi, bērniem un daudz kas cits.",
  },
  ru: {
    title: `Категории | ${BRAND}`,
    description:
      "Просмотр всех категорий SellBuy.lv. Транспорт, недвижимость, электроника, строительство, работа, дом, одежда, дети и многое другое.",
  },
  en: {
    title: `Categories | ${BRAND}`,
    description:
      "Browse all categories on SellBuy.lv. Vehicles, real estate, electronics, construction, jobs, home & garden, clothing, kids and more.",
  },
});

export interface CategoryWithCounts {
  id: string;
  name: string;
  path: string | null;
  parentId: string | null;
  children?: CategoryWithCounts[];
  _count?: {
    listings: number;
  };
}

async function getCategoriesWithCounts(): Promise<CategoryWithCounts[]> {
  // Fetch all categories with their children and listing counts
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    include: {
      children: {
        orderBy: { name: "asc" },
        include: {
          _count: { select: { listings: true } },
        },
      },
      _count: { select: { listings: true } },
    },
  });

  // Also get listing counts for parent categories that include children's listings
  const categoriesWithCounts = categories.map((cat) => ({
    ...cat,
    children: cat.children.map((child) => ({
      ...child,
      _count: { listings: child._count.listings },
    })),
    _count: { listings: cat._count.listings },
  }));

  return categoriesWithCounts as unknown as CategoryWithCounts[];
}

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCounts();

  // Calculate total listings across all categories
  const totalListings = categories.reduce((sum, cat) => {
    const childCount = cat.children?.reduce((s, c) => s + (c._count?.listings || 0), 0) || 0;
    return sum + (cat._count?.listings || 0) + childCount;
  }, 0);

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
              <Link href="/new-listing">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Pievienot Sludinājumu
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb / Back Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Atpakaļ uz sākumlapu
        </Link>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
            Visas Kategorijas
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg">
            Atrodiet to, ko meklējat, no {categories.length} galveno kategoriju ar apakškategorijām.
            Kopā {totalListings} aktīvi sludinājumi.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <Card className="bg-slate-900/30 border-slate-800/50 backdrop-blur-xl mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" aria-hidden="true" />
                <Input
                  placeholder="Meklēt kategorijas..."
                  className="pl-10 bg-slate-900/50 border-slate-700 h-12 text-lg"
                  id="category-search"
                  aria-label="Meklēt kategorijas"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="h-12 px-6 bg-slate-900 border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/10">
                  <Grid className="h-4 w-4 mr-2" aria-hidden="true" />
                  Rindas
                </Button>
                <Button variant="outline" className="h-12 px-6 bg-slate-900 border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/10">
                  <List className="h-4 w-4 mr-2" aria-hidden="true" />
                  Saraksts
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories Grid */}
        <div
          id="categories-grid"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          role="list"
          aria-label="Kategoriju saraksts"
        >
          {categories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} level={0} />
          ))}
        </div>

        {/* Empty state if no categories */}
        {categories.length === 0 && (
          <Card className="bg-slate-900/50 border-slate-800 py-20 text-center col-span-full">
            <CardContent>
              <div className="text-6xl mb-4">📂</div>
              <h3 className="text-2xl font-bold mb-2">Kategorijas nav atrastas</h3>
              <p className="text-slate-400 mb-6">Vēl nav izveidota neviens kategorija.</p>
              <Link href="/new-listing">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Būt pirmājam, kurš publicē sludinājumu
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Trust Footer Section */}
      <Card className="mx-4 sm:mx-6 lg:mx-8 mt-12 bg-gradient-to-br from-blue-950/50 to-indigo-950/50 border-blue-900/30">
        <CardContent className="pt-6 pb-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">Smart-ID</div>
              <div className="text-sm text-slate-300">Verificēti lietotāji</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">Escrow</div>
              <div className="text-sm text-slate-300">Droši darījumi</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">Omniva/DPD</div>
              <div className="text-sm text-slate-300">Ātra piegāde</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
          © 2026 SellBuy.lv — Viss Jūsu darījumiem
        </div>
      </footer>

      {/* Search filter script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const input = document.getElementById('category-search');
              const grid = document.getElementById('categories-grid');
              if (!input || !grid) return;
              
              const cards = grid.querySelectorAll('[role="listitem"]');
              
              input.addEventListener('input', function() {
                const query = this.value.toLowerCase().trim();
                cards.forEach(card => {
                  const text = card.textContent.toLowerCase();
                  const parent = card.closest('article');
                  if (parent) {
                    parent.style.display = text.includes(query) ? '' : 'none';
                  }
                });
              });
            })();
          `,
        }}
      />
    </div>
  );
}