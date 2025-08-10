import { NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import { adminDb } from '@/app/firebase/admin';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { sessionId, uid } = await request.json();
    if (!sessionId || !uid) {
      return NextResponse.json({ error: 'Missing sessionId or uid' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription']
    });
    const subscription = session.subscription as any;
    const status = subscription?.status as string | undefined;
    const customerId = session.customer as string | undefined;

    if (subscription && customerId && status) {
      await adminDb.collection('users').doc(uid).set(
        {
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: status,
          isSubscriber: status === 'active' || status === 'trialing'
        },
        { merge: true }
      );
    }

    return NextResponse.json({ status: status || session.status });
  } catch (error) {
    console.error('Subscription confirm error', error);
    return NextResponse.json({ error: 'Failed to confirm session' }, { status: 500 });
  }
}
