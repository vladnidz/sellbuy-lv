'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RatingStars } from '@/components/rating-stars';
import { RatingCard } from '@/components/rating-card';
import { ArrowLeft, MapPin } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  averageRating: number;
  totalRatings: number;
  listings: Array<{
    id: string;
    title: string;
    price: number;
    images: string[];
    city: string | null;
    createdAt: string;
    category: { name: string };
  }>;
  sellerRatings: Array<{
    id: string;
    score: number;
    comment: string | null;
    createdAt: string;
    buyer: { id: string; name: string | null };
    listing: { id: string; title: string };
  }>;
}

export default function ProfilePage() {
  const params = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/users/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchProfile();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Lietotājs nav atrasts</h1>
          <p className="text-white/50 mb-4">Šis lietotājs neeksistē.</p>
          <Link href="/">
            <Button variant="outline" className="border-white/20 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Atpakaļ
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/listings" className="text-sm text-white/50 hover:text-white mb-4 inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Atpakaļ uz sludinājumiem
        </Link>

        <Card className="glass-morphism border-white/10 bg-white/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white">
                {(profile.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-1">
                  {profile.name || 'Lietotājs'}
                </h1>
                <div className="flex items-center gap-3 mb-3">
                  <RatingStars score={Math.round(profile.averageRating)} size="md" />
                  <span className="text-white/60">
                    {profile.averageRating > 0
                      ? `${profile.averageRating} (${profile.totalRatings} vērtējumi)`
                      : 'Nav vērtējumu'}
                  </span>
                </div>
                <div className="flex gap-4">
                  <Badge variant="secondary" className="bg-white/10 text-white/70">
                    {profile.listings.length} sludinājumi
                  </Badge>
                  <Badge variant="secondary" className="bg-white/10 text-white/70">
                    Kopš {new Date(profile.listings[0]?.createdAt || '2026-01-01').toLocaleDateString('lv-LV', { year: 'numeric', month: 'long' })}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listings */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Sludinājumi</h2>
        {profile.listings.length === 0 ? (
          <Card className="glass-morphism border-white/10 bg-white/5">
            <CardContent className="p-8 text-center">
              <p className="text-white/50">Nav sludinājumu</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.listings.map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`}>
                <Card className="glass-morphism border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-600/20 flex items-center justify-center">
                        {listing.images.length > 0 ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ) : (
                          <span className="text-2xl">📷</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white truncate">
                          {listing.title}
                        </h3>
                        <p className="text-lg font-bold text-violet-400 mt-1">
                          €{Number(listing.price).toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {listing.city && (
                            <span className="text-xs text-white/40 flex items-center">
                              <MapPin className="h-3 w-3 mr-0.5" />
                              {listing.city}
                            </span>
                          )}
                          <span className="text-xs text-white/40">
                            {listing.category.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Reviews */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Atsauksmes</h2>
        {profile.sellerRatings.length === 0 ? (
          <Card className="glass-morphism border-white/10 bg-white/5">
            <CardContent className="p-8 text-center">
              <p className="text-white/50">Nav atsauksmju</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {profile.sellerRatings.map((rating) => (
              <RatingCard
                key={rating.id}
                score={rating.score}
                comment={rating.comment}
                reviewerName={rating.buyer.name}
                date={rating.createdAt}
                listingTitle={rating.listing.title}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
