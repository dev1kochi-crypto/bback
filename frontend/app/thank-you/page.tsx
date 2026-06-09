import { ThankYouContent } from '@/components/thank-you/ThankYouContent';
import { SiteShell } from '@/components/layout/SiteShell';

export const metadata = {
  title: 'Thank You | B.back',
  description: 'Thank you for contacting B.back.',
};

export default function ThankYouPage() {
  return (
    <SiteShell pageBanner={{ logoOnly: true }}>
      <ThankYouContent />
    </SiteShell>
  );
}
