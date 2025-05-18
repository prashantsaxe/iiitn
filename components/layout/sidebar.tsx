"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const pathname = usePathname();
  
  // Basic navigation items
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { name: 'Profile', href: '/profile', icon: 'user' },
    // Add more menu items as needed
  ];

  return (
    <aside className={cn("h-full border-r bg-background", className)}>
      <div className="flex flex-col h-full py-4">
        <div className="px-4 mb-6">
          <h2 className="text-xl font-semibold">IIITN</h2>
        </div>
        
        <nav className="space-y-1 px-2 flex-1">
          {navItems.map((item) => (
            <Link 
              href={item.href} 
              key={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                pathname === item.href 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "hover:bg-accent"
              )}
            >
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;