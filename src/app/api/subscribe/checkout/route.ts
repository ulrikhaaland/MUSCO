import { NextResponse } from 'next/server';
import { stripe, STRIPE_PRICE_IDS, SubscriptionPlan } from '@/app/lib/stripe';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { price, uid } = await request.json();
    if (!uid) {
      return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
    }

    const plan: SubscriptionPlan = price === 'annual' ? 'annual' : 'monthly';
    const priceId = STRIPE_PRICE_IDS[plan];
    if (!priceId) {
      return NextResponse.json({ error: 'Price not configured' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      allow_promotion_codes: true,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe/cancel`,
      metadata: { uid, plan },
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout create error', error);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}


