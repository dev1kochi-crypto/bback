import { SiteShell } from '@/components/layout/SiteShell';
import { OrderListClient } from '@/components/orders/OrderListClient';
import { buildPageMetadata } from '@/lib/pageMetadata';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return buildPageMetadata('orders', {
    title: 'Orders | B.back',
    description: 'View your B.back order history.',
    canonicalPath: '/orders',
  });
}

export default function OrdersPage() {
  return (
    <SiteShell pageBanner={{ title: 'Orders' }}>
      <OrderListClient />
    </SiteShell>
  );
}
