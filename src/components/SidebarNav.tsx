"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, FolderKanban, DollarSign, BarChart, Settings, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navLinks: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/reports', label: 'Reports', icon: BarChart },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarNavProps {
  isMinimized: boolean;
  toggleMinimize: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ isMinimized, toggleMinimize }) => {
  const location = useLocation();

  return (
    <nav className="flex flex-col space-y-1 h-full"> {/* Removed p-4 and pt-4, relying on parent padding */}
      <div className={cn("flex items-center mb-4", isMinimized ? "justify-center" : "justify-between")}>
        {!isMinimized ? (
          <img
            src="https://sanjuanimations.com/wp-content/uploads/2023/06/20230608_100023-1536x846.jpg"
            alt="Sanju Animations CRM Logo"
            className="h-10 w-auto object-contain"
          />
        ) : (
          <img
            src="https://sanjuanimations.com/wp-content/uploads/2023/06/20230608_100023-1536x846.jpg"
            alt="Sanju Animations CRM Logo"
            className="h-8 w-8 object-contain"
          />
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMinimize}
          className="hidden md:flex"
        >
          {isMinimized ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
      <div className="flex-1 space-y-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              location.pathname.startsWith(link.href) && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
              isMinimized ? "justify-center" : "gap-3" // Apply gap only when not minimized
            )}
          >
            <link.icon className="h-5 w-5" />
            {!isMinimized && <span className="whitespace-nowrap">{link.label}</span>}
          </Link>
        ))}
      </div>
    </nav>
  );
};