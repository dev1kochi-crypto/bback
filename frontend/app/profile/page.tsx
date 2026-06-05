import { ProfilePanel } from '@/components/auth/ProfilePanel';
import { SiteShell } from '@/components/layout/SiteShell';
import { buildPageMetadata } from '@/lib/pageMetadata';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return buildPageMetadata('profile', {
    title: 'Profile | B.back',
    description: 'B.back customer profile.',
    canonicalPath: '/profile',
  });
}

export default function ProfilePage() {
  return (
    <SiteShell pageBanner={{ title: 'Profile' }}>
      <ProfilePanel />
    </SiteShell>
  );
}
