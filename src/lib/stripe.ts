import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID!;

export function isSubscriptionActive(status: string, periodEnd: string | null): boolean {
  if (status !== 'active' && status !== 'trialing') return false;
  if (!periodEnd) return false;
  return new Date(periodEnd) > new Date();
}
