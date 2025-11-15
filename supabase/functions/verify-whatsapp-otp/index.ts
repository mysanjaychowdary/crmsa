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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Use service role key for admin operations
    );

    // Verify OTP from the database
    const { data: otpData, error: selectError } = await supabaseClient
      .from('whatsapp_otps')
      .select('otp_code, expires_at')
      .eq('phone_number', phone_number)
      .single();

    if (selectError || !otpData) {
      console.error('Error fetching OTP or OTP not found:', selectError);
      return new Response(JSON.stringify({ error: 'Invalid OTP or phone number' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const { otp_code: storedOtp, expires_at } = otpData;
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

    // --- Find or Create User and Generate Magic Link ---
    let userEmail: string | undefined;
    let existingUserId: string | undefined;

    // 1. Try to find user by phone number in public.profiles
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, email, phone_number') // Select email and phone_number
      .eq('phone_number', phone_number)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching profile by phone number:', profileError);
      return new Response(JSON.stringify({ error: `Authentication failed: ${profileError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (profileData) {
      existingUserId = profileData.id;
      // Use existing email from profile, or generate a synthetic one if not present
      userEmail = profileData.email || `${phone_number}@temp.supabase.co`;
      console.log('Found existing user with ID:', existingUserId, 'Email:', userEmail);
    } else {
      // User not found, create a new one
      console.log('User not found, creating new user with phone:', phone_number);
      // Generate a synthetic email for the new user
      userEmail = `${phone_number}@temp.supabase.co`; 

      const { data: newUser, error: createUserError } = await supabaseClient.auth.admin.createUser({
        phone: phone_number,
        email: userEmail, // Provide the synthetic email
        phone_confirmed_at: new Date().toISOString(), // Mark phone as confirmed
      });

      if (createUserError) {
        console.error('Error creating new user:', createUserError);
        return new Response(JSON.stringify({ error: `Failed to create user: ${createUserError.message}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
      existingUserId = newUser.user?.id;
      console.log('New user created with ID:', existingUserId, 'Email:', userEmail);
    }

    if (!existingUserId || !userEmail) {
      console.error('Could not determine user ID or email after find/create operation.');
      return new Response(JSON.stringify({ error: 'Authentication failed: User ID or email not found.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Generate a magic link for the user using the determined email
    const { data: { properties }, error: generateLinkError } = await supabaseClient.auth.admin.generateLink({
      type: 'magiclink',
      email: userEmail, // Use the determined email (real or synthetic)
      redirectTo: Deno.env.get('SUPABASE_URL') + '/auth/callback', // Redirect back to your app's auth callback
    });

    if (generateLinkError) {
      console.error('Error generating magic link:', generateLinkError);
      return new Response(JSON.stringify({ error: `Failed to generate login link: ${generateLinkError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const magicLink = properties?.action_link;
    if (!magicLink) {
      console.error('Magic link was not generated.');
      return new Response(JSON.stringify({ error: 'Failed to generate login link.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log('Magic link generated successfully.');
    return new Response(JSON.stringify({ message: 'OTP verified, redirecting for login', redirectTo: magicLink }), {
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