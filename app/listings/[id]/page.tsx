export const dynamic = "force-dynamic";
import { prisma } from '@/app/lib/prisma';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Shield, Truck, MessageCircle, MapPin } from 'lucide-react';
import { notFound } from 'next/navigation';

interface CategoryWithPath {
  id: string;
  name: string;
  path: string;
  parentId: string | null;
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
    },
  });

  if (!listing) {
    notFound();
  }

  const price = new Intl.NumberFormat('lv-LV', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(listing.price));

  const images = listing.images && listing.images.length > 0 ? listing.images : [];
  const mainImage = images[0] || null;
  const galleryImages = images.slice(1, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Atpakaļ uz sākumlapu
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 aspect-square mb-4 relative">
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">
                  📦
                </div>
              )}
            </div>
            {galleryImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {galleryImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg overflow-hidden border border-slate-800 bg-slate-900/50 aspect-square relative"
                  >
                    <Image
                      src={img}
                      alt={`${listing.title} - ${idx + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="bg-blue-950 text-blue-300 border-blue-800">
                {listing.category?.name || 'Kategorija'}
              </Badge>
              {listing.category && (
                <span className="text-xs text-slate-500">
                  {String(
                    (listing.category as unknown as Partial<CategoryWithPath>).path ?? ''
                  ).replace(/\./g, ' › ')}
                </span>
              )}
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
              {listing.title}
            </h1>

            <div className="text-4xl font-bold text-blue-400 mb-6">{price}</div>

            <Card className="bg-slate-900/50 border-slate-800 mb-6">
              <CardHeader className="border-b border-slate-800">
                <CardTitle className="text-lg">Apraksts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {listing.description}
                </p>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card className="bg-slate-900/50 border-slate-800 mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-950 border border-blue-700 flex items-center justify-center text-xl font-bold text-blue-400">
                    {(listing.author?.name || 'A')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold">
                      {listing.author?.name || 'Anonīms pārdevējs'}
                    </div>
                    <div className="text-sm text-slate-400 flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5 text-green-400" />
                      Smart-ID verificēts
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Rakstīt pārdevējam
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-blue-600 text-blue-400 hover:bg-blue-950"
              >
                <Truck className="h-4 w-4 mr-2" />
                Omniva/DPD piegāde
              </Button>
            </div>

            {/* Trust Footer */}
            <div className="mt-6 flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-green-400" />
                Escrow aizsardzība
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                Visā Latvijā
              </span>
            </div>
          </div>
        </div>

        {/* Related / Safety */}
        <Card className="mt-12 bg-gradient-to-br from-blue-950/50 to-indigo-950/50 border-blue-900/30">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-blue-400 mb-3">
              Drošības padomi
            </h2>
            <ul className="text-sm text-slate-300 space-y-2">
              <li>• Izmantojiet escrow sistēmu — nauda atbrīvojama tikai pēc preces saņemšanas.</li>
              <li>• Pārbaudiet pārdevēja Smart-ID verifikāciju pirms darījuma.</li>
              <li>• Izvairieties no maksājumiem ārpus platformas.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
