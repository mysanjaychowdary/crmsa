import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone_number, otp_code } = await req.json();

    if (!phone_number || !otp_code) {
      console.error('Error: Phone number and OTP are required');
      return new Response(JSON.stringify({ error: 'Phone number and OTP are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Use service role key to access whatsapp_otps table
    );

    // Verify OTP from the database
    const { data, error: selectError } = await supabaseClient
      .from('whatsapp_otps')
      .select('otp_code, expires_at')
      .eq('phone_number', phone_number)
      .single();

    if (selectError || !data) {
      console.error('Error fetching OTP or OTP not found:', selectError);
      return new Response(JSON.stringify({ error: 'Invalid OTP or phone number' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const { otp_code: storedOtp, expires_at } = data;
    const now = new Date();
    const expiryDate = new Date(expires_at);

    if (storedOtp !== otp_code || now > expiryDate) {
      console.warn('Invalid or expired OTP attempt for phone number:', phone_number);
      return new Response(JSON.stringify({ error: 'Invalid or expired OTP' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // OTP is valid, delete it to prevent reuse
    const { error: deleteError } = await supabaseClient
      .from('whatsapp_otps')
      .delete()
      .eq('phone_number', phone_number);

    if (deleteError) {
      console.error('Error deleting OTP:', deleteError);
      // Continue with login even if delete fails, but log the error
    }

    // Now, sign in the user using Supabase's built-in phone OTP flow
    // This will create a user if they don't exist and establish a session.
    console.log('Attempting Supabase signInWithOtp for phone:', phone_number);
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithOtp({
      phone: phone_number,
      options: {
        shouldCreateUser: true, // Create user if not exists
      },
    });

    if (authError) {
      console.error('Supabase auth error after WhatsApp OTP verification:', authError);
      return new Response(JSON.stringify({ error: `Authentication failed: ${authError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log('Supabase signInWithOtp successful. Auth Data:', authData);
    // Return a success response. The client will then handle the session.
    return new Response(JSON.stringify({ message: 'OTP verified and user signed in successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in verify-whatsapp-otp function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});