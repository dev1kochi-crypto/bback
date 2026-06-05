import { HomePageContent } from '@/components/home/HomePageContent';
import { SiteShell } from '@/components/layout/SiteShell';
import { buildPageMetadata } from '@/lib/pageMetadata';
import { REVALIDATE_SECONDS } from '@/lib/cache';
import { Suspense } from 'react';

export const revalidate = REVALIDATE_SECONDS;

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
