import { createClient } from '@/lib/supabase/client';

/**
 * Event names the public INSERT policy on `analytics_events` accepts. That policy
 * is enforced by Postgres (see supabase/20261003_security-hardening.sql), and this
 * function discards insert errors, so an unlisted name would fail silently and the
 * event would simply never be recorded. Typing the parameter as a union makes that
 * a compile error instead. Add new names here *and* to the policy in the same change.
 */
export const ANALYTICS_EVENTS = [
  'page_view',
  'product_view',
  'add_to_cart',
  'remove_from_cart',
  'begin_checkout',
  'purchase',
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

export async function trackEvent(
  event: AnalyticsEvent,
  payload: {
    product_id?: string;
    product_name?: string;
    category?: string;
    price?: number;
    page_url?: string;
    referrer?: string;
    device?: string;
  }
) {
  try {
    const supabase = createClient();
    let userId: string | null = null;
    try {
      const { data } = await supabase.auth.getUser();
      userId = data?.user?.id ?? null;
    } catch {
      // Unauthenticated / anonymous visitor
    }

    const page_url = payload.page_url ?? (typeof window !== 'undefined' ? window.location.href : '');
    const referrer = payload.referrer ?? (typeof window !== 'undefined' ? document.referrer : '');
    const device =
      payload.device ??
      (typeof navigator !== 'undefined' && navigator.userAgent ? navigator.userAgent : 'unknown');

    await supabase.from('analytics_events').insert({
      event,
      user_id: userId,
      product_id: payload.product_id ?? null,
      product_name: payload.product_name ?? null,
      category: payload.category ?? null,
      price: payload.price ?? null,
      page_url,
      referrer,
      device,
    });
  } catch {
    // Non-blocking background telemetry
  }
}
