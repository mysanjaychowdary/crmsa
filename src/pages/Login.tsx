"use client";

import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/SessionContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Import Card components

const Login: React.FC = () => {
  const { session, loadingAuth } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (session) {
      navigate('/dashboard'); // Redirect to dashboard if already logged in
    }
  }, [session, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Logged in successfully!');
      // Redirection handled by SessionContext and Index.tsx
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address to reset your password.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/update-password', // Redirect to a page where user can set new password
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.info('Password reset email sent. Check your inbox!');
    }
    setLoading(false);
  };

  if (loadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading authentication...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md"> {/* Using Card component for the login form */}
        <CardHeader className="flex flex-col items-center">
          <img
            src="https://sanjuanimations.com/wp-content/uploads/2023/06/20230608_100023-1536x846.jpg"
            alt="Sanju Animations Logo"
            className="mb-6 w-48 h-auto object-contain" // Added styling for the logo
          />
          <CardTitle className="text-center text-3xl font-bold text-foreground">Welcome Back!</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button variant="link" onClick={handleForgotPassword} disabled={loading}>
              Forgot Password?
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;