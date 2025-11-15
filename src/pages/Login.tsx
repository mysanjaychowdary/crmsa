"use client";

import React, { useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/SessionContext';
import { useNavigate } from 'react-router-dom';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Login: React.FC = () => {
  const { session, loadingAuth } = useAuth();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  React.useEffect(() => {
    if (session) {
      navigate('/dashboard'); // Redirect to dashboard if already logged in
    }
  }, [session, navigate]);

  console.log('Current otpSent state:', otpSent); // Log current state

  const handleSendWhatsappOtp = async () => {
    setIsSendingOtp(true);
    console.log('Attempting to send OTP. otpSent before:', otpSent);
    try {
      // Validate phone number format (simple check)
      if (!phoneNumber || !/^\d{10,15}$/.test(phoneNumber)) {
        toast.error('Please enter a valid phone number (10-15 digits).');
        setIsSendingOtp(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('send-whatsapp-otp', {
        body: { phone_number: phoneNumber },
      });

      if (error) {
        toast.error(`Failed to send OTP: ${error.message}`);
        console.error('Error from send-whatsapp-otp function:', error);
      } else {
        toast.success('OTP sent to your WhatsApp number!');
        setOtpSent(true);
        console.log('OTP sent successfully. otpSent after:', true);
      }
    } catch (error: any) {
      toast.error(`An unexpected error occurred: ${error.message}`);
      console.error('Error sending WhatsApp OTP:', error);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyWhatsappOtp = async () => {
    setIsVerifyingOtp(true);
    try {
      if (!phoneNumber || !otp) {
        toast.error('Please enter both phone number and OTP.');
        setIsVerifyingOtp(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('verify-whatsapp-otp', {
        body: { phone_number: phoneNumber, otp_code: otp },
      });

      if (error) {
        toast.error(`Failed to verify OTP: ${error.message}`);
      } else {
        toast.success('OTP verified. Logging in...');
        // Supabase's auth.signInWithOtp in the edge function should handle session creation.
        // We just need to wait for the session context to update and redirect.
      }
    } catch (error: any) {
      toast.error(`An unexpected error occurred: ${error.message}`);
      console.error('Error verifying WhatsApp OTP:', error);
    } finally {
      setIsVerifyingOtp(false);
    }
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
      <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-foreground">Welcome Back!</h1>
        
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email Login</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp OTP</TabsTrigger>
          </TabsList>
          <TabsContent value="email" className="mt-6">
            <Auth
              supabaseClient={supabase}
              providers={['email', 'magic_link']} // Enabled email/password and magic link (email OTP)
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
              theme="light" // Use light theme, adjust if dark mode is preferred
              redirectTo={window.location.origin} // Redirects to the app's root after auth
            />
          </TabsContent>
          <TabsContent value="whatsapp" className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Enter your WhatsApp number to receive an OTP.
            </p>
            <div>
              <Label htmlFor="whatsapp-phone">WhatsApp Number</Label>
              <Input
                id="whatsapp-phone"
                type="tel"
                placeholder="e.g., 9184933313XX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={otpSent}
              />
            </div>
            {!otpSent ? (
              <Button onClick={handleSendWhatsappOtp} className="w-full" disabled={isSendingOtp}>
                {isSendingOtp ? 'Sending OTP...' : 'Send OTP via WhatsApp'}
              </Button>
            ) : (
              <>
                <div>
                  <Label htmlFor="whatsapp-otp">OTP</Label>
                  <Input
                    id="whatsapp-otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
                <Button onClick={handleVerifyWhatsappOtp} className="w-full" disabled={isVerifyingOtp}>
                  {isVerifyingOtp ? 'Verifying OTP...' : 'Verify OTP'}
                </Button>
                <Button variant="link" onClick={() => setOtpSent(false)} className="w-full">
                  Resend OTP
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Login;