'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';

interface NavItem {
  href: string;
  label: string;
  emoji: string;
}

const navItems: NavItem[] = [
  { href: '/feed', label: 'Feed', emoji: '\u{1F3E0}' },
  { href: '/explore', label: 'Explore', emoji: '\u{1F50D}' },
  { href: '/planner', label: 'Trips', emoji: '\u{2708}\u{FE0F}' },
  { href: '/forums', label: 'Rankings', emoji: '\u{1F3C6}' },
  { href: '/profile', label: 'Profile', emoji: '\u{1F464}' },
];

export function TopNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click (BUG 4)
  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const avatarUrl =
    session?.user?.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(session?.user?.name || 'U')}&background=667eea&color=fff`;

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50 border-b-4 border-purple-500 hidden md:block">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/feed" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
              P
            </div>
            <span className="text-2xl font-bold gradient-text-135">Pioneer</span>
          </Link>

          {/* Navigation Menu */}
          <div className="flex gap-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-6 py-2.5 rounded-full font-semibold transition-all duration-300 hover:-translate-y-0.5',
                    isActive
                      ? 'nav-item-active bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-[0_4px_15px_rgba(102,126,234,0.4)]'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  )}
                >
                  {item.emoji} {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right side: notification bell + avatar dropdown */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 dark:bg-red-400 rounded-full border-2 border-white dark:border-gray-900" />
            </button>
            <ThemeToggle />
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="focus:outline-none"
              >
                <img
                  src={avatarUrl}
                  alt="User avatar"
                  className="w-10 h-10 rounded-full border-2 border-purple-500 object-cover"
                />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                      {session?.user?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {session?.user?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
