'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RatingStars } from '@/components/rating-stars';
import { RatingCard } from '@/components/rating-card';
import { ArrowLeft, MapPin, Package, Star, Calendar, Mail } from 'lucide-react';

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
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
            <div className="absolute inset-0 w-12 h-12 rounded-full border border-[var(--border)]" />
          </div>
          <p className="text-[var(--text-secondary)] text-sm">Ielādē profilu...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center">
            <span className="text-3xl">👤</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Lietotājs nav atrasts</h1>
          <p className="text-[var(--text-secondary)] mb-6">Šis lietotājs neeksistē.</p>
          <Link href="/">
            <Button variant="outline" className="border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Atpakaļ
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const lastListing = profile.listings[profile.listings.length - 1];
  const memberSinceDate = lastListing?.createdAt ? new Date(lastListing.createdAt) : null;

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Background Gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--accent)] opacity-5 blur-3xl rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500 opacity-5 blur-3xl rounded-full" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-8">
        {/* Back Link */}
        <Link href="/listings" className="inline-flex items-center text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Atpakaļ uz sludinājumiem
        </Link>

        {/* Profile Header Card */}
        <Card className="relative overflow-hidden border-[var(--border)] bg-[var(--bg-surface)]/80 backdrop-blur-xl mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent pointer-events-none" />
          <CardContent className="relative p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-indigo-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-[var(--accent)]/20">
                  {(profile.name || 'U').charAt(0).toUpperCase()}
                </div>
                {profile.averageRating >= 4.5 && (
                  <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-green-500 border-2 border-[var(--bg-surface)] flex items-center justify-center">
                    <Star className="h-3.5 w-3.5 text-white fill-white" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                  {profile.name || 'Lietotājs'}
                </h1>
                
                {/* Rating Row */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <RatingStars score={Math.round(profile.averageRating)} size="md" />
                    <span className="text-[var(--text-primary)] font-medium">
                      {profile.averageRating > 0 
                        ? profile.averageRating.toFixed(1) 
                        : 'Jauns'}
                    </span>
                  </div>
                  {profile.totalRatings > 0 && (
                    <span className="text-[var(--text-secondary)] text-sm">
                      ({profile.totalRatings} vērtējumi)
                    </span>
                  )}
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap gap-3">
                  <Badge variant="secondary" className="bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border)] px-3 py-1.5">
                    <Package className="h-3.5 w-3.5 mr-1.5 text-[var(--accent)]" />
                    {profile.listings.length} sludinājumi
                  </Badge>
                  <Badge variant="secondary" className="bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border)] px-3 py-1.5">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-[var(--accent)]" />
                    Kopš {memberSinceDate ? memberSinceDate.toLocaleDateString('lv-LV', { year: 'numeric', month: 'long' }) : 'Nesen'}
                  </Badge>
                </div>
              </div>

              {/* Contact Button */}
              <div className="hidden md:block">
                <Link href={`/messages/${profile.id}`}>
                  <Button className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-6 py-2.5 rounded-xl shadow-lg shadow-[var(--accent)]/20">
                    <Mail className="h-4 w-4 mr-2" />
                    Sazināties
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listings Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Sludinājumi</h2>
            {profile.listings.length > 0 && (
              <span className="text-sm text-[var(--text-secondary)]">
                {profile.listings.length} aktīvi
              </span>
            )}
          </div>

          {profile.listings.length === 0 ? (
            <Card className="border-[var(--border)] bg-[var(--bg-surface)]/50">
              <CardContent className="p-12 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center">
                  <Package className="h-6 w-6 text-[var(--text-muted)]" />
                </div>
                <p className="text-[var(--text-secondary)]">Nav aktīvu sludinājumu</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.listings.map((listing) => (
                <Link key={listing.id} href={`/listings/${listing.id}`}>
                  <Card className="group border-[var(--border)] bg-[var(--bg-surface)]/50 hover:bg-[var(--bg-surface)] hover:border-[var(--border-hover)] transition-all duration-200 cursor-pointer h-full overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Image */}
                        <div className="h-20 w-20 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center overflow-hidden flex-shrink-0">
                          {listing.images.length > 0 ? (
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <span className="text-2xl opacity-50">📷</span>
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
                            {listing.title}
                          </h3>
                          <p className="text-lg font-bold text-[var(--accent)] mt-1">
                            €{Number(listing.price).toFixed(2)}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {listing.city && (
                              <>
                                <span className="text-xs text-[var(--text-tertiary)] flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {listing.city}
                                </span>
                                <span className="text-[var(--text-muted)]">•</span>
                              </>
                            )}
                            <span className="text-xs text-[var(--text-tertiary)]">
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

        {/* Reviews Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Atsauksmes</h2>
            {profile.sellerRatings.length > 0 && (
              <span className="text-sm text-[var(--text-secondary)]">
                {profile.sellerRatings.length} atsauksmes
              </span>
            )}
          </div>

          {profile.sellerRatings.length === 0 ? (
            <Card className="border-[var(--border)] bg-[var(--bg-surface)]/50">
              <CardContent className="p-12 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center">
                  <Star className="h-6 w-6 text-[var(--text-muted)]" />
                </div>
                <p className="text-[var(--text-secondary)]">Vēl nav atsauksmju</p>
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

        {/* Mobile Contact Button */}
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-10">
          <Link href={`/messages/${profile.id}`}>
            <Button className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white py-3 rounded-xl shadow-lg shadow-[var(--accent)]/20">
              <Mail className="h-4 w-4 mr-2" />
              Sazināties ar pārdevēju
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
