'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, TrendingUp, CheckCircle, XCircle, Filter } from 'lucide-react';
import { NavHeader } from '@/components/nav-header';
import type { ListingReviews, Review } from '@/modules/reviews/types';
import { filterReviews, sortReviews } from '@/modules/reviews/service';

export default function DashboardPage() {
  const [listings, setListings] = useState<ListingReviews[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [showApprovedOnly, setShowApprovedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews/hostaway');
      const data = await response.json();
      if (data.success) {
        setListings(data.listings);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (reviewId: string, approved: boolean) => {
    try {
      const response = await fetch('/api/reviews/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, approved }),
      });

      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Failed to update approval:', error);
    }
  };

  const getFilteredReviews = (reviews: Review[]) => {
    let filtered = filterReviews(reviews, {
      minRating: minRating > 0 ? minRating : undefined,
      channel: selectedChannel !== 'all' ? selectedChannel : undefined,
      approvedOnly: showApprovedOnly,
    });

    return sortReviews(filtered, sortBy, 'desc');
  };

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

  const totalReviews = listings.reduce((sum, l) => sum + l.totalReviews, 0);
  const avgRating = listings.reduce((sum, l) => sum + l.avgRating * l.totalReviews, 0) / totalReviews || 0;
  const pendingCount = listings.reduce(
    (sum, l) => sum + l.reviews.filter(r => !r.approved).length,
    0
  );

  const allChannels = Array.from(
    new Set(listings.flatMap(l => l.reviews.map(r => r.channel)))
  );

  return (
    <div className="min-h-screen bg-bg-primary">
      <NavHeader />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-fg">Reviews Dashboard</h1>
              <p className="text-muted mt-1">Manage and approve property reviews</p>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted" />
                  <span className="text-sm font-medium text-fg">Filters:</span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted">Min Rating:</label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="px-3 py-1.5 bg-bg-surface border border-border rounded-lg text-sm text-fg"
                  >
                    <option value="0">All</option>
                    <option value="7">7+</option>
                    <option value="8">8+</option>
                    <option value="9">9+</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted">Channel:</label>
                  <select
                    value={selectedChannel}
                    onChange={(e) => setSelectedChannel(e.target.value)}
                    className="px-3 py-1.5 bg-bg-surface border border-border rounded-lg text-sm text-fg"
                  >
                    <option value="all">All Channels</option>
                    {allChannels.map(channel => (
                      <option key={channel} value={channel}>{channel}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'rating')}
                    className="px-3 py-1.5 bg-bg-surface border border-border rounded-lg text-sm text-fg"
                  >
                    <option value="date">Date</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showApprovedOnly}
                    onChange={(e) => setShowApprovedOnly(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-muted">Approved only</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Properties & Reviews */}
          <div className="space-y-6">
            {listings.map((listing) => {
              const filteredReviews = getFilteredReviews(listing.reviews);
              
              if (filteredReviews.length === 0) return null;

              return (
                <div key={listing.listingId} className="space-y-4">
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl text-fg">{listing.listingName}</CardTitle>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                              <span className="font-semibold text-fg">{listing.avgRating}</span>
                            </div>
                            <span>{filteredReviews.length} / {listing.totalReviews} reviews</span>
                            <span>•</span>
                            <span>{listing.channels.join(', ')}</span>
                          </div>
                        </div>
                        <Badge className="bg-brand-primary text-white">
                          {filteredReviews.filter(r => !r.approved).length} pending
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>

                  <div className="grid gap-4">
                    {filteredReviews.map((review) => (
                      <Card key={review.id} className="bg-card border-border card-hover">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-hover flex items-center justify-center text-white font-semibold">
                                  {review.guestName.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <div className="font-semibold text-fg">{review.guestName}</div>
                                  <div className="flex items-center gap-2 text-sm text-muted">
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
                                    <span>•</span>
                                    <span>{new Date(review.submittedAt).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span className="capitalize">{review.channel}</span>
                                  </div>
                                </div>
                              </div>
                              <Badge variant={review.approved ? 'default' : 'secondary'} className={review.approved ? 'bg-success' : ''}>
                                {review.approved ? 'Approved' : 'Pending'}
                              </Badge>
                            </div>

                            <p className="text-fg leading-relaxed">{review.review}</p>

                            <div className="grid grid-cols-3 gap-3">
                              {Object.entries(review.categories).map(([category, rating]) => (
                                <div key={category} className="bg-bg-surface rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-muted capitalize">
                                      {category.replace('_', ' ')}
                                    </span>
                                    <span className="text-xs font-bold text-fg">{rating}/10</span>
                                  </div>
                                  <div className="w-full bg-border rounded-full h-1.5">
                                    <div
                                      className="h-1.5 rounded-full bg-gradient-to-r from-brand-primary to-brand-light"
                                      style={{ width: `${rating * 10}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-border">
                              <Button
                                onClick={() => handleApproval(review.id, true)}
                                disabled={review.approved}
                                className="bg-gradient-to-r from-brand-primary to-brand-hover hover:opacity-90 text-white"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {review.approved ? 'Approved' : 'Approve'}
                              </Button>
                              <Button
                                onClick={() => handleApproval(review.id, false)}
                                variant="outline"
                                disabled={!review.approved}
                                className="border-border text-fg hover:bg-bg-surface"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Unapprove
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
