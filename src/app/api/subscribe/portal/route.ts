import { NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import { adminDb } from '@/app/firebase/admin';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { uid } = await request.json();
    if (!uid) return NextResponse.json({ error: 'Missing uid' }, { status: 400 });

    const userSnap = await adminDb.collection('users').doc(uid).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const data = userSnap.data() as any;
    let customerId = data?.stripeCustomerId as string | undefined;
    const subscriptionId = data?.stripeSubscriptionId as string | undefined;
    // const email = data?.email as string | undefined;

    // Validate existing customerId belongs to this mode
    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId);
      } catch (e: any) {
        // If resource missing, drop it and try to recover below
        if (e?.raw?.code === 'resource_missing' || e?.statusCode === 404) {
          customerId = undefined;
        } else {
          throw e;
        }
      }
    }

    // Fallback via subscription -> customer
    if (!customerId && subscriptionId) {
      try {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const subCustomer = (sub.customer as string) || undefined;
        if (subCustomer) {
          customerId = subCustomer;
          await adminDb.collection('users').doc(uid).set({ stripeCustomerId: subCustomer }, { merge: true });
        }
      } catch {
        // ignore, try next fallback
      }
    }

    if (!customerId) {
      return NextResponse.json({ error: 'No Stripe customer for user' }, { status: 400 });
    }

    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/profile`;
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Create portal session error', error);
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 });
  }
}


