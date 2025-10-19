import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.5.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, stripe-signature',
};

const TIER_MAP: { [key: string]: string } = {
  'price_1SJjamF0amqk11yXTJS9dbRB': 'free',
  'price_1SJjbSF0amqk11yXcrXv8Jrd': 'starter',
  'price_1SJjbvF0amqk11yXBfgGEnCj': 'professional',
  'price_1SJjcTF0amqk11yXTzeAEAX6': 'business',
  'price_1SJjczF0amqk11yXCpwWPEFQ': 'enterprise',
};

const ANALYSIS_LIMITS: { [key: string]: number } = {
  'free': 3,
  'starter': 25,
  'professional': -1,
  'business': -1,
  'enterprise': -1,
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-12-18.acacia',
    });

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'No signature provided' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret!);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    console.log('Processing event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        
        if (!userId) {
          console.error('No user ID in session metadata');
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        const priceId = subscription.items.data[0].price.id;
        const tier = TIER_MAP[priceId] || 'free';

        await fetch(`${supabaseUrl}/rest/v1/premium_users?id=eq.${userId}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${supabaseServiceKey}`,
            apikey: supabaseServiceKey,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            stripe_customer_id: session.customer,
            stripe_subscription_id: subscription.id,
            stripe_price_id: priceId,
            subscription_status: 'active',
            subscription_tier: tier,
            subscribed_at: new Date().toISOString(),
            subscription_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            analysis_count: 0,
            analysis_limit: ANALYSIS_LIMITS[tier],
          }),
        });

        await fetch(`${supabaseUrl}/rest/v1/subscription_history`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${supabaseServiceKey}`,
            apikey: supabaseServiceKey,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            user_id: userId,
            event_type: 'subscription_created',
            new_tier: tier,
            stripe_event_id: event.id,
            metadata: { subscription_id: subscription.id, price_id: priceId },
          }),
        });

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const userResponse = await fetch(
          `${supabaseUrl}/rest/v1/premium_users?stripe_customer_id=eq.${customerId}`,
          {
            headers: {
              Authorization: `Bearer ${supabaseServiceKey}`,
              apikey: supabaseServiceKey,
            },
          }
        );
        const users = await userResponse.json();
        const user = users[0];

        if (!user) {
          console.error('No user found for customer:', customerId);
          break;
        }

        const priceId = subscription.items.data[0].price.id;
        const tier = TIER_MAP[priceId] || 'free';
        const status = subscription.status === 'active' ? 'active' : subscription.status;

        await fetch(`${supabaseUrl}/rest/v1/premium_users?id=eq.${user.id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${supabaseServiceKey}`,
            apikey: supabaseServiceKey,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            stripe_subscription_id: subscription.id,
            stripe_price_id: priceId,
            subscription_status: status,
            subscription_tier: tier,
            subscription_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            analysis_limit: ANALYSIS_LIMITS[tier],
          }),
        });

        await fetch(`${supabaseUrl}/rest/v1/subscription_history`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${supabaseServiceKey}`,
            apikey: supabaseServiceKey,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            user_id: user.id,
            event_type: 'subscription_updated',
            previous_tier: user.subscription_tier,
            new_tier: tier,
            stripe_event_id: event.id,
            metadata: { subscription_id: subscription.id, status, price_id: priceId },
          }),
        });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const userResponse = await fetch(
          `${supabaseUrl}/rest/v1/premium_users?stripe_customer_id=eq.${customerId}`,
          {
            headers: {
              Authorization: `Bearer ${supabaseServiceKey}`,
              apikey: supabaseServiceKey,
            },
          }
        );
        const users = await userResponse.json();
        const user = users[0];

        if (!user) {
          console.error('No user found for customer:', customerId);
          break;
        }

        await fetch(`${supabaseUrl}/rest/v1/premium_users?id=eq.${user.id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${supabaseServiceKey}`,
            apikey: supabaseServiceKey,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            stripe_subscription_id: null,
            stripe_price_id: 'price_1SJjamF0amqk11yXTJS9dbRB',
            subscription_status: 'cancelled',
            subscription_tier: 'free',
            cancelled_at: new Date().toISOString(),
            analysis_count: 0,
            analysis_limit: ANALYSIS_LIMITS['free'],
          }),
        });

        await fetch(`${supabaseUrl}/rest/v1/subscription_history`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${supabaseServiceKey}`,
            apikey: supabaseServiceKey,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            user_id: user.id,
            event_type: 'subscription_cancelled',
            previous_tier: user.subscription_tier,
            new_tier: 'free',
            stripe_event_id: event.id,
            metadata: { subscription_id: subscription.id },
          }),
        });

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;

        const userResponse = await fetch(
          `${supabaseUrl}/rest/v1/premium_users?stripe_customer_id=eq.${customerId}`,
          {
            headers: {
              Authorization: `Bearer ${supabaseServiceKey}`,
              apikey: supabaseServiceKey,
            },
          }
        );
        const users = await userResponse.json();
        const user = users[0];

        if (!user) break;

        await fetch(`${supabaseUrl}/rest/v1/premium_users?id=eq.${user.id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${supabaseServiceKey}`,
            apikey: supabaseServiceKey,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            subscription_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            analysis_count: 0,
          }),
        });

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const userResponse = await fetch(
          `${supabaseUrl}/rest/v1/premium_users?stripe_customer_id=eq.${customerId}`,
          {
            headers: {
              Authorization: `Bearer ${supabaseServiceKey}`,
              apikey: supabaseServiceKey,
            },
          }
        );
        const users = await userResponse.json();
        const user = users[0];

        if (!user) break;

        await fetch(`${supabaseUrl}/rest/v1/premium_users?id=eq.${user.id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${supabaseServiceKey}`,
            apikey: supabaseServiceKey,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            subscription_status: 'past_due',
          }),
        });

        await fetch(`${supabaseUrl}/rest/v1/subscription_history`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${supabaseServiceKey}`,
            apikey: supabaseServiceKey,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            user_id: user.id,
            event_type: 'payment_failed',
            stripe_event_id: event.id,
            metadata: { invoice_id: invoice.id },
          }),
        });

        break;
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});