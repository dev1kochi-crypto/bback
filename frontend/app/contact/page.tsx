import { ContactFormSection } from '@/components/contact/ContactFormSection';
import { ContactInfoSection } from '@/components/contact/ContactInfoSection';
import { ContactAmbientLayer, ContactMotionEnhancer } from '@/components/contact/ContactMotionEnhancer';
import { ContactThreeScene } from '@/components/contact/ContactThreeScene';
import { SiteShell } from '@/components/layout/SiteShell';
import { getContact } from '@/lib/api.server';
import { buildPageMetadata } from '@/lib/pageMetadata';

export const revalidate = 120;

export async function generateMetadata() {
  return buildPageMetadata('contact', {
    title: 'Contact Us | B.back',
    description: 'Get in touch with B.back for reservations, catering, and enquiries.',
    canonicalPath: '/contact',
  });
}

export default async function ContactPage() {
  const payload = await getContact();

  return (
    <SiteShell activeNavUrl="/contact" pageBanner={{ title: 'Contact Us' }}>
      <main className="relative overflow-hidden bg-[#050505]">
        <ContactAmbientLayer />
        <div className="absolute inset-x-0 top-0 h-[680px] opacity-35 blur-[0.2px]">
          <ContactThreeScene />
        </div>
        <div className="relative z-10">
          <ContactInfoSection contact={payload.contact} />
          <ContactFormSection contact={payload.contact} />
        </div>
        <ContactMotionEnhancer />
      </main>
    </SiteShell>
  );
}
