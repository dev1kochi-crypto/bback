import { SiteShell } from '@/components/layout/SiteShell';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Page Not Found | B.back',
  description: 'The page you are looking for could not be found.',
};

function NotFoundHero() {
  return (
    <div className="not-found-hero" aria-hidden="true">
      <div className="not-found-hero__code">
        <span className="not-found-hero__digit">4</span>
        <span className="not-found-hero__zero">
          <span className="not-found-hero__cap">
            <Image
              src="/app/images/Isolation_Mode.png"
              alt=""
              width={120}
              height={100}
              priority
              className="not-found-hero__cap-image"
            />
          </span>
          <span className="not-found-hero__zero-char">0</span>
        </span>
        <span className="not-found-hero__digit">4</span>
      </div>
    </div>
  );
}

export default function NotFound() {
  return (
    <SiteShell pageBanner={{ logoOnly: true }}>
      <main className="not-found-page">
        <section className="not-found-page__stage">
          <NotFoundHero />
          <h1 className="not-found-page__title">Oops, Page Not Found</h1>
          <p className="not-found-page__message">
            Sorry, We can&apos;t find the page you&apos;re looking for.
          </p>
          <Link href="/" className="not-found-page__button">
            Back To Home Page
          </Link>
        </section>
      </main>
    </SiteShell>
  );
}
