import { NextResponse } from 'next/server';
import { stripe, STRIPE_PRICE_IDS, SubscriptionPlan } from '@/app/lib/stripe';
import { adminDb } from '@/app/firebase/admin';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { price, uid } = await request.json();
    if (!uid) return NextResponse.json({ error: 'Missing uid' }, { status: 400 });

    const plan: SubscriptionPlan = price === 'annual' ? 'annual' : price === 'ulrik' ? 'ulrik' : 'monthly';
    const priceId = STRIPE_PRICE_IDS[plan];
    if (!priceId) return NextResponse.json({ error: 'Price not configured' }, { status: 400 });

    // Look up user email and existing Stripe customer
    let customerEmail: string | undefined;
    let existingCustomerId: string | undefined;
    try {
      const snap = await adminDb.collection('users').doc(uid).get();
      const data = snap.exists ? (snap.data() as any) : null;
      customerEmail = data?.email;
      existingCustomerId = data?.stripeCustomerId;
    } catch {}

    // Validate the existing customer id to avoid 400 "No such customer"
    if (existingCustomerId) {
      try {
        await stripe.customers.retrieve(existingCustomerId);
      } catch (e: any) {
        if (e?.raw?.code === 'resource_missing' || e?.statusCode === 404) {
          existingCustomerId = undefined;
          // Best-effort cleanup in Firestore so future calls don't pass stale ids
          try {
            await adminDb.collection('users').doc(uid).set({ stripeCustomerId: null }, { merge: true });
          } catch {}
        } else {
          throw e;
        }
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      allow_promotion_codes: true,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe/cancel`,
      metadata: { uid, plan },
      customer: existingCustomerId || undefined,
      customer_email: existingCustomerId ? undefined : customerEmail,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout create error', error);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}


