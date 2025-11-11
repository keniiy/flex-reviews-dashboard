'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NavHeader } from '@/components/nav-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { ListingReviews, ReviewsApiResponse } from '@/modules/reviews/types';
import { FALLBACK_PHOTOS, buildPhotoUrl } from '@/components/property/photo-gallery';
import { Star, ArrowRight } from 'lucide-react';
import { MarketingHero } from '@/components/marketing/hero';
import { Section } from '@/components/layout/section';
import { CTACard } from '@/components/marketing/cta-card';
import { Pagination } from '@/components/ui/pagination';

export default function HomePage() {
  const [listings, setListings] = useState<ListingReviews[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 3;

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch('/api/reviews/hostaway');
        const data: ReviewsApiResponse = await response.json();
        if (data.success) {
          setListings(data.listings);
        }
      } catch (error) {
        console.error('Failed to load listings for home page', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const paginated = listings.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen bg-bg-primary text-fg">
      <NavHeader />

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <MarketingHero
          title="Reviews, insights, and guest stories in one place."
          subtitle="Curate high-confidence testimonials, monitor property performance, and preview the guest-facing experience without leaving the dashboard."
          backgroundImage="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
        >
          <div className="grid gap-3 sm:grid-cols-4 bg-white/10 rounded-2xl p-4 backdrop-blur">
            {[
              { label: 'Location', value: 'London' },
              { label: 'Check-In', value: 'Select' },
              { label: 'Check-Out', value: 'Select' },
              { label: 'Guests', value: '2' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/15 rounded-xl px-3 py-2">
                <div className="text-white/70 text-xs uppercase tracking-wide mb-1">
                  {label}
                </div>
                <div className="text-base font-semibold text-white">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </MarketingHero>

        <div className="grid gap-6 md:grid-cols-2">
          <CTACard
            title="Operations dashboard"
            body="Approve guest reviews, monitor channel performance, and surface testimonials that align with the Flex Living brand."
            href="/dashboard"
            buttonLabel="Open dashboard"
          />
          <CTACard
            title="Public property pages"
            body="Preview the guest-facing pages that inherit approved reviews and mirror the Flex Living marketing site."
            href="/property"
            buttonLabel="Explore listings"
            variant="secondary"
          />
        </div>

        <Section
          title="Featured properties"
          description="Automatically sourced from the reviews dataset."
          actions={
            <Button asChild variant="outline" className="border-border text-fg">
              <Link href="/property">
                View all listings
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          }
        >
          {loading ? (
            <p className="text-muted">Loading properties…</p>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {paginated.length === 0
                  ? Array.from({ length: 3 }).map((_, index) => (
                      <SkeletonCard key={index} />
                    ))
                  : paginated.map((listing, index) => (
                      <Card
                        key={listing.listingId}
                        className="bg-card border-border overflow-hidden rounded-3xl shadow-sm"
                      >
                        <div className="relative h-56">
                          <Image
                            src={buildPhotoUrl(
                              FALLBACK_PHOTOS[(index + (page - 1) * pageSize) % FALLBACK_PHOTOS.length],
                              1200
                            )}
                            alt={listing.listingName}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            className="object-cover"
                          />
                          <div className="absolute top-4 left-4 flex flex-col gap-2">
                            <span className="bg-[var(--color-accent-red)] text-white text-xs uppercase tracking-wide px-3 py-1 rounded-full">
                              All listings
                            </span>
                            <span className="bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                              {listing.avgRating.toFixed(1)}
                              <Star className="w-4 h-4 fill-current" />
                            </span>
                          </div>
                        </div>
                        <CardContent className="p-6 space-y-3">
                          <div>
                            <h3 className="text-lg font-semibold">{listing.listingName}</h3>
                            <p className="text-sm text-muted">
                              {listing.channels.join(', ')} · {listing.totalReviews} reviews
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-muted">
                            {Object.keys(listing.categoryAverages)
                              .slice(0, 3)
                              .map((category) => (
                                <span
                                  key={category}
                                  className="px-3 py-1 rounded-full bg-bg-surface border border-border"
                                >
                                  {category.replace(/_/g, ' ')}
                                </span>
                              ))}
                          </div>
                          <Button
                            asChild
                            className="w-full bg-gradient-to-r from-brand-primary to-brand-hover text-white"
                          >
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
              />
            </>
          )}
        </Section>
      </main>
    </div>
  );
}

function SkeletonCard() {
  return (
    <Card className="bg-card border-border rounded-3xl animate-pulse h-80">
      <CardContent className="p-6 space-y-4">
        <div className="h-32 bg-bg-surface rounded-2xl" />
        <div className="space-y-3">
          <div className="h-4 bg-bg-surface rounded" />
          <div className="h-3 bg-bg-surface rounded w-2/3" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 flex-1 bg-bg-surface rounded-full" />
          <div className="h-6 flex-1 bg-bg-surface rounded-full" />
        </div>
        <div className="h-10 bg-bg-surface rounded-lg" />
      </CardContent>
    </Card>
  );
}
