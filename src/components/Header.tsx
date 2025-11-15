"use client";

import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from './ModeToggle';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(`Logout failed: ${error.message}`);
    } else {
      toast.info('You have been logged out.');
      navigate('/login');
    }
  };

  return (
    <header className="flex items-center justify-end p-2 border-b bg-background h-14"> {/* Reduced padding and height */}
      <div className="flex items-center space-x-2"> {/* Reduced space-x */}
        {/* ModeToggle button itself needs adjustment for smaller size */}
        <ModeToggle />
        <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-1"> {/* size="sm" and gap-1 */}
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span> {/* Hide text on very small screens */}
        </Button>
      </div>
    </header>
  );
};