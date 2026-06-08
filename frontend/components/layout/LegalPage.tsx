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
      <main className="legal-page">
        <article className="legal-page__inner">
          <div
            className="legal-content"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </article>
      </main>
    </SiteShell>
  );
}
