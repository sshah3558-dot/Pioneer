'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Plane, Trophy, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: '/feed', label: 'Feed', icon: <Home className="w-5 h-5" /> },
  { href: '/explore', label: 'Explore', icon: <Search className="w-5 h-5" /> },
  { href: '/planner', label: 'Trips', icon: <Plane className="w-5 h-5" /> },
  { href: '/forums', label: 'Rankings', icon: <Trophy className="w-5 h-5" /> },
  { href: '/profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[60px]',
                isActive
                  ? 'text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <div className="relative">
                {isActive && (
                  <div className="absolute -inset-1.5 gradient-primary rounded-xl opacity-10" />
                )}
                <span className={cn(
                  isActive ? 'text-purple-600' : ''
                )}>
                  {item.icon}
                </span>
              </div>
              <span className={cn(
                'text-xs font-medium',
                isActive ? 'text-purple-600 font-bold' : ''
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full gradient-primary" />
              )}
            </Link>
          );
        })}
      </div>
      {/* env() safe-area-inset-bottom requires inline style — no Tailwind v4 utility available */}
      <div className="bg-white dark:bg-gray-900" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
    </nav>
  );
}
