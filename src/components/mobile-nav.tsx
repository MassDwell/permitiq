'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BarChart2, MapPin, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Zoning', href: '/tools/zoning-lookup', icon: MapPin },
  { name: 'Portfolio', href: '/portfolio', icon: BarChart2 },
  { name: 'Alerts', href: '/alerts', icon: Bell },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background: '#060B17',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex items-center justify-around px-2 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 py-3 px-4 text-xs font-medium transition-colors',
                isActive ? 'text-[#14B8A6]' : 'text-[#475569]'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
