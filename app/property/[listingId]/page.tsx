'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Users, Wifi, Check } from 'lucide-react';
import type { ListingReviews } from '@/modules/reviews/types';

export default function PropertyPage() {
  const params = useParams();
  const listingId = params.listingId as string;
  const [listing, setListing] = useState<ListingReviews | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperty();
  }, [listingId]);

  const fetchProperty = async () => {
    try {
      const response = await fetch('/api/reviews/hostaway');
      const data = await response.json();
      
      if (data.success) {
        const found = data.listings.find(
          (l: ListingReviews) => l.listingId === listingId
        );
        setListing(found || null);
      }
    } catch (error) {
      console.error('Failed to fetch property:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="text-lg text-fg">Loading property...</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-bg-primary">
        <div className="text-xl text-fg mb-2">Property not found</div>
        <a href="/dashboard" className="text-brand-primary hover:underline">
          Back to dashboard
        </a>
      </div>
    );
  }

  const approvedReviews = listing.reviews.filter(r => r.approved);

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="bg-gradient-to-br from-brand-primary to-brand-hover py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-2 text-brand-light mb-4">
            <a href="/dashboard" className="hover:underline">Dashboard</a>
            <span>/</span>
            <span className="text-white">{listing.listingName}</span>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            {listing.listingName}
          </h1>
          
          <div className="flex items-center gap-6 text-white">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-white" />
              <span className="text-2xl font-bold">{listing.avgRating}</span>
              <span className="text-brand-light">({listing.totalReviews} reviews)</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>London, UK</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-fg mb-4">About this property</h2>
                <p className="text-muted leading-relaxed">
                  Experience modern living in the heart of London. This beautifully appointed property 
                  offers all the amenities you need for a comfortable stay.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-2 text-fg">
                    <Users className="w-5 h-5 text-brand-primary" />
                    <span>Up to 4 guests</span>
                  </div>
                  <div className="flex items-center gap-2 text-fg">
                    <Wifi className="w-5 h-5 text-brand-primary" />
                    <span>High-speed WiFi</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-fg">Guest Reviews</h2>
                <Badge className="bg-brand-primary text-white">
                  {approvedReviews.length} approved
                </Badge>
              </div>

              {approvedReviews.length === 0 ? (
                <Card className="bg-card border-border">
                  <CardContent className="pt-6">
                    <p className="text-muted text-center py-8">
                      No approved reviews yet. Check back soon!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {approvedReviews.map((review) => (
                    <Card key={review.id} className="bg-card border-border">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-brand-hover flex items-center justify-center text-white font-semibold text-lg">
                              {review.guestName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="font-semibold text-fg text-lg">
                                {review.guestName}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating
                                          ? 'text-amber-400 fill-amber-400'
                                          : 'text-border'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-muted">
                                  {new Date(review.submittedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-fg leading-relaxed">{review.review}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-fg mb-4">Rating Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(listing.categoryAverages)
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, rating]) => (
                      <div key={category}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted capitalize">
                            {category.replace('_', ' ')}
                          </span>
                          <span className="text-sm font-semibold text-fg">
                            {rating.toFixed(1)}
                          </span>
                        </div>
                        <div className="w-full bg-border rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-light"
                            style={{ width: `${rating * 10}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-brand-primary to-brand-hover border-brand-primary">
              <CardContent className="pt-6">
                <div className="text-center text-white">
                  <div className="text-4xl font-bold mb-2">{listing.avgRating}</div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-white" />
                    ))}
                  </div>
                  <div className="text-brand-light">
                    Based on {listing.totalReviews} reviews
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
