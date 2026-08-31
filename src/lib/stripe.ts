import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

const secretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = secretKey
  ? new Stripe(secretKey, { typescript: true })
  : null;

export function getStripe() {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey || publishableKey === 'pk_test_placeholder') return null;
  return loadStripe(publishableKey);
}
