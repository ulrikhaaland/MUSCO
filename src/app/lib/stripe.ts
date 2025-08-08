import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const STRIPE_PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_MONTHLY as string,
  annual: process.env.STRIPE_PRICE_ANNUAL as string,
};

export type SubscriptionPlan = 'monthly' | 'annual';


