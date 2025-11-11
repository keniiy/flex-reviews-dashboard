'use client';

import { useState } from 'react';
import { useTheme } from './theme-provider';
import { Moon, Sun, LayoutDashboard, Building2, Info, PhoneCall, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    match: (pathname: string) => pathname.startsWith('/dashboard'),
  },
  {
    href: '/property',
    label: 'All listings',
    icon: Building2,
    match: (pathname: string) => pathname.startsWith('/property'),
  },
  {
    href: '/property#about',
    label: 'About Us',
    icon: Info,
    match: (pathname: string) => pathname.startsWith('/property'),
  },
  {
    href: '/property#contact',
    label: 'Contact',
    icon: PhoneCall,
    match: (pathname: string) => pathname.startsWith('/property'),
  },
];

export function NavHeader() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const renderLinks = (onNavigate?: () => void) =>
    navLinks.map(({ href, label, icon: Icon, match }) => {
      const active = match(pathname);
      return (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          className={`flex items-center gap-2 transition-colors ${
            active ? 'text-brand-primary' : 'text-fg hover:text-brand-primary'
          }`}
        >
          <Icon className="w-4 h-4" />
          <span className="font-medium">{label}</span>
        </Link>
      );
    });

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
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {renderLinks()}
        </nav>

        <div className="flex items-center gap-3">
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

          <Button
            variant="outline"
            size="icon"
            className="md:hidden border-border hover:bg-bg-surface"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X className="h-5 w-5 text-fg" /> : <Menu className="h-5 w-5 text-fg" />}
          </Button>
        </div>
      </div>
      {menuOpen && (
        <nav className="md:hidden border-t border-border bg-card px-6 py-4 flex flex-col gap-3 text-sm">
          {renderLinks(() => setMenuOpen(false))}
        </nav>
      )}
    </header>
  );
}
