'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Bell } from 'lucide-react';

interface BookingWidgetProps {
  propertyName: string;
  avgRating: number;
}

export function BookingWidget({ propertyName, avgRating }: BookingWidgetProps) {
  const nightlyRate = 150 + Math.round(avgRating * 20);
  const cleaningFee = 60;
  const serviceFee = Math.round(nightlyRate * 0.12);
  const taxes = Math.round(nightlyRate * 0.08);
  const estimatedTotal = nightlyRate + cleaningFee + serviceFee + taxes;
  const handleComingSoon = () => {
    if (typeof window !== 'undefined') {
      window.alert('Instant booking is coming soon. Reach out to bookings@flexliving.uk for availability.');
    }
  };

  return (
    <Card className="sticky top-24 border-border">
      <CardContent className="pt-6">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <div className="text-3xl font-semibold text-fg">£{nightlyRate}</div>
            <p className="text-xs text-muted">avg nightly rate</p>
          </div>
          <Badge variant="secondary" className="bg-brand-primary/15 text-brand-primary border-brand-primary/30">
            Instant book
          </Badge>
        </div>

        <p className="text-muted text-sm mb-4">
          Pricing estimate based on recent stays at {propertyName}.
        </p>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-bg-surface cursor-pointer hover:border-brand-primary transition-colors">
            <Calendar className="w-5 h-5 text-muted" />
            <div className="flex-1">
              <div className="text-sm text-fg font-medium">Select Dates</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-bg-surface cursor-pointer hover:border-brand-primary transition-colors">
            <Users className="w-5 h-5 text-muted" />
            <div className="flex-1">
              <div className="text-sm text-fg font-medium">1 Guest</div>
            </div>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-brand-primary to-brand-hover text-white py-6 text-lg font-semibold hover:opacity-90"
            type="button"
            onClick={handleComingSoon}
          >
            Check availability (beta)
          </Button>
          <div className="flex items-center gap-2 rounded-lg bg-brand-primary/10 text-brand-primary px-3 py-2 text-sm">
            <Bell className="w-4 h-4" />
            Digital booking flow launching soon
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border space-y-2 text-sm">
          <div className="flex items-center justify-between text-muted">
            <span>Cleaning fee</span>
            <span>£{cleaningFee}</span>
          </div>
          <div className="flex items-center justify-between text-muted">
            <span>Service fee</span>
            <span>£{serviceFee}</span>
          </div>
          <div className="flex items-center justify-between text-muted">
            <span>Taxes & city fees</span>
            <span>£{taxes}</span>
          </div>
          <div className="flex items-center justify-between font-semibold text-fg">
            <span>Estimated total</span>
            <span>£{estimatedTotal}</span>
          </div>

          <div className="text-xs text-muted text-center">
            You won&apos;t be charged yet
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
