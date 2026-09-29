import { Metadata } from 'next';
import { buildTrilingualMetadata, BRAND } from '@/app/lib/seo';
import { prisma } from '@/app/lib/prisma';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MapPin, Star, Shield } from 'lucide-react';
import { notFound } from 'next/navigation';
import { ListingRatingsSection } from '@/components/listing-ratings-section';
import { ChatInitiateButton } from '@/components/chat-initiate-button';

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
        select: { id: true, score: true, comment: true, createdAt: true, buyer: { select: { name: true } } },
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
            <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-[#12121a] border border-[#1f1f2e]">
              {listing.images && listing.images.length > 0 ? (
                <Image src={listing.images[0]} alt={listing.title} width={800} height={500} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#12121a] to-[#1f1f2e] text-[#55556a]">
                  {listing.title}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-4 bg-[#12121a] border border-[#1f1f2e] p-6 rounded-2xl">
              <div className="flex items-center gap-3">
                {listing.category && (
                  <span className="inline-block bg-[#7c3aed]/10 text-[#a78bfa] text-xs rounded-lg px-2.5 py-1 font-medium">
                    {listing.category.name}
                  </span>
                )}
                <span className="text-[#55556a] text-[15px]">{formattedDate}</span>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">{listing.title}</h1>
              <div className="text-4xl font-bold tracking-tighter text-white">{price}</div>
            </div>

            {/* Description */}
            <div className="bg-[#12121a] border border-[#1f1f2e] rounded-2xl p-6 text-[#8888a0] text-[15px] leading-relaxed">
              <h2 className="text-lg font-semibold text-white mb-3">Apraksts</h2>
              {listing.description}
            </div>

            {/* Ratings & Feedback Section */}
            <ListingRatingsSection
              listingId={listing.id}
              sellerId={listing.authorId}
              sellerName={listing.author?.name}
              initialRatings={listing.ratings}
            />
          </div>
          
          {/* Sidebar - Author / Contact */}
          <div className="lg:col-span-1">
             <div className="sticky top-24 bg-[#12121a] border border-[#1f1f2e] rounded-2xl p-6 space-y-4">
                 <h3 className="font-semibold text-white">Pārdevējs</h3>
                 <div className="text-[#8888a0]">{listing.author?.name || 'Anonīms lietotājs'}</div>
                 <ChatInitiateButton
                   listingId={listing.id}
                   sellerId={listing.authorId}
                   listingTitle={listing.title}
                   listingPrice={Number(listing.price)}
                   listingImage={listing.images && listing.images.length > 0 ? listing.images[0] : undefined}
                   sellerName={listing.author?.name || undefined}
                   className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
                 />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
