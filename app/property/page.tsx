'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NavHeader } from '@/components/nav-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FALLBACK_PHOTOS, buildPhotoUrl } from '@/components/property/photo-gallery';
import type { ListingReviews, ReviewsApiResponse } from '@/modules/reviews/types';
import { Star } from 'lucide-react';
import { MarketingHero } from '@/components/marketing/hero';
import { Section } from '@/components/layout/section';
import { Pagination } from '@/components/ui/pagination';

export default function PropertyIndexPage() {
  const [listings, setListings] = useState<ListingReviews[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch('/api/reviews/hostaway');
        const data: ReviewsApiResponse = await response.json();
        if (data.success) {
          setListings(data.listings);
        }
      } catch (error) {
        console.error('Failed to load listings', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const paginatedListings = listings.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen bg-bg-primary text-fg">
      <NavHeader />
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <MarketingHero
          title="FLEX LIVING — MADE EASY"
          subtitle="Furnished Apartments designed with you in mind. All you have to do is unpack your bags and start living."
          backgroundImage="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
        />

        <Section
          title="Our top properties"
          description="Hand-picked homes based on guest feedback."
          actions={
            <Button asChild className="bg-gradient-to-r from-brand-primary to-brand-hover text-white">
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          }
        >
          {loading ? (
            <p className="text-muted">Loading listings…</p>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {paginatedListings.map((listing, index) => (
                  <Card key={listing.listingId} className="bg-card border-border overflow-hidden rounded-3xl shadow-sm">
                    <div className="relative h-56 overflow-hidden">
                      <Image
                        src={buildPhotoUrl(FALLBACK_PHOTOS[(index + (page - 1) * pageSize) % FALLBACK_PHOTOS.length], 1200)}
                        alt={listing.listingName}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover"
                      />
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <Badge className="bg-accent-red border-none text-white px-4 py-1 rounded-full text-xs uppercase tracking-wide">
                          All listings
                        </Badge>
                        <span className="bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                          {listing.avgRating.toFixed(2)}
                          <Star className="w-4 h-4 fill-current" />
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">{listing.listingName}</h3>
                        <p className="text-sm text-muted">
                          {listing.totalReviews} reviews · {listing.channels.join(', ')}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(listing.categoryAverages)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 3)
                          .map(([category]) => (
                            <span
                              key={category}
                              className="px-3 py-1 rounded-full bg-bg-surface border border-border text-xs capitalize"
                            >
                              {category.replace(/_/g, ' ')}
                            </span>
                          ))}
                      </div>
                      <Button asChild className="w-full bg-gradient-to-r from-brand-primary to-brand-hover text-white">
                        <Link href={`/property/${listing.listingId}`}>View property</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Pagination
                page={page}
                pageSize={pageSize}
                totalItems={listings.length}
                onPageChange={setPage}
                className="mt-6"
              />
            </>
          )}
        </Section>

        <Section
          id="about"
          title="About Flex Living"
          description="We curate fully furnished apartments across London for business and leisure stays. Expect seamless digital check-in, hotel-grade housekeeping, and concierge support."
          className="rounded-3xl bg-card border border-border p-8 space-y-4"
        >
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <Stat label="Properties" value={`${listings.length || 40}+`} />
            <Stat label="Average rating" value={listings.length ? (listings.reduce((sum, l) => sum + l.avgRating, 0) / listings.length).toFixed(1) : '4.8'} />
            <Stat label="City coverage" value="Zones 1-3" />
          </div>
        </Section>

        <section id="contact" className="rounded-3xl bg-brand-primary text-white p-8 space-y-4">
          <h3 className="text-2xl font-semibold">Contact our team</h3>
          <p className="text-white/80">
            Need bespoke stay lengths, unit availability, or enterprise pricing? Our guest experience team is available 24/7.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" asChild className="bg-white text-brand-primary hover:bg-white/90">
              <a href="mailto:bookings@flexliving.uk">bookings@flexliving.uk</a>
            </Button>
            <Button variant="ghost" asChild className="text-white hover:bg-white/10">
              <a href="tel:+442033228899">+44 20 3322 8899</a>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg-surface rounded-2xl p-4 border border-border/60">
      <div className="text-xs uppercase tracking-wide text-muted mb-1">{label}</div>
      <div className="text-xl font-semibold text-fg">{value}</div>
    </div>
  );
}
