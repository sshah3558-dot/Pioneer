'use client';

import { BottomNav } from './BottomNav';
import { TopNav } from './TopNav';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Desktop top nav */}
      <TopNav />

      {/* Main content */}
      <main className="pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
