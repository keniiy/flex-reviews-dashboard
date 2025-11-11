'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
  id?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function Section({
  id,
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
}: SectionProps) {
  return (
    <section id={id} className={cn('space-y-4', className)}>
      {(title || description || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1 max-w-2xl">
            {title && (
              <h2 className="text-2xl font-semibold text-fg">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-muted">{description}</p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
