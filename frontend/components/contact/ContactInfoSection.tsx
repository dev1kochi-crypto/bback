import { absoluteAssetUrl } from '@/lib/api';
import { siteAssets } from '@/lib/assets';
import type { ContactDetails } from '@/types/contact';
import Image from 'next/image';

interface ContactInfoSectionProps {
  contact: ContactDetails;
}

function parseHoursLine(line: string): { label: string; hours: string } {
  if (line.includes(':')) {
    const [label, hours] = line.split(/:(.+)/).map((part) => part?.trim() ?? '');

    return { label: label || line, hours };
  }

  const spaced = line.match(/^(.+?)\s{2,}(.+)$/);

  if (spaced) {
    return { label: spaced[1].trim(), hours: spaced[2].trim() };
  }

  return { label: line, hours: '' };
}

function normalizeOpeningHours(value: string): string[] {
  return value
    .split(/\r?\n/)
    .flatMap((line) => line.split(/\s*(?:\||;)\s*/))
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function OpeningHoursList({ value }: { value: string }) {
  const lines = normalizeOpeningHours(value);

  return (
    <div className="space-y-4 font-display text-[18px] font-normal leading-none text-white/72 sm:text-[22px] lg:text-[24px]">
      {lines.map((line) => {
        const { label, hours } = parseHoursLine(line);

        return (
          <div key={line} className="flex flex-wrap items-baseline justify-between gap-7">
            <span className="text-white">{label}</span>
            {hours ? <span>{hours}</span> : null}
          </div>
        );
      })}
    </div>
  );
}

function ContactIcon({ src, alt }: { src: string; alt: string }) {
  const resolved = absoluteAssetUrl(src) ?? src;

  return <Image src={resolved} alt={alt} width={28} height={28} className="h-7 w-7 shrink-0 object-contain" />;
}

export function ContactInfoSection({ contact }: ContactInfoSectionProps) {
  const directionHref = contact.google_map_link ?? (contact.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}` : undefined);

  return (
    <section className="bg-[#050505] px-6 py-[62px] text-white sm:px-10 sm:py-[74px] lg:px-16 lg:py-[96px]">
      <div className="mx-auto grid max-w-[1280px] items-center gap-10 lg:grid-cols-[265px_421px_345px] lg:justify-between lg:gap-10">
        <div data-section-motion data-tilt-card className="py-8 lg:flex lg:min-h-[207px] lg:flex-col lg:justify-center">
          <h2 data-reveal className="font-display text-[30px] font-medium leading-none tracking-[0.04em] text-white sm:text-[34px] lg:text-[36px]">Contact Info</h2>
          <div className="mt-7 space-y-6 font-display text-[20px] font-normal leading-tight text-white/72 sm:mt-8 sm:space-y-7 sm:text-[24px] lg:text-[28px] lg:leading-none">
            {contact.phone ? (
              <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="flex items-center gap-5 transition hover:text-ember">
                <ContactIcon src={siteAssets.contactPhoneIcon} alt="Phone" />
                <span>{contact.phone}</span>
              </a>
            ) : null}
            {contact.email ? (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-5 transition hover:text-ember">
                <ContactIcon src={siteAssets.contactMailIcon} alt="Email" />
                <span>{contact.email}</span>
              </a>
            ) : null}
          </div>
        </div>

        <div data-section-motion data-tilt-card className="flex min-h-[207px] w-full max-w-[421px] flex-col items-center justify-center bg-[#171717] px-7 py-9 text-center sm:px-10 lg:h-[207px]">
          <ContactIcon src={siteAssets.contactDirectionsIcon} alt="Directions" />
          <h2 data-reveal className="mt-4 font-display text-[30px] font-medium leading-none tracking-[0.04em] text-white sm:text-[34px] lg:text-[36px]">Get Direction</h2>
          {contact.address ? (
            directionHref ? (
              <a data-reveal href={directionHref} target="_blank" rel="noreferrer" className="mt-4 block max-w-[260px] font-display text-[20px] font-normal leading-tight text-white/72 transition hover:text-ember sm:text-[24px] lg:text-[28px]">
                {contact.address}
              </a>
            ) : (
              <p data-reveal className="mt-4 max-w-[260px] font-display text-[20px] font-normal leading-tight text-white/72 sm:text-[24px] lg:text-[28px]">{contact.address}</p>
            )
          ) : (
            <p data-reveal className="mt-5 text-lg text-white/45">Address will appear once configured in Site Information.</p>
          )}
        </div>

        <div data-section-motion data-tilt-card className="py-8 lg:flex lg:min-h-[207px] lg:flex-col lg:justify-center">
          <h2 data-reveal className="font-display text-[30px] font-medium leading-none tracking-[0.04em] text-white sm:text-[34px] lg:text-[36px]">Opening Hours</h2>
          <div className="mt-8">
            {contact.opening_hours?.trim() ? (
              <OpeningHoursList value={contact.opening_hours} />
            ) : (
              <p data-reveal className="text-lg text-white/45">Opening hours will appear once configured in Site Information.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
