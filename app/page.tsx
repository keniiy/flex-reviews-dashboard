'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NavHeader } from '@/components/nav-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { ListingReviews, ReviewsApiResponse, ReviewsTotals, ReviewsSourceMeta } from '@/modules/reviews/types';
import { FALLBACK_PHOTOS, buildPhotoUrl } from '@/components/property/photo-gallery';
import { Star, ArrowRight } from 'lucide-react';
import { MarketingHero } from '@/components/marketing/hero';
import { Section } from '@/components/layout/section';
import { CTACard } from '@/components/marketing/cta-card';
import { Pagination } from '@/components/ui/pagination';

export default function HomePage() {
  const [listings, setListings] = useState<ListingReviews[]>([]);
  const [totals, setTotals] = useState<ReviewsTotals | null>(null);
  const [, setSourceMeta] = useState<ReviewsSourceMeta | null>(null);
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
          setTotals(data.totals);
          setSourceMeta(data.source);
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
          title="Operational command center for Flex Living reviews."
          subtitle="Preview live KPIs, spot pending approvals, and jump straight into the dashboard to curate what guests see."
          backgroundImage="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <Button
              asChild
              className="bg-white text-gray-900 hover:bg-white/90 font-semibold px-6 py-6 rounded-2xl"
            >
              <Link href="/dashboard">
                Open dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 bg-white/10 rounded-2xl p-4 backdrop-blur mt-4">
            {[
              { label: 'Properties', value: totals ? listings.length : '—' },
              { label: 'Pending approvals', value: totals ? totals.pendingCount : '—' },
              { label: 'Avg rating', value: totals ? totals.avgRating.toFixed(1) : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/15 rounded-xl px-3 py-2">
                <div className="text-white/70 text-xs uppercase tracking-wide mb-1">
                  {label}
                </div>
                <div className="text-xl font-semibold text-white">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </MarketingHero>

        <Section
          title="Dashboard snapshot"
          description="A glance at the KPIs you’ll manage once you open the dashboard."
        >
          {totals ? (
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-2">
                  <div className="text-xs uppercase text-muted tracking-wide">Total reviews</div>
                  <div className="text-3xl font-semibold">{totals.totalReviews}</div>
                  <p className="text-sm text-muted">Across {listings.length} properties</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-2">
                  <div className="text-xs uppercase text-muted tracking-wide">Pending approvals</div>
                  <div className="text-3xl font-semibold text-accent-red">{totals.pendingCount}</div>
                  <p className="text-sm text-muted">
                    {totals.approvedCount} approved · {Math.round((totals.approvedCount / Math.max(1, totals.totalReviews)) * 100)}% publish-ready
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-3">
                  <div className="text-xs uppercase text-muted tracking-wide">Channel mix</div>
                  {Object.entries(totals.channelBreakdown)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([channel, count]) => {
                      const pct = Math.round((count / totals.totalReviews) * 100);
                      return (
                        <div key={channel}>
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">{channel}</span>
                            <span className="text-muted">{pct}%</span>
                          </div>
                          <div className="w-full bg-border rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-white/70" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-muted">Syncing dashboard snapshot…</CardContent>
            </Card>
          )}
        </Section>

        <div className="grid gap-6 md:grid-cols-2">
          <CTACard
            title="Open the dashboard"
            body="Approve guest reviews, audit channel performance, and keep the property pages on-message."
            href="/dashboard"
            buttonLabel="Open dashboard"
          />
          <CTACard
            title="Preview property catalogue"
            body="Review how your approved testimonials surface on guest-facing listings before publishing updates."
            href="/property"
            buttonLabel="Preview listings"
            variant="secondary"
          />
        </div>

        <Section
          title="Your featured listings"
          description="Internal sample pulled from the reviews dataset. Dashboard approvals instantly shape these cards."
          actions={
            <Button asChild variant="outline" className="border-border text-fg">
              <Link href="/property">
                Manage listings
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
                  : paginated.map((listing, index) => {
                      const approvedReview =
                        listing.reviews.find((review) => review.approved) ?? listing.reviews[0];
                      const pendingCount = listing.reviews.filter((review) => !review.approved).length;

                      return (
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
                            <span className="bg-accent-red text-white text-xs uppercase tracking-wide px-3 py-1 rounded-full">
                              All listings
                            </span>
                            <span className="bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                              {listing.avgRating.toFixed(1)}
                              <Star className="w-4 h-4 fill-current" />
                            </span>
                            {pendingCount > 0 && (
                              <span className="bg-white/90 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
                                {pendingCount} pending
                              </span>
                            )}
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
                          {approvedReview && (
                            <blockquote className="bg-bg-surface border border-border rounded-2xl p-4 text-sm text-muted">
                              <p className="max-h-24 overflow-hidden">&ldquo;{approvedReview.review}&rdquo;</p>
                              <span className="mt-2 block text-xs uppercase tracking-wide text-fg">
                                {approvedReview.guestName}
                              </span>
                            </blockquote>
                          )}
                          <div className="flex flex-col gap-2">
                            <Button
                              asChild
                              className="w-full bg-gradient-to-r from-brand-primary to-brand-hover text-white"
                            >
                              <Link href={`/property/${listing.listingId}`}>View property</Link>
                            </Button>
                            <Button
                              asChild
                              variant="outline"
                              className="w-full border-border text-fg hover:bg-bg-surface"
                            >
                              <Link href={`/dashboard?listing=${listing.listingId}`}>
                                Manage in dashboard
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      );
                    })}
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
