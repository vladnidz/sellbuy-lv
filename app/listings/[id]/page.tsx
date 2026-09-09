export const dynamic = "force-dynamic";
import { Metadata } from 'next';
import { buildTrilingualMetadata, BRAND } from '@/app/lib/seo';
import { prisma } from '@/app/lib/prisma';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, MapPin, MessageCircle, Star, Calendar, Shield } from 'lucide-react';
import { notFound } from 'next/navigation';

export async function generateMetadata(
  props: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await props.params;
  const listing = await prisma.listing.findUnique({
    where: { id },
  });

  if (!listing) return {};

  return buildTrilingualMetadata(`/listings/${id}`, {
    lv: { title: `${listing.title} | ${BRAND}`, description: listing.description || '' },
    ru: { title: `${listing.title} | ${BRAND}`, description: listing.description || '' },
    en: { title: `${listing.title} | ${BRAND}`, description: listing.description || '' },
  });
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      category: true,
      author: { select: { id: true, name: true } },
      ratings: {
        where: { sellerId: { not: undefined } },
        select: { score: true, comment: true, createdAt: true, buyer: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!listing) {
    notFound();
  }

  const price = new Intl.NumberFormat('lv-LV', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(listing.price));

  const avgRating = listing.ratings.length > 0
    ? listing.ratings.reduce((sum, r) => sum + r.score, 0) / listing.ratings.length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container-app py-8">
        {/* Breadcrumb */}
        <Link
          href="/listings"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Atpakaļ uz sludinājumiem
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-surface-subtle">
              {listing.images.length > 0 && listing.images[0] ? (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-6xl opacity-20">📷</div>
                </div>
              )}
            </div>

            {/* Title & Meta */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                {listing.category && (
                  <Badge variant="secondary" className="bg-white/[0.06] text-white/60 border-0">
                    {listing.category.name}
                  </Badge>
                )}
                <span className="text-sm text-white/30 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(listing.createdAt).toLocaleDateString('lv-LV', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              <h1 className="text-3xl font-semibold text-white mb-3 tracking-tight">
                {listing.title}
              </h1>

              <p className="text-4xl font-bold text-white tracking-tight">
                {price}
              </p>
            </div>

            {/* Description */}
            <div className="card-subtle rounded-2xl p-6">
              <h2 className="text-lg font-medium text-white mb-4">Apraksts</h2>
              <p className="text-white/60 leading-relaxed whitespace-pre-wrap">
                {listing.description || 'Nav apraksta.'}
              </p>
            </div>

            {/* Location */}
            {listing.city && (
              <div className="flex items-center gap-2 text-white/50">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{listing.city}</span>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price card */}
            <div className="card-subtle rounded-2xl p-6">
              <p className="text-3xl font-bold text-white mb-6">{price}</p>
              <div className="space-y-3">
                <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white h-12 text-base font-medium">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Sazināties
                </Button>
                <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 h-12 text-base">
                  Piedāvāt cenu
                </Button>
              </div>
            </div>

            {/* Seller card */}
            <div className="card-subtle rounded-2xl p-6">
              <h3 className="text-sm font-medium text-white/40 mb-4">PĀRDEVĒJS</h3>
              <Link
                href={`/profile/${listing.author?.id}`}
                className="flex items-center gap-3 group"
              >
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center text-lg font-bold text-white/70">
                  {(listing.author?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-white group-hover:text-violet-300 transition-colors">
                    {listing.author?.name || 'Lietotājs'}
                  </p>
                  {avgRating > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-white/50">
                        {avgRating.toFixed(1)} ({listing.ratings.length})
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            </div>

            {/* Trust signal — not checklist theater */}
            <div className="rounded-2xl border border-violet-500/10 bg-violet-500/[0.03] p-6">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="h-5 w-5 text-violet-400" />
                <h3 className="font-medium text-white">Drošs darījums</h3>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                Visi darījumi caur SellBuy.lv ir aizsargāti ar Escrow sistēmu —
                nauda tiek atbrīvota tikai pēc preces saņemšanas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
