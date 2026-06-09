import { SiteShell } from '@/components/layout/SiteShell';
import { OrderDetailClient } from '@/components/orders/OrderDetailClient';
import { buildPageMetadata } from '@/lib/pageMetadata';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return buildPageMetadata('order-details', {
    title: 'Order Details | B.back',
    description: 'View your B.back order details.',
    canonicalPath: '/orders',
  });
}

export default function OrderDetailPage() {
  return (
    <SiteShell pageBanner={{ title: 'Order Details', compact: true }}>
      <OrderDetailClient />
    </SiteShell>
  );
}
