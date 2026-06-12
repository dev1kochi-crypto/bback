'use client';

import { MagneticButton } from '@/components/hero/MagneticButton';
import { absoluteAssetUrl, submitContactEnquiry } from '@/lib/api';
import type { ContactDetails } from '@/types/contact';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

interface ContactFormSectionProps {
  contact: ContactDetails;
}

const formIcons = {
  email: absoluteAssetUrl('/app/images/eva_email-outline.png') ?? '/app/images/eva_email-outline.png',
  message: absoluteAssetUrl('/app/images/tabler_message.png') ?? '/app/images/tabler_message.png',
  phone: absoluteAssetUrl('/app/images/proicons_phone.png') ?? '/app/images/proicons_phone.png',
  user: absoluteAssetUrl('/app/images/lucide_user-round.png') ?? '/app/images/lucide_user-round.png',
};

export function ContactFormSection({ contact }: ContactFormSectionProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setFeedback(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await submitContactEnquiry({
        first_name: String(formData.get('first_name') ?? ''),
        last_name: String(formData.get('last_name') ?? ''),
        email: String(formData.get('email') ?? ''),
        phone: String(formData.get('phone') ?? ''),
        message: String(formData.get('message') ?? ''),
        page_url: typeof window !== 'undefined' ? window.location.href : undefined,
      });

      setStatus('success');
      setFeedback(response.message);
      form.reset();
      router.push('/thank-you');
    } catch {
      setStatus('error');
      setFeedback('Something went wrong. Please try again.');
    }
  }

  return (
    <section className="border-t border-[#2c2c2c] bg-[#050505] px-6 py-[70px] text-white sm:px-10 sm:py-[88px] lg:px-16">
      <div className="mx-auto grid max-w-[1568px] gap-14 lg:grid-cols-[minmax(0,776px)_minmax(480px,714px)] lg:items-start lg:justify-between">
        <div data-section-motion>
          <h2 data-reveal className="font-display text-[36px] font-medium leading-none tracking-[0.04em] text-white sm:text-[40px]">Connect With Us</h2>
          <p data-reveal className="mt-5 max-w-[660px] font-display text-[18px] font-normal leading-relaxed text-white/58">
            Have a question about our menu or reservations? We’re always happy to help. Send us a message, and our team will get back to you shortly.          
          </p>

          <form data-motion-form className="mt-[46px] space-y-6 font-display" onSubmit={handleSubmit}>
            <div className="grid gap-6 sm:gap-7 lg:grid-cols-2 2xl:grid-cols-[376px_376px]">
              <label data-motion-field className="block">
                <span className="mb-3 block text-[18px] font-normal leading-none text-white/58">First Name</span>
                <div className="relative h-[70px] w-full border border-[#2c2c2c] bg-black transition focus-within:border-ember sm:h-20">
                  <Image src={formIcons.user} alt="" width={20} height={20} className="absolute left-6 top-[25px] h-5 w-5 object-contain sm:left-[29px] sm:top-[29px]" />
                  <input
                    name="first_name"
                    required
                    placeholder="Enter first name"
                    className="h-full w-full bg-transparent pl-[58px] pr-5 font-display text-[16px] font-normal text-white outline-none placeholder:text-white/65 sm:pl-[67px] sm:text-[18px]"
                  />
                </div>
              </label>
              <label data-motion-field className="block">
                <span className="mb-3 block text-[18px] font-normal leading-none text-white/58">Last Name</span>
                <div className="relative h-[70px] w-full border border-[#2c2c2c] bg-black transition focus-within:border-ember sm:h-20">
                  <Image src={formIcons.user} alt="" width={20} height={20} className="absolute left-6 top-[25px] h-5 w-5 object-contain sm:left-[29px] sm:top-[29px]" />
                  <input
                    name="last_name"
                    required
                    placeholder="Enter last name"
                    className="h-full w-full bg-transparent pl-[58px] pr-5 font-display text-[16px] font-normal text-white outline-none placeholder:text-white/65 sm:pl-[67px] sm:text-[18px]"
                  />
                </div>
              </label>
            </div>

            <div className="grid gap-6 sm:gap-7 lg:grid-cols-2 2xl:grid-cols-[376px_376px]">
              <label data-motion-field className="block">
                <span className="mb-3 block text-[18px] font-normal leading-none text-white/58">Email</span>
                <div className="relative h-[70px] w-full border border-[#2c2c2c] bg-black transition focus-within:border-ember sm:h-20">
                  <Image src={formIcons.email} alt="" width={22} height={22} className="absolute left-6 top-[24px] h-[22px] w-[22px] object-contain sm:left-[28px] sm:top-[29px]" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Enter email address"
                    className="h-full w-full bg-transparent pl-[58px] pr-5 font-display text-[16px] font-normal text-white outline-none placeholder:text-white/65 sm:pl-[67px] sm:text-[18px]"
                  />
                </div>
              </label>
              <label data-motion-field className="block">
                <span className="mb-3 block text-[18px] font-normal leading-none text-white/58">Phone</span>
                <div className="relative h-[70px] w-full border border-[#2c2c2c] bg-black transition focus-within:border-ember sm:h-20">
                  <Image src={formIcons.phone} alt="" width={20} height={20} className="absolute left-6 top-[25px] h-5 w-5 object-contain sm:left-[29px] sm:top-[29px]" />
                  <input
                    name="phone"
                    placeholder="Enter phone number"
                    className="h-full w-full bg-transparent pl-[58px] pr-5 font-display text-[16px] font-normal text-white outline-none placeholder:text-white/65 sm:pl-[67px] sm:text-[18px]"
                  />
                </div>
              </label>
            </div>

            <label data-motion-field className="block">
              <span className="mb-3 block text-[18px] font-normal leading-none text-white/58">Comments</span>
              <div className="relative h-[165px] w-full border border-[#2c2c2c] bg-black transition focus-within:border-ember sm:h-[185px]">
                <Image src={formIcons.message} alt="" width={22} height={22} className="absolute left-6 top-[25px] h-[22px] w-[22px] object-contain sm:left-[28px] sm:top-[29px]" />
                <textarea
                  name="message"
                  required
                  placeholder="Enter your comments"
                  className="h-full w-full resize-none bg-transparent pb-5 pl-[58px] pr-5 pt-[25px] font-display text-[16px] font-normal text-white outline-none placeholder:text-white/65 sm:pl-[67px] sm:pt-[27px] sm:text-[18px]"
                />
              </div>
            </label>

            {feedback ? (
              <p className={`text-sm ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>{feedback}</p>
            ) : null}

            <button
              data-magnetic
              type="submit"
              disabled={status === 'loading'}
              className="mt-8 inline-flex h-[50px] w-full items-center justify-center bg-ember font-display text-[18px] font-medium uppercase tracking-normal text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:w-[239px] sm:text-[20px]"
            >
              {status === 'loading' ? 'Please Wait...' : 'Submit Your Comments'}
            </button>
          </form>
        </div>

        <div data-section-motion data-tilt-card className="min-h-[360px] overflow-hidden border border-white/10 bg-[#101416] sm:min-h-[495px] lg:min-h-[706px]">
          {contact.map_embed_url ? (
            <iframe
              title="Restaurant location map"
              src={contact.map_embed_url}
              className="min-h-[360px] w-full sm:min-h-[495px] lg:min-h-[706px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 p-8 text-center text-white/45 sm:min-h-[495px] sm:p-10 lg:min-h-[706px]">
              <p>Add a Google Map link in Site Information to display the map here.</p>
              {contact.address ? <p className="max-w-sm text-white/70">{contact.address}</p> : null}
              {contact.google_map_link ? (
                <MagneticButton href={contact.google_map_link}>Open In Maps</MagneticButton>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
