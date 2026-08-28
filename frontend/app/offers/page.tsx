import { SiteShell } from '@/components/layout/SiteShell';
import { getOffers } from '@/lib/api.server';
import { buildPageMetadata } from '@/lib/pageMetadata';
import Image from 'next/image';

export const revalidate = 10;

export async function generateMetadata() {
  return buildPageMetadata('offers', {
    title: 'Offers | B.back',
    description: 'Explore the latest B.back offers and special deals.',
    canonicalPath: '/offers',
  });
}

export default async function OffersPage() {
  const payload = await getOffers();

  return (
    <SiteShell activeNavUrl="/offers" pageBanner={{ title: 'Offers' }}>
      <main className="bg-[#050505]">
        <section className="px-6 pb-[122px] pt-[92px] text-white sm:px-10 lg:px-16 lg:pb-[146px] lg:pt-[104px]">
          <div className="mx-auto max-w-[1480px]">
            {payload.offers.length ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {payload.offers.map((offer) => (
                  <article key={offer.id} className="relative aspect-[9/12] overflow-hidden bg-[#111]">
                    {offer.image ? (
                      <Image
                        src={offer.image}
                        alt={offer.alt_text || 'B.back offer'}
                        fill
                        sizes="(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center border border-white/10 text-[20px] text-white/50">
                        Offer image missing
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="mx-auto max-w-[720px] border border-white/10 px-8 py-16 text-center">
                <h2 className="font-display text-[42px] font-black uppercase text-white">No Offers Yet</h2>
                <p className="mt-4 text-[18px] text-white/55">Add active offers from the admin panel to show them here.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
