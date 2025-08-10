import { NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import { adminDb } from '@/app/firebase/admin';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { session_id, uid } = await request.json();
    if (!session_id || !uid) {
      return NextResponse.json({ error: 'Missing session or uid' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id, { expand: ['subscription'] });
    const sessionUid = (session.metadata as any)?.uid;
    if (sessionUid !== uid) {
      return NextResponse.json({ error: 'UID mismatch' }, { status: 403 });
    }

    const subscription: any = session.subscription;
    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 400 });
    }

    const status = subscription.status as string;
    const currentPeriodEnd = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : undefined;

    await adminDb
      .collection('users')
      .doc(uid)
      .set(
        {
          stripeCustomerId: session.customer,
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: status,
          isSubscriber: status === 'active' || status === 'trialing',
          ...(currentPeriodEnd ? { currentPeriodEnd } : {}),
        },
        { merge: true }
      );

    return NextResponse.json({ ok: true, status });
  } catch (error) {
    console.error('Confirm checkout session error', error);
    return NextResponse.json({ error: 'Failed to confirm session' }, { status: 500 });
  }
}

