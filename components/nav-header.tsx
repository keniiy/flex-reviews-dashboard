'use client';

import { useTheme } from './theme-provider';
import { Moon, Sun, LayoutDashboard } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';

export function NavHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-hover rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">FL</span>
          </div>
          <div>
            <div className="font-bold text-fg text-lg">Flex Living</div>
            <div className="text-xs text-muted">Reviews Dashboard</div>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-6">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 text-fg hover:text-brand-primary transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="font-medium">Dashboard</span>
          </Link>
        </nav>

        {/* Theme Toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="border-border hover:bg-bg-surface"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-fg" />
          ) : (
            <Moon className="h-5 w-5 text-fg" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  );
}
