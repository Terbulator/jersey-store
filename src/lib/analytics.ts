import { createClient } from '@/lib/supabase/client';

export async function trackEvent(
  event: string,
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
