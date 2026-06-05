import { CartPageClient } from '@/components/cart/CartPageClient';
import { SiteShell } from '@/components/layout/SiteShell';
import { buildPageMetadata } from '@/lib/pageMetadata';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return buildPageMetadata('cart', {
    title: 'My Cart | B.back',
    description: 'Review your B.back cart.',
    canonicalPath: '/cart',
  });
}

export default function CartPage() {
  return (
    <SiteShell pageBanner={{ title: 'My Cart' }}>
      <CartPageClient />
    </SiteShell>
  );
}
