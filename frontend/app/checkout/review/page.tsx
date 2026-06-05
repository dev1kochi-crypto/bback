import { CheckoutReviewClient } from '@/components/cart/CheckoutReviewClient';
import { SiteShell } from '@/components/layout/SiteShell';
import { buildPageMetadata } from '@/lib/pageMetadata';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return buildPageMetadata('checkout', {
    title: 'Review Order | B.back',
    description: 'Review your B.back order before placing it.',
    canonicalPath: '/checkout/review',
  });
}

export default function CheckoutReviewPage() {
  return (
    <SiteShell pageBanner={{ title: 'Checkout' }}>
      <CheckoutReviewClient />
    </SiteShell>
  );
}
