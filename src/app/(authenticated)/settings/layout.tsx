'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Shield, Bell, Eye, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const settingsNav = [
  { href: '/settings/profile', label: 'Profile', icon: User },
  { href: '/settings/account', label: 'Account', icon: Shield },
  { href: '/settings/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings/privacy', label: 'Privacy', icon: Eye },
  { href: '/settings/danger', label: 'Danger Zone', icon: AlertTriangle },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <nav className="bg-white rounded-2xl shadow-lg p-4 h-fit">
          <ul className="space-y-1">
            {settingsNav.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium',
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100',
                      href === '/settings/danger' && !isActive && 'text-red-500 hover:bg-red-50'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="lg:col-span-3">{children}</div>
      </div>
    </div>
  );
}
