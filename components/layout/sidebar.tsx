"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  
  // Initialize from localStorage on mount
  useEffect(() => {
    const storedCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    const storedExpanded = localStorage.getItem('sidebarExpanded') === 'true';
    
    setCollapsed(storedCollapsed);
    setExpanded(storedExpanded);
  }, []);
  
  // Toggle sidebar collapsed state
  const toggleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    localStorage.setItem('sidebarCollapsed', String(newCollapsed));
    
    // Dispatch event to notify AppLayout
    window.dispatchEvent(new CustomEvent('sidebarStateChange', {
      detail: { isCollapsed: newCollapsed, isExpanded: expanded }
    }));
  };
  
  // Toggle sidebar expanded state
  const toggleExpand = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    localStorage.setItem('sidebarExpanded', String(newExpanded));
    
    // Dispatch event to notify AppLayout
    window.dispatchEvent(new CustomEvent('sidebarStateChange', {
      detail: { isCollapsed: collapsed, isExpanded: newExpanded }
    }));
  };
  
  // Menu items
  const menuItems = [
    { title: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { title: 'Profile', href: '/profile', icon: 'user' },
    // Add more items as needed
  ];

  return (
    <div 
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-64px)] bg-card border-r border-border transition-all duration-300",
        collapsed ? "w-16" : expanded ? "w-64" : "w-56"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar header/toggle */}
        <div className="p-2 flex justify-end">
          <button 
            onClick={toggleCollapse} 
            className="p-1.5 rounded-md hover:bg-accent"
          >
            {collapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            )}
          </button>
        </div>
        
        {/* Navigation items */}
        <nav className="mt-5 flex-1 space-y-1 px-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/60 hover:bg-accent hover:text-foreground"
              )}
            >
              <span className="mr-3 flex-shrink-0 h-5 w-5">
                {/* Simple icon placeholder */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {item.icon === 'dashboard' && (
                    <><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></>
                  )}
                  {item.icon === 'user' && (
                    <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></>
                  )}
                </svg>
              </span>
              {!collapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;