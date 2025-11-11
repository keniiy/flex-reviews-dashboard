'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { NavHeader } from '@/components/nav-header';
import { ReviewCard } from '@/components/review/review-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PhotoGallery } from '@/components/property/photo-gallery';
import { BookingWidget } from '@/components/property/booking-widget';
import type { ListingReviews, Review, ReviewsApiResponse } from '@/modules/reviews/types';

export default function ReviewDetailPage() {
  const params = useParams<{ reviewId: string }>();
  const reviewId = params.reviewId;
  const [review, setReview] = useState<Review | null>(null);
  const [listing, setListing] = useState<ListingReviews | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewId]);

  const fetchReview = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/reviews/hostaway');
      const data: ReviewsApiResponse = await response.json();

      if (!data.success) {
        throw new Error('Failed to load review data');
      }

      let foundListing: ListingReviews | null = null;
      let foundReview: Review | null = null;

      for (const listingItem of data.listings) {
        const match = listingItem.reviews.find((r) => r.id === reviewId);
        if (match) {
          foundListing = listingItem;
          foundReview = match;
          break;
        }
      }

      if (!foundReview) {
        setError('Review not found');
        setReview(null);
        setListing(null);
        return;
      }

      setReview(foundReview);
      setListing(foundListing);
    } catch (err) {
      console.error('Failed to load review detail', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (approved: boolean) => {
    if (!review) return;
    try {
      await fetch('/api/reviews/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: review.id, approved }),
      });
      fetchReview();
    } catch (err) {
      console.error('Failed to update approval from detail page', err);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-muted gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          Loading review…
        </div>
      );
    }

    if (error || !review || !listing) {
      return (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center space-y-4">
            <p className="text-lg text-fg">{error ?? 'Review not found'}</p>
            <Button asChild variant="outline">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Button asChild variant="ghost" className="text-muted hover:text-fg px-0">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-border text-fg">
              <Link href={`/property/${listing.listingId}`}>Open property page</Link>
            </Button>
          </div>

          <ReviewCard
            review={review}
            actions={{
              onApprove: () => handleApproval(true),
              onUnapprove: () => handleApproval(false),
            }}
          />
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm text-muted">Property context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-lg font-semibold text-fg">{listing.listingName}</div>
                <p className="text-sm text-muted">
                  {listing.channels.join(', ')} · {listing.totalReviews} reviews
                </p>
              </div>
              <PhotoGallery propertyName={listing.listingName} rating={listing.avgRating} />
              <div className="text-sm text-muted">
                {listing.avgRating.toFixed(1)} overall ·{' '}
                {Math.round((listing.insights.approvalRate ?? 0) * 100)}% approved
              </div>
            </CardContent>
          </Card>

          <BookingWidget propertyName={listing.listingName} avgRating={listing.avgRating} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <NavHeader />
      <div className="max-w-7xl mx-auto px-6 py-10">{renderContent()}</div>
    </div>
  );
}
