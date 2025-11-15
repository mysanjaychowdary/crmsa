"use client";

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, FolderKanban, DollarSign, BarChart, Settings, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
// ModeToggle and LogOut are removed from here

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navLinks: NavLink[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/reports', label: 'Reports', icon: BarChart },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export const SidebarNav: React.FC = () => {
  const location = useLocation();
  // const navigate = useNavigate(); // No longer needed here as logout moved to Header

  // const handleLogout = async () => { // Moved to Header
  //   const { error } = await supabase.auth.signOut();
  //   if (error) {
  //     toast.error(`Logout failed: ${error.message}`);
  //   } else {
  //     toast.info('You have been logged out.');
  //     navigate('/login');
  //   }
  // };

  return (
    <nav className="flex flex-col space-y-1 p-4 pt-12 md:pt-4 h-full">
      <h2 className="mb-4 text-2xl font-bold text-sidebar-primary">Freelancer App</h2>
      <div className="flex-1 space-y-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              location.pathname === link.href && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
            )}
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </Link>
        ))}
      </div>
      {/* ModeToggle and Logout button removed from here */}
    </nav>
  );
};