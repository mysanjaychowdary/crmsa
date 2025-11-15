"use client";

import React from 'react';
import { useAuth } from '@/context/SessionContext';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const Index: React.FC = () => {
  const { session, loadingAuth } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loadingAuth) {
      if (session) {
        navigate('/dashboard'); // Redirect to dashboard if authenticated
      } else {
        navigate('/login'); // Redirect to login if not authenticated
      }
    }
  }, [session, loadingAuth, navigate]);

  if (loadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  return null; // This component primarily handles redirection
};

export default Index;