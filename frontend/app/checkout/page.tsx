import { CheckoutAddressClient } from '@/components/cart/CheckoutAddressClient';
import { SiteShell } from '@/components/layout/SiteShell';
import { buildPageMetadata } from '@/lib/pageMetadata';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return buildPageMetadata('checkout', {
    title: 'Checkout | B.back',
    description: 'B.back checkout address.',
    canonicalPath: '/checkout',
  });
}

export default function CheckoutPage() {
  return (
    <SiteShell pageBanner={{ title: 'Checkout' }}>
      <CheckoutAddressClient />
    </SiteShell>
  );
}
