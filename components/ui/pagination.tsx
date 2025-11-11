'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalItems,
  pageSize,
  onPageChange,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalPages <= 1) return null;

  const handleChange = (next: number) => {
    if (next < 1 || next > totalPages) return;
    onPageChange(next);
  };

  const renderPages = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          type="button"
          onClick={() => handleChange(i)}
          className={cn(
            'min-w-9 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
            i === page
              ? 'border-brand-primary bg-brand-primary text-white'
              : 'border-border text-muted hover:text-fg hover:border-brand-primary'
          )}
          aria-current={i === page ? 'page' : undefined}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 border-t border-border pt-4 flex-wrap',
        className
      )}
    >
      <Button
        variant="outline"
        className="border-border text-fg"
        onClick={() => handleChange(page - 1)}
        disabled={page === 1}
      >
        Previous
      </Button>
      <div className="flex items-center gap-2">{renderPages()}</div>
      <Button
        variant="outline"
        className="border-border text-fg"
        onClick={() => handleChange(page + 1)}
        disabled={page === totalPages}
      >
        Next
      </Button>
    </div>
  );
}
