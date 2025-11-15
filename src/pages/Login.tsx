"use client";

import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/context/SessionContext';
import { Navigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Loading...</h1>
          <p className="text-xl text-gray-600">Checking authentication status</p>
        </div>
      </div>
    );
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
          <CardDescription>Sign in to manage your freelance projects.</CardDescription>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            providers={[]} // You can add 'google', 'github', etc. here if desired
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary-foreground))',
                  },
                },
              },
            }}
            theme="light" // Or "dark" based on your app's theme
            redirectTo={window.location.origin}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;