import { HomePageContent } from '@/components/home/HomePageContent';
import { SiteShell } from '@/components/layout/SiteShell';
import { buildPageMetadata } from '@/lib/pageMetadata';
import { Suspense } from 'react';

export const revalidate = 10;

export async function generateMetadata() {
  return buildPageMetadata('home', {
    title: 'B.back',
    description: 'B.back restaurant home page.',
    canonicalPath: '/',
  });
}

export default function Home() {
  return (
    <SiteShell activeNavUrl="/" variant="home">
      <Suspense fallback={null}>
        <HomePageContent />
      </Suspense>
    </SiteShell>
  );
}
