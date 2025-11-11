'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface HeroProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
  children?: ReactNode;
  className?: string;
}

export function MarketingHero({
  title,
  subtitle,
  backgroundImage,
  children,
  className,
}: HeroProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-[32px] text-white shadow-xl',
        className
      )}
    >
      <div className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt="Hero background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/65" />
      </div>
      <div className="relative z-10 p-8 sm:p-12 space-y-6 max-w-3xl">
        <p className="text-sm tracking-[0.4em] uppercase text-white/80">
          Flex Living
        </p>
        <h1 className="text-3xl sm:text-5xl font-semibold leading-tight">
          {title}
        </h1>
        <p className="text-lg text-white/85">{subtitle}</p>
        {children}
      </div>
    </section>
  );
}
