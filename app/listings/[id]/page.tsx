import { Metadata } from 'next';
import { buildTrilingualMetadata, BRAND } from '@/app/lib/seo';
import { prisma } from '@/app/lib/prisma';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, MapPin, Star, Shield } from 'lucide-react';
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
      author: { select: { id: true, name: true, email: true } },
      ratings: {
        select: { score: true, comment: true, createdAt: true, buyer: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!listing) {
    notFound();
  }

  // Format Price
  const priceFormatter = new Intl.NumberFormat('lv-LV', {
    style: 'currency',
    currency: 'EUR',
  });
  const price = priceFormatter.format(Number(listing.price));

  // Format Date
  const formattedDate = new Intl.DateTimeFormat('lv-LV', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(listing.createdAt));

  // Avg Rating
  const avgRating = listing.ratings.length > 0
    ? listing.ratings.reduce((sum, r) => sum + r.score, 0) / listing.ratings.length
    : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5]">
      <div className="container mx-auto px-4 py-8">
        <Link href="/listings" className="flex items-center gap-2 text-[#8888a0] mb-8 text-[15px] font-semibold hover:text-[#f0f0f5]">
          <ArrowLeft className="w-4 h-4" /> Atpakaļ uz sludinājumiem
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-[#12121a]">
              {listing.images && listing.images.length > 0 ? (
                <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#12121a] to-[#1f1f2e] text-[#55556a]">
                  {listing.title}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {listing.category && (
                  <span className="inline-block bg-[#7c3aed]/10 text-[#a78bfa] text-xs rounded-lg px-2.5 py-1">
                    {listing.category.name}
                  </span>
                )}
                <span className="text-[#55556a] text-[15px]">{formattedDate}</span>
              </div>
              <h1 className="text-3xl font-semibold">{listing.title}</h1>
              <div className="text-4xl font-bold">{price}</div>
            </div>

            {/* Description */}
            <div className="bg-[#12121a] border border-[#1f1f2e] rounded-2xl p-6 text-[#8888a0] text-[15px]">
              <p>{listing.description}</p>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-[#55556a] text-[15px]">
              <MapPin className="w-4 h-4" /> {listing.city}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-[#12121a] border border-[#1f1f2e] rounded-2xl p-6 space-y-4">
              <div className="text-4xl font-bold">{price}</div>
              <div className="space-y-2">
                <Button className="w-full bg-[#7c3aed] text-white hover:bg-[#7c3aed]/90">Sazināties</Button>
                <Button variant="outline" className="w-full bg-transparent border-[#1f1f2e] text-[#8888a0] hover:bg-[#12121a]">Piedāvāt cenu</Button>
              </div>
            </div>

            {/* Seller Card */}
            <div className="bg-[#12121a] border border-[#1f1f2e] rounded-2xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7c3aed] to-indigo-500 flex items-center justify-center text-white font-bold">
                {(listing.author.name || 'U')[0].toUpperCase()}
              </div>
              <div>
                <Link href={`/profile/${listing.author.id}`} className="font-semibold text-[#f0f0f5]">
                  {listing.author.name || 'Nezināms lietotājs'}
                </Link>
                <div className="flex items-center gap-1 text-[#55556a] text-sm">
                  <Star className="w-4 h-4 text-[#7c3aed]" />
                  {avgRating.toFixed(1)}
                </div>
              </div>
            </div>

            {/* Trust Signal */}
            <div className="bg-[#12121a] border border-[#1f1f2e] rounded-2xl p-6 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <Shield className="w-5 h-5 text-[#7c3aed]" /> Drošs darījums
              </div>
              <p className="text-[#8888a0] text-[15px]">
                Visi darījumi caur SellBuy.lv ir aizsargāti ar Escrow — nauda tiek atbrīvota tikai pēc preces saņemšanas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
