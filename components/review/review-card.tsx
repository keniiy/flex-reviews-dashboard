'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, ImageIcon, Star, XCircle, ExternalLink } from 'lucide-react';
import type { Review } from '@/modules/reviews/types';

interface ReviewCardActions {
  onApprove?: () => void;
  onUnapprove?: () => void;
  loading?: boolean;
}

interface ReviewCardProps {
  review: Review;
  showCategories?: boolean;
  actions?: ReviewCardActions;
  detailHref?: string;
  className?: string;
}

export function ReviewCard({
  review,
  showCategories = true,
  actions,
  detailHref,
  className,
}: ReviewCardProps) {
  const formattedDate = new Date(review.submittedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <Card className={`bg-card border-border card-hover ${className ?? ''}`}>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-hover flex items-center justify-center text-white font-semibold uppercase">
              {review.guestName
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <div className="font-semibold text-fg">{review.guestName}</div>
              <div className="flex items-center gap-2 text-sm text-muted flex-wrap">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(review.rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-border'
                      }`}
                    />
                  ))}
                </div>
                <span>{formattedDate}</span>
                <span>•</span>
                <span className="capitalize">{review.channel}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={review.approved ? 'default' : 'secondary'}
              className={review.approved ? 'bg-success text-white' : ''}
            >
              {review.approved ? 'Approved' : 'Pending'}
            </Badge>
            {detailHref && (
              <Button asChild size="sm" variant="outline" className="border-border text-fg">
                <Link href={detailHref}>
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Details
                </Link>
              </Button>
            )}
          </div>
        </div>

        <p className="text-fg leading-relaxed">{review.review}</p>

        {showCategories && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(review.categories).map(([category, rating]) => (
              <div key={category} className="bg-bg-surface rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted capitalize">
                    {category.replace(/_/g, ' ')}
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
        )}

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
          {actions && (
            <>
              <Button
                onClick={actions.onApprove}
                disabled={actions.loading || review.approved || !actions.onApprove}
                className="bg-gradient-to-r from-brand-primary to-brand-hover hover:opacity-90 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {review.approved ? 'Approved' : 'Approve'}
              </Button>
              <Button
                onClick={actions.onUnapprove}
                variant="outline"
                disabled={actions.loading || !review.approved || !actions.onUnapprove}
                className="border-border text-fg hover:bg-bg-surface"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Unapprove
              </Button>
            </>
          )}
          <Button
            asChild
            variant="ghost"
            className="text-muted hover:text-fg"
          >
            <Link href={`/property/${review.listingId}`} aria-label="View property gallery">
              <ImageIcon className="w-4 h-4 mr-2" />
              View listing
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
