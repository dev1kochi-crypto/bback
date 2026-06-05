import { AboutCtaSection } from '@/components/about/AboutCtaSection';
import { AboutStorySection } from '@/components/about/AboutStorySection';
import { AboutValuesSection } from '@/components/about/AboutValuesSection';
import { WhyChooseUsSection } from '@/components/about/WhyChooseUsSection';
import { getAboutUs } from '@/lib/api.server';

export async function AboutPageContent() {
  const payload = await getAboutUs();

  return (
    <main className="bg-[#050505]">
      <AboutStorySection about={payload.about} />
      <AboutValuesSection about={payload.about} />
      <WhyChooseUsSection section={payload.why_choose_us} />
      <AboutCtaSection />
    </main>
  );
}
