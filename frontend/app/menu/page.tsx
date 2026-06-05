import { SiteShell } from '@/components/layout/SiteShell';
import { MenuShowcaseSection } from '@/components/menu/MenuShowcaseSection';
import { getMenus } from '@/lib/api.server';
import { buildPageMetadata } from '@/lib/pageMetadata';

export const revalidate = 120;

export async function generateMetadata() {
  return buildPageMetadata('menu', {
    title: 'Our Menu | B.back',
    description: 'Explore the B.back menu and popular dishes.',
    canonicalPath: '/menu',
  });
}

export default async function MenuPage() {
  const menuPayload = await getMenus();

  return (
    <SiteShell activeNavUrl="/menu" pageBanner={{ title: 'Our Menu' }}>
      <main className="bg-[#050505]">
        <MenuShowcaseSection menu={menuPayload} variant="listing" />
      </main>
    </SiteShell>
  );
}
