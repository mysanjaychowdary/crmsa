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
    const { phone_number } = await req.json();

    if (!phone_number) {
      return new Response(JSON.stringify({ error: 'Phone number is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate a 6-digit OTP
    const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // OTP valid for 5 minutes

    // Store OTP in the database
    const { error: upsertError } = await supabaseClient
      .from('whatsapp_otps')
      .upsert({ phone_number, otp_code, expires_at }, { onConflict: 'phone_number' });

    if (upsertError) {
      console.error('Error upserting OTP:', upsertError);
      return new Response(JSON.stringify({ error: 'Failed to generate OTP' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Fetch WhatsApp API credentials from environment variables
    const whatsappInstanceId = Deno.env.get('WHATSAPP_INSTANCE_ID');
    const whatsappAccessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');

    if (!whatsappInstanceId || !whatsappAccessToken) {
      console.error('WhatsApp API credentials not set in environment variables.');
      return new Response(JSON.stringify({ error: 'WhatsApp API not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const message = `Your OTP for login is: ${otp_code}. It is valid for 5 minutes.`;
    const whatsappApiUrl = `https://wapost.click/api/send?number=${phone_number}&type=text&message=${encodeURIComponent(message)}&instance_id=${whatsappInstanceId}&access_token=${whatsappAccessToken}`;

    const whatsappResponse = await fetch(whatsappApiUrl);
    const whatsappData = await whatsappResponse.json();

    if (!whatsappResponse.ok || whatsappData.status !== 'success') {
      console.error('WhatsApp API error:', whatsappData);
      return new Response(JSON.stringify({ error: 'Failed to send OTP via WhatsApp' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ message: 'OTP sent successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in send-whatsapp-otp function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});