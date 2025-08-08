import { NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import { adminDb } from '@/app/firebase/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature') || '';
  const body = await request.text();
  let event: any;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return new NextResponse('Bad signature', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const uid = session.metadata?.uid;
        const subscriptionId = session.subscription as string;
        if (uid) {
          await adminDb.collection('users').doc(uid).set(
            {
              stripeCustomerId: session.customer,
              stripeSubscriptionId: subscriptionId,
              subscriptionStatus: 'active',
              isSubscriber: true,
              currentPeriodEnd: undefined,
            },
            { merge: true }
          );
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        const customerId = sub.customer as string;
        const status = sub.status as string;
        const currentPeriodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : undefined;

        const snap = await adminDb.collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();
        if (!snap.empty) {
          const doc = snap.docs[0];
          await doc.ref.set(
            {
              subscriptionStatus: status,
              isSubscriber: status === 'active' || status === 'trialing',
              currentPeriodEnd,
              stripeSubscriptionId: sub.id,
            },
            { merge: true }
          );
        }
        break;
      }
    }
  } catch (error) {
    console.error('Webhook handling error', error);
    return new NextResponse('Webhook error', { status: 500 });
  }

  return NextResponse.json({ received: true });
}


