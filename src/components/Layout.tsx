"use client";

import React, { useState } from 'react';
import { MadeWithDyad } from './made-with-dyad';
import { SidebarNav } from './SidebarNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { MenuIcon } from 'lucide-react';
import { useAuth } from '@/context/SessionContext';
import { Skeleton } from './ui/skeleton';
import { Header } from './Header';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const { loadingAuth } = useAuth();
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarMinimized(!isSidebarMinimized);
  };

  if (loadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 md:hidden">
              <MenuIcon className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarNav isMinimized={false} toggleMinimize={() => {}} /> {/* Mobile sidebar is always expanded */}
          </SheetContent>
        </Sheet>
      ) : (
        <aside
          className={cn(
            "fixed top-0 left-0 h-screen border-r bg-sidebar text-sidebar-foreground p-4 flex flex-col transition-all duration-300 z-40", // Added fixed, top-0, left-0, h-screen, z-40
            isSidebarMinimized ? "w-20" : "w-64"
          )}
        >
          <SidebarNav isMinimized={isSidebarMinimized} toggleMinimize={toggleSidebar} />
        </aside>
      )}
      <main
        className={cn(
          "flex-1 flex flex-col overflow-auto",
          !isMobile && (isSidebarMinimized ? "ml-20" : "ml-64") // Adjust margin for fixed sidebar on desktop
        )}
      >
        <Header />
        <div className="flex-1 p-6 lg:p-8">
          {children}
        </div>
        <MadeWithDyad />
      </main>
    </div>
  );
};

export default Layout;