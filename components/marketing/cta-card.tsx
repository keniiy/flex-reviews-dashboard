'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CTACardProps {
  title: string;
  body: string;
  href: string;
  buttonLabel: string;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function CTACard({
  title,
  body,
  href,
  buttonLabel,
  variant = 'primary',
  className,
}: CTACardProps) {
  const isPrimary = variant === 'primary';
  return (
    <div
      className={cn(
        'rounded-3xl border p-6 shadow-sm transition',
        isPrimary
          ? 'bg-card border-border'
          : 'bg-gradient-to-br from-brand-primary to-brand-hover text-white border-transparent',
        className
      )}
    >
      <div className="space-y-3">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className={isPrimary ? 'text-muted' : 'text-white/85'}>{body}</p>
        <Button
          asChild
          className={
            isPrimary
              ? 'bg-gradient-to-r from-brand-primary to-brand-hover text-white'
              : 'bg-white text-brand-primary hover:bg-white/90'
          }
          variant={isPrimary ? 'default' : 'secondary'}
        >
          <Link href={href}>{buttonLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
