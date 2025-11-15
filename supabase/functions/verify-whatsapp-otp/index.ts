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
    let userId: string | undefined;
    let userEmailForCreation: string | undefined; // Email to use if creating a new user

    // 1. Try to find user by phone number in public.profiles
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, email, phone_number')
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
      userId = profileData.id;
      // If profile exists, we'll rely on the email stored in auth.users after fetching it.
      // For now, we just need the userId.
      console.log('Found existing user with ID:', userId);
    } else {
      // User not found, create a new one
      console.log('User not found, creating new user with phone:', phone_number);
      userEmailForCreation = `${phone_number}@temp.supabase.co`; // Generate a synthetic email for the new user

      const { data: newUser, error: createUserError } = await supabaseClient.auth.admin.createUser({
        phone: phone_number,
        email: userEmailForCreation, // Provide the synthetic email
        phone_confirmed_at: new Date().toISOString(), // Mark phone as confirmed
      });

      if (createUserError) {
        console.error('Error creating new user:', createUserError);
        return new Response(JSON.stringify({ error: `Failed to create user: ${createUserError.message}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
      userId = newUser.user?.id;
      console.log('New user created with ID:', userId, 'Synthetic Email used for creation:', userEmailForCreation);
    }

    if (!userId) {
      console.error('Could not determine user ID after find/create operation.');
      return new Response(JSON.stringify({ error: 'Authentication failed: User ID not found.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // IMPORTANT: Re-fetch user from auth.users to ensure we have the email Supabase actually stored
    const { data: fetchedUser, error: fetchUserError } = await supabaseClient.auth.admin.getUserById(userId);
    if (fetchUserError || !fetchedUser?.user) {
      console.error('Error fetching user by ID after creation/finding:', fetchUserError);
      return new Response(JSON.stringify({ error: `Authentication failed: Could not retrieve user details.` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    
    // Use the email from the fetched user data, which is guaranteed to be what Supabase has.
    const finalUserEmail = fetchedUser.user.email;
    if (!finalUserEmail) {
        console.error('Final user email is still null/undefined after fetching user details.');
        return new Response(JSON.stringify({ error: 'Authentication failed: User email is missing.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
    console.log('Using final email for magic link generation:', finalUserEmail);


    // Generate a magic link for the user using the determined email
    const { data: { properties }, error: generateLinkError } = await supabaseClient.auth.admin.generateLink({
      type: 'magiclink',
      email: finalUserEmail, // Use the email from the fetched user
      redirectTo: Deno.env.get('SUPABASE_URL') + '/auth/callback',
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