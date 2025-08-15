import { NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import { adminDb } from '@/app/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

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

        // Try by stripeCustomerId
        let userDocRef = null as FirebaseFirestore.DocumentReference | null;
        const byCustomer = await adminDb.collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();
        if (!byCustomer.empty) {
          userDocRef = byCustomer.docs[0].ref;
        } else {
          // Fallback by customer email if available
          try {
            const customer = await stripe.customers.retrieve(customerId);
            const email = (customer as any)?.email as string | undefined;
            if (email) {
              const byEmail = await adminDb.collection('users').where('email', '==', email).limit(1).get();
              if (!byEmail.empty) {
                userDocRef = byEmail.docs[0].ref;
                await userDocRef.set({ stripeCustomerId: customerId }, { merge: true });
              }
            }
          } catch {}
        }

        if (userDocRef) {
          const update: Record<string, any> = {
            subscriptionStatus: status,
            isSubscriber: status === 'active' || status === 'trialing',
            stripeSubscriptionId: sub.id,
          };
          if (currentPeriodEnd) update.currentPeriodEnd = currentPeriodEnd;
          await userDocRef.set(update, { merge: true });
        }
        break;
      }
      case 'customer.deleted': {
        const customer = event.data.object as any;
        const customerId = customer.id as string;
        const byCustomer = await adminDb
          .collection('users')
          .where('stripeCustomerId', '==', customerId)
          .limit(1)
          .get();
        if (!byCustomer.empty) {
          const userDocRef = byCustomer.docs[0].ref;
          await userDocRef.set(
            {
              stripeCustomerId: FieldValue.delete(),
              stripeSubscriptionId: FieldValue.delete(),
              isSubscriber: false,
              subscriptionStatus: 'canceled',
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


