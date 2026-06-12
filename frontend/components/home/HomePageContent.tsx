import { CinematicHero } from '@/components/hero/CinematicHero';
import { BurgerStackSection } from '@/components/home/BurgerStackSection';
import { HomeAboutShowcase } from '@/components/home/HomeAboutShowcase';
import { HomeTestimonialsSection } from '@/components/home/HomeTestimonialsSection';
import { HomeWhyChooseUsSection } from '@/components/home/HomeWhyChooseUsSection';
import { OrderProcessSection } from '@/components/home/OrderProcessSection';
import { ThatWrapSection } from '@/components/home/ThatWrapSection';
import { MenuSignatureItemsSection } from '@/components/menu/MenuSignatureItemsSection';
import { MenuShowcaseSection } from '@/components/menu/MenuShowcaseSection';
import { defaultAboutPayload, defaultMenuPayload, defaultOrderProcessPayload, defaultTestimonialsPayload } from '@/lib/api';
import { getAboutUs, getBanners, getMenus, getOrderProcess, getSite, getTestimonials } from '@/lib/api.server';

export async function HomePageContent() {
  const [banners, aboutPayload, menuPayload, orderProcessPayload, testimonialsPayload, sitePayload] = await Promise.all([
    getBanners().catch(() => []),
    getAboutUs().catch(() => defaultAboutPayload),
    getMenus().catch(() => defaultMenuPayload),
    getOrderProcess().catch(() => defaultOrderProcessPayload),
    getTestimonials().catch(() => defaultTestimonialsPayload),
    getSite(),
  ]);

  return (
    <main>
      <CinematicHero banners={banners} />
      <HomeAboutShowcase about={aboutPayload.about} />
      <BurgerStackSection />
      <MenuShowcaseSection menu={menuPayload} />
      <MenuSignatureItemsSection section={menuPayload.signature_section} items={menuPayload.signature_items} />
      <OrderProcessSection payload={orderProcessPayload} />
      <HomeWhyChooseUsSection section={aboutPayload.why_choose_us} />
      <HomeTestimonialsSection payload={testimonialsPayload} />
      <ThatWrapSection site={sitePayload} />
    </main>
  );
}
