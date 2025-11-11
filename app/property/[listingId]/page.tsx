'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Star } from "lucide-react";
import { NavHeader } from "@/components/nav-header";
import { PhotoGallery } from "@/components/property/photo-gallery";
import { BookingWidget } from "@/components/property/booking-widget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ListingReviews } from "@/modules/reviews/types";

const AMENITIES = [
  "Free WiFi",
  "Private living room",
  "High-speed internet",
  "Washer & dryer",
];

export default function PropertyPage() {
  const params = useParams();
  const listingId = params.listingId as string;
  const [listing, setListing] = useState<ListingReviews | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProperty = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/reviews/hostaway");
        const data = await response.json();

        if (data.success) {
          const found = data.listings.find(
            (l: ListingReviews) => l.listingId === listingId
          );
          setListing(found || null);
        }
      } catch (error) {
        console.error("Failed to fetch property:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [listingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary text-fg">
        <NavHeader />
        <div className="flex items-center justify-center py-24 text-lg">
          Loading property...
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-bg-primary text-fg">
        <NavHeader />
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <p className="text-xl">Property not found</p>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const approvedReviews = listing.reviews.filter((r) => r.approved);
  const formatCategoryLabel = (category: string) => category.replace(/_/g, " ");

  return (
    <div className="min-h-screen bg-bg-primary text-fg">
      <NavHeader />

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <nav className="text-sm text-muted flex items-center gap-2">
          <Link href="/" className="hover:text-brand-primary">
            Home
          </Link>
          <span>/</span>
          <Link href="/property" className="hover:text-brand-primary">
            Properties
          </Link>
          <span>/</span>
          <span className="text-fg">{listing.listingName}</span>
        </nav>
        <PhotoGallery propertyName={listing.listingName} rating={listing.avgRating} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-8">
            <div className="bg-card border border-border rounded-3xl p-8 space-y-6">
              <div className="flex flex-col gap-4">
                <Badge className="bg-[#c82921] border-none text-white px-4 py-1 rounded-full text-xs uppercase tracking-wide w-fit">
                  All listings
                </Badge>
                <h1 className="text-3xl font-bold">{listing.listingName}</h1>
                <div className="flex items-center gap-4 text-muted flex-wrap text-sm">
                  <span>Apartment</span>
                  <span>•</span>
                  <span>4 guests</span>
                  <span>•</span>
                  <span>1 bedroom</span>
                  <span>•</span>
                  <span>1 bathroom</span>
                </div>
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span>{listing.avgRating.toFixed(1)}</span>
                  <span className="text-muted text-base font-normal">
                    · {listing.totalReviews} reviews
                  </span>
                </div>
              </div>

              <p className="text-muted leading-relaxed">
                This spacious apartment in {listing.listingName.split(' - ')[1] || 'central London'} combines modern
                interiors with thoughtful amenities, weekly housekeeping and concierge support.
              </p>

              <div className="flex flex-wrap gap-3">
                {AMENITIES.map((amenity) => (
                  <span
                    key={amenity}
                    className="px-4 py-2 rounded-full bg-bg-surface border border-border text-sm"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            <div id="reviews" className="bg-card border border-border rounded-3xl p-8 space-y-8">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                <h2 className="text-2xl font-bold">
                  {listing.avgRating.toFixed(1)} · {approvedReviews.length} approved reviews
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {Object.entries(listing.categoryAverages)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 6)
                  .map(([category, rating]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-muted capitalize">
                        {formatCategoryLabel(category)}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-border-light rounded-full h-1">
                          <div
                            className="h-1 rounded-full bg-brand-primary"
                            style={{ width: `${rating * 10}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-8 text-fg">
                          {rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>

              {approvedReviews.length === 0 ? (
                <div className="text-center py-12 bg-bg-surface rounded-lg">
                  <p className="text-muted">No approved reviews yet</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {approvedReviews.slice(0, 6).map((review) => (
                    <div key={review.id} className="pb-8 border-b border-border last:border-0">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center text-white font-semibold flex-shrink-0 uppercase">
                          {review.guestName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <div className="font-semibold">{review.guestName}</div>
                            <div className="text-sm text-muted">
                              {new Date(review.submittedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                              })}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.round(review.rating)
                                    ? 'text-amber-500 fill-amber-500'
                                    : 'text-border'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-muted leading-relaxed">{review.review}</p>
                          <Button
                            asChild
                            variant="ghost"
                            className="text-brand-primary hover:text-brand-primary/80 px-0"
                          >
                            <Link href={`/reviews/${review.id}`}>View review details</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {approvedReviews.length > 6 && (
                    <Button
                      variant="outline"
                      className="w-full border-brand-primary text-brand-primary hover:bg-brand-primary/5"
                    >
                      Show all {approvedReviews.length} reviews
                    </Button>
                  )}
                </div>
              )}
            </div>
          </section>

          <div className="lg:col-span-1">
            <BookingWidget propertyName={listing.listingName} avgRating={listing.avgRating} />
          </div>
        </div>
      </main>
    </div>
  );
}
