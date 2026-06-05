import { defaultSitePayload } from '@/lib/api';
import { getSite } from '@/lib/api.server';
import { SiteShell } from '@/components/layout/SiteShell';
import { notFound } from 'next/navigation';

interface LegalPageProps {
  title: string;
  contentKey: 'privacy_policy' | 'terms_and_conditions';
}

export async function LegalPage({ title, contentKey }: LegalPageProps) {
  const site = await getSite().catch(() => defaultSitePayload);
  const content = site[contentKey];

  if (!content) {
    notFound();
  }

  return (
    <SiteShell pageBanner={{ title }}>
      <main className="bg-[#050505] px-6 py-16 text-white sm:px-10 lg:px-16">
        <article className="mx-auto max-w-[1100px] font-display text-[18px] leading-relaxed text-white/70">
          <div
            className="legal-content"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </article>
      </main>
    </SiteShell>
  );
}
