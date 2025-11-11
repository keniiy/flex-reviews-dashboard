'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { Section } from '@/components/layout/section';
import { ReviewCard } from '@/components/review/review-card';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  ChevronDown,
  Clock,
  Filter,
  MessageSquare,
  Star,
  TrendingUp,
} from 'lucide-react';
import { NavHeader } from '@/components/nav-header';
import type { ListingReviews, ReviewsApiResponse, ReviewsTotals } from '@/modules/reviews/types';
import { filterReviews, sortReviews } from '@/modules/reviews/service';

const ratingOptions = [
  { label: 'All', value: '0' },
  { label: '4+', value: '4' },
  { label: '4.5+', value: '4.5' },
  { label: '5★', value: '5' },
];

const timeframeOptions: { label: string; value: 'all' | '30' | '90' | '365' }[] = [
  { label: 'All time', value: 'all' },
  { label: 'Last 30 days', value: '30' },
  { label: 'Last 90 days', value: '90' },
  { label: 'Last year', value: '365' },
];

const formatCategoryLabel = (category: string) => category.replace(/_/g, ' ');

export default function DashboardPage() {
  const [listings, setListings] = useState<ListingReviews[]>([]);
  const [totals, setTotals] = useState<ReviewsTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [minRating, setMinRating] = useState('0');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeframe, setTimeframe] = useState<'all' | '30' | '90' | '365'>('all');
  const [showApprovedOnly, setShowApprovedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');
  const [page, setPage] = useState(1);
  const [openListingId, setOpenListingId] = useState<string | null>(null);
  const pageSize = 2;

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/reviews/hostaway');
      if (!response.ok) {
        throw new Error('Unable to load reviews');
      }
      const data: ReviewsApiResponse = await response.json();
      if (!data.success) {
        throw new Error('Reviews API responded with an error');
      }
      setListings(data.listings);
      setTotals(data.totals);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    setPage(1);
    setOpenListingId(null);
  }, [
    minRating,
    selectedChannel,
    selectedCategory,
    timeframe,
    showApprovedOnly,
    sortBy,
    listings,
  ]);

  const handleApproval = async (reviewId: string, approved: boolean) => {
    const target = listings
      .flatMap((listing) => listing.reviews)
      .find((review) => review.id === reviewId);

    if (!target || target.approved === approved) {
      return;
    }

    const delta = approved ? 1 : -1;

    setListings((prev) =>
      prev.map((listing) => {
        if (!listing.reviews.some((review) => review.id === reviewId)) {
          return listing;
        }

        const updatedReviews = listing.reviews.map((review) =>
          review.id === reviewId ? { ...review, approved } : review
        );

        const insights = listing.insights
          ? {
              ...listing.insights,
              approvalRate:
                updatedReviews.length === 0
                  ? 0
                  :
                    updatedReviews.filter((review) => review.approved).length /
                    updatedReviews.length,
            }
          : listing.insights;

        return {
          ...listing,
          reviews: updatedReviews,
          insights,
        };
      })
    );

    setTotals((prev) =>
      prev
        ? {
            ...prev,
            approvedCount: prev.approvedCount + delta,
            pendingCount: Math.max(0, prev.pendingCount - delta),
          }
        : prev
    );

    try {
      const response = await fetch('/api/reviews/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, approved }),
      });

      if (!response.ok) {
        throw new Error('Approval API failed');
      }
    } catch (err) {
      console.error('Failed to update approval:', err);
      fetchReviews();
    }
  };

  const availableChannels = useMemo(() => {
    const channels = new Set<string>();
    listings.forEach((listing) => {
      listing.channels.forEach((channel) => channels.add(channel));
    });
    return Array.from(channels);
  }, [listings]);

  const categoryOptions = useMemo(() => {
    if (!totals) return [];
    return Object.keys(totals.categoryAverages).sort();
  }, [totals]);

  const channelBreakdownEntries = useMemo(() => {
    if (!totals) return [];
    return Object.entries(totals.channelBreakdown).sort(([, a], [, b]) => b - a);
  }, [totals]);

  const topCategories = useMemo(() => {
    if (!totals) return [];
    return Object.entries(totals.categoryAverages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4);
  }, [totals]);

  const filteredListingResults = useMemo(() => {
    return listings
      .map((listing) => {
        const filteredReviews = sortReviews(
          filterReviews(listing.reviews, {
            minRating: Number(minRating) > 0 ? Number(minRating) : undefined,
            channel: selectedChannel !== 'all' ? selectedChannel : undefined,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            timeframeDays: timeframe === 'all' ? undefined : Number(timeframe),
            approvedOnly: showApprovedOnly,
          }),
          sortBy,
          'desc'
        );

        return {
          listing,
          filteredReviews,
        };
      })
      .filter(({ filteredReviews }) => filteredReviews.length > 0);
  }, [
    listings,
    minRating,
    selectedChannel,
    selectedCategory,
    timeframe,
    showApprovedOnly,
    sortBy,
  ]);

  if (loading) {
    return (
      <>
        <NavHeader />
        <div className="flex items-center justify-center min-h-screen bg-bg-primary">
          <div className="text-lg text-fg">Loading reviews...</div>
        </div>
      </>
    );
  }

  const totalReviews = totals?.totalReviews ?? 0;
  const avgRating = totals?.avgRating ?? 0;
  const pendingCount = totals?.pendingCount ?? 0;
  const approvalRate =
    totals && totals.totalReviews > 0
      ? Math.round((totals.approvedCount / totals.totalReviews) * 100)
      : 0;

  const paginatedListings = filteredListingResults.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const listingCards = paginatedListings.map(({ listing, filteredReviews }) => {
    const isOpen = openListingId === listing.listingId;
    const trend = listing.insights?.recentTrend;
    const trendConfig: Record<
      string,
      { label: string; Icon: typeof ArrowUpRight; className: string }
    > = {
      improving: {
        label: "Improving",
        Icon: ArrowUpRight,
        className: "text-success",
      },
      declining: {
        label: "Declining",
        Icon: ArrowDownRight,
        className: "text-error",
      },
      stable: { label: "Stable", Icon: Clock, className: "text-muted" },
    };
    const trendMeta = trend ? trendConfig[trend] : null;

    return (
      <div key={listing.listingId} className="space-y-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-xl text-fg">
                  {listing.listingName}
                </CardTitle>
                <div className="flex items-center gap-3 mt-2 text-sm text-muted flex-wrap">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-semibold text-fg">
                      {listing.avgRating.toFixed(1)}
                    </span>
                  </div>
                  <span>
                    {filteredReviews.length} / {listing.totalReviews} reviews
                  </span>
                  <span>•</span>
                  <span>{listing.channels.join(", ")}</span>
                </div>
                {listing.insights && (
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted flex-wrap">
                    {listing.insights.topCategory && (
                      <span className="flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3 text-success" />
                        Top: {formatCategoryLabel(listing.insights.topCategory)}
                      </span>
                    )}
                    {listing.insights.lowestCategory && (
                      <span className="flex items-center gap-1">
                        <ArrowDownRight className="w-3 h-3 text-error" />
                        Watch: {formatCategoryLabel(listing.insights.lowestCategory)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-success" />
                      {Math.round(listing.insights.approvalRate * 100)}% approved
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {trendMeta && (
                  <Badge variant="outline" className={trendMeta.className}>
                    <trendMeta.Icon className="w-3 h-3 mr-1" />
                    {trendMeta.label}
                  </Badge>
                )}
                <Badge className="bg-brand-primary text-white">
                  {filteredReviews.filter((r) => !r.approved).length} pending
                </Badge>
                <Button
                  asChild
                  variant="outline"
                  className="border-border text-fg hover:bg-bg-surface"
                >
                  <Link href={`/property/${listing.listingId}`}>
                    View property page
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="border-border text-fg hover:bg-bg-surface"
                  onClick={() =>
                    setOpenListingId(isOpen ? null : listing.listingId)
                  }
                  aria-expanded={isOpen}
                  aria-controls={`listing-reviews-${listing.listingId}`}
                >
                  {isOpen ? 'Hide reviews' : 'Show reviews'}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {isOpen && (
          <div
            id={`listing-reviews-${listing.listingId}`}
            className="grid gap-4 border border-border rounded-2xl p-4"
          >
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                detailHref={`/reviews/${review.id}`}
                actions={{
                  onApprove: () => handleApproval(review.id, true),
                  onUnapprove: () => handleApproval(review.id, false),
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  });
  const hasVisibleListings = filteredListingResults.length > 0;

  return (
    <div className="min-h-screen bg-bg-primary">
      <NavHeader />

      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-fg">Reviews Dashboard</h1>
                <p className="text-muted mt-1">Track performance per property and curate testimonials</p>
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card className="bg-card border-border card-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted">Total Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-bold text-fg">{totalReviews}</div>
                  <MessageSquare className="w-5 h-5 text-brand-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border card-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted">Average Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-bold text-fg">{avgRating.toFixed(1)}</div>
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border card-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted">Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-bold text-fg">{listings.length}</div>
                  <TrendingUp className="w-5 h-5 text-brand-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-brand-primary to-brand-hover border-brand-primary card-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white">Pending Approval</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{pendingCount}</div>
                <div className="text-xs opacity-80">Approval rate {approvalRate}%</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <Card className="bg-card border-border xl:col-span-2">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-fg">
                  <Filter className="w-4 h-4 text-muted" />
                  Filters
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  <FilterSelect
                    label="Min Rating"
                    value={minRating}
                    onChange={(value) => setMinRating(value)}
                    options={ratingOptions}
                  />
                  <FilterSelect
                    label="Channel"
                    value={selectedChannel}
                    onChange={setSelectedChannel}
                    options={[
                      { label: 'All Channels', value: 'all' },
                      ...availableChannels.map((channel) => ({
                        label: channel,
                        value: channel,
                      })),
                    ]}
                  />
                  <FilterSelect
                    label="Category"
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    options={[
                      { label: 'All Categories', value: 'all' },
                      ...categoryOptions.map((category) => ({
                        label: formatCategoryLabel(category),
                        value: category,
                      })),
                    ]}
                  />
                  <FilterSelect
                    label="Timeframe"
                    value={timeframe}
                    onChange={(value) =>
                      setTimeframe(value as typeof timeframe)
                    }
                    options={timeframeOptions}
                  />
                  <FilterSelect
                    label="Sort by"
                    value={sortBy}
                    onChange={(value) => setSortBy(value as 'date' | 'rating')}
                    options={[
                      { label: 'Date', value: 'date' },
                      { label: 'Rating', value: 'rating' },
                    ]}
                  />
                  <label className="flex items-center gap-2 text-sm text-muted">
                    <input
                      type="checkbox"
                      checked={showApprovedOnly}
                      onChange={(e) => setShowApprovedOnly(e.target.checked)}
                      className="w-4 h-4"
                    />
                    Approved only
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm text-muted">Channel mix</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {channelBreakdownEntries.length === 0 && (
                  <p className="text-sm text-muted">No channel data available</p>
                )}
                {channelBreakdownEntries.map(([channel, count]) => {
                  const pct =
                    totals && totals.totalReviews > 0
                      ? Math.round((count / totals.totalReviews) * 100)
                      : 0;
                  return (
                    <div key={channel} className="space-y-1">
                      <div className="flex items-center justify-between text-sm text-fg">
                        <span className="capitalize">{channel}</span>
                        <span className="text-muted">{pct}%</span>
                      </div>
                      <div className="w-full bg-border rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-brand-primary to-brand-light"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm text-muted">Top performing categories</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {topCategories.length === 0 && (
                <p className="text-sm text-muted">Not enough data yet</p>
              )}
              {topCategories.map(([category, rating]) => (
                <div key={category} className="bg-bg-surface rounded-lg p-4">
                  <div className="text-xs uppercase text-muted tracking-wide mb-2">
                    {formatCategoryLabel(category)}
                  </div>
                  <div className="text-2xl font-semibold text-fg">{rating.toFixed(1)}</div>
                  <div className="text-xs text-muted">/ 10</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Section
            title="Properties & reviews"
            description="Filter, triage, and publish reviews for each listing."
          >
            <div className="space-y-6">
              {hasVisibleListings ? (
                listingCards
              ) : (
                <Card className="bg-card border-border">
                  <CardContent className="py-12 text-center text-muted">
                    No reviews match the selected filters. Try relaxing them to
                    see more activity.
                  </CardContent>
                </Card>
              )}
            </div>
            <Pagination
              page={page}
              pageSize={pageSize}
              totalItems={filteredListingResults.length}
              onPageChange={setPage}
              className="mt-6"
            />
          </Section>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-muted">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-bg-surface border border-border rounded-lg text-sm text-fg"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
