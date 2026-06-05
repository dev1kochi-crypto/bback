import { AboutPageContent } from '@/components/about/AboutPageContent';
import { SiteShell } from '@/components/layout/SiteShell';
import { buildPageMetadata } from '@/lib/pageMetadata';
import { Suspense } from 'react';

export const revalidate = 120;

export async function generateMetadata() {
  return buildPageMetadata('about', {
    title: 'About Us | B.back',
    description: 'Learn about B.back - our story, values, and what makes us different.',
    canonicalPath: '/about',
  });
}

export default function AboutPage() {
  return (
    <SiteShell activeNavUrl="/about" pageBanner={{ title: 'About Us' }}>
      <Suspense fallback={null}>
        <AboutPageContent />
      </Suspense>
    </SiteShell>
  );
}
