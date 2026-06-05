'use client';

import type { MenuSignatureItem, MenuSignatureSection } from '@/types/menu';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface MenuSignatureItemsSectionProps {
  section: MenuSignatureSection | null;
  items: MenuSignatureItem[];
}

const underline = '/app/images/Vector-2.png';
const whatsappIcon = '/app/images/white-whtsapp.svg';

export function MenuSignatureItemsSection({ section, items }: MenuSignatureItemsSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const visibleItems = items.filter((item) => item.image || item.title).slice(0, 4);
  const leadItems = visibleItems.slice(0, 2);
  const supportingItems = visibleItems.slice(2);

  if (!section?.display_home || visibleItems.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-[#050505] px-6 pb-[126px] pt-[104px] text-white sm:px-10 lg:px-12 lg:pb-[156px] lg:pt-[132px]">
      <div className="pointer-events-none absolute inset-0 bg-[url('/app/images/Mask group (18).jpg')] bg-cover bg-center opacity-20" />
      <div className="pointer-events-none absolute bottom-[-28px] left-[-14px] font-title text-[clamp(8rem,16vw,18.5rem)] font-normal uppercase leading-none text-white/[0.08]">
        Signature Items
      </div>

      <div className="relative z-10 mx-auto grid max-w-[1566px] items-start gap-5 lg:grid-cols-[minmax(230px,373px)_minmax(230px,373px)_minmax(420px,748px)] lg:items-end xl:gap-6">
        {leadItems.map((item, index) => (
          <SignatureCard key={item.id} item={item} index={index} />
        ))}

        <div className={`flex min-w-0 flex-col justify-start pt-3 lg:pl-0 ${leadItems.length === 1 ? 'lg:col-span-2' : ''}`}>
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 28, filter: 'blur(8px)' }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: false, amount: 0.35 }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          >
            {section.line_2 ? (
              <>
                <h2 className="font-title text-[clamp(3.6rem,6.65vw,6rem)] font-normal uppercase leading-none text-white">
                  {section.line_2}
                </h2>
                <Image src={underline} alt="" width={306} height={14} className="mt-4 h-auto w-[250px] translate-x-[210px] object-contain max-lg:translate-x-0" />
              </>
            ) : null}
            {section.short_description ? (
              <p className={`${section.line_2 ? 'mt-8' : ''} max-w-[748px] font-display text-[20px] font-light leading-normal tracking-[0.8px] text-[#DEDEDE]`}>
                {section.short_description}
              </p>
            ) : null}
          </motion.div>

          {supportingItems.length > 0 ? (
            <div className="mt-8 grid max-w-[770px] items-end gap-5 sm:grid-cols-2 xl:gap-6">
              {supportingItems.map((item, index) => (
                <SignatureCard key={item.id} item={item} index={index + leadItems.length} light={index === 1} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function SignatureCard({ item, light = false, index }: { item: MenuSignatureItem; light?: boolean; index: number }) {
  const prefersReducedMotion = useReducedMotion();
  const titleHtml = item.title ? signatureTitleHtml(item.title) : null;
  const titleText = item.title ? plainSignatureTitle(item.title) : null;
  const config = signatureCardConfig(index, light);

  return (
    <motion.article
      initial={prefersReducedMotion ? false : { opacity: 0, y: 34, rotateX: 6, filter: 'blur(10px)' }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: [0, -5, 0], rotateX: 0, filter: 'blur(0px)' }}
      whileHover={prefersReducedMotion ? undefined : { y: -8, scale: 1.012 }}
      viewport={{ once: false, amount: 0.28 }}
      transition={{
        opacity: { duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] },
        y: { duration: 5.4, repeat: Infinity, ease: 'easeInOut', delay: index * 0.35 },
        rotateX: { duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] },
        filter: { duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] },
      }}
      className={`group relative w-full max-w-[373px] overflow-hidden rounded-[20px] ${config.aspect} ${config.background} shadow-[0_24px_70px_rgba(0,0,0,0.42)]`}
      style={{ transformPerspective: 1000, transformStyle: 'preserve-3d' }}
    >
      {titleHtml ? (
        <div className={`absolute inset-x-0 z-20 ${config.titlePosition} ${config.titlePanel} px-6 py-7 sm:px-7`}>
          <h3
            className={`font-title ${config.titleSize} font-normal uppercase leading-none`}
            dangerouslySetInnerHTML={{ __html: titleHtml }}
          />
          <Link
            href="/contact"
            className={`oder-btn  mt-5 inline-flex h-[38px] items-center justify-center gap-2 px-4 font-display text-[12px] font-medium uppercase tracking-normal transition ${light ? 'bg-[#050505] text-white hover:bg-ember' : 'bg-ember text-white hover:bg-white hover:text-ember'
              }`}
          >
            <Image src={whatsappIcon} alt="" width={15} height={15} className="h-[15px] w-[15px] object-contain" unoptimized />
            Order Now
          </Link>
        </div>
      ) : null}
      {item.image ? (
        <div className={`absolute z-10 overflow-hidden ${config.imageFrame}`}>
          <Image
            src={item.image}
            alt={item.image_alt || titleText || 'Signature item'}
            fill
            sizes="(min-width: 1024px) 373px, 100vw"
            className={`${config.imageClass} transition duration-700 group-hover:scale-[1.045]`}
          />
        </div>
      ) : null}
      <div className={`pointer-events-none absolute inset-0 z-[15] ${config.overlay}`} />
    </motion.article>
  );
}

function signatureCardConfig(index: number, light: boolean) {
  if (index === 0) {
    return {
      aspect: 'aspect-[373/962]',
      background: 'bg-[#0D0D0D]',
      titlePanel: 'top-0 min-h-[28%] bg-[#0D0D0D] text-white',
      titlePosition: 'top-0',
      titleSize: 'text-[clamp(3rem,2.75vw,4.2rem)]',
      imageFrame: 'inset-x-0 bottom-0 h-[76%]',
      imageClass: 'object-cover object-[center_58%]',
      overlay: 'bg-gradient-to-b from-transparent via-transparent to-black/18',
    };
  }

  if (index === 1) {
    return {
      aspect: 'aspect-[373/962]',
      background: 'bg-[#0D0D0D]',
      titlePanel: 'bottom-0 min-h-[30%] bg-[#0D0D0D] text-white',
      titlePosition: 'bottom-0',
      titleSize: 'text-[clamp(3rem,2.75vw,4.2rem)]',
      imageFrame: 'inset-x-0 top-0 h-[74%]',
      imageClass: 'object-cover object-[center_32%]',
      overlay: 'bg-gradient-to-b from-black/10 via-transparent to-transparent',
    };
  }

  if (index === 2) {
    return {
      aspect: 'aspect-[373/564]',
      background: 'bg-[#0D0D0D]',
      titlePanel: 'top-0 min-h-[35%] bg-gradient-to-b from-[#0D0D0D] via-[#0D0D0D]/92 to-[#0D0D0D]/8 text-white',
      titlePosition: 'top-0',
      titleSize: 'text-[clamp(2.7rem,2.5vw,3.8rem)]',
      imageFrame: 'inset-0',
      imageClass: 'object-cover object-center',
      overlay: 'bg-gradient-to-b from-black/22 via-transparent to-black/10',
    };
  }

  return {
    aspect: 'aspect-[373/493]',
    background: light ? 'bg-[#FFEAC4]' : 'bg-[#0D0D0D]',
    titlePanel: light
      ? 'top-0 h-[170px] bg-[#FFEAC4] text-[#B45400]'
      : 'top-0 min-h-[34%] bg-gradient-to-b from-[#0D0D0D] via-[#0D0D0D]/92 to-[#0D0D0D]/8 text-white',
    titlePosition: 'top-0',
    titleSize: light ? 'text-[clamp(2.95rem,2.6vw,3.9rem)]' : 'text-[clamp(2.5rem,2.35vw,3.5rem)]',
    imageFrame: light ? 'inset-x-0 bottom-0 h-[78%]' : 'inset-0',
    imageClass: light ? 'object-cover object-[center_72%]' : 'object-cover object-center',
    overlay: light ? 'bg-gradient-to-b from-transparent via-transparent to-[#FFEAC4]/10' : 'bg-gradient-to-b from-black/20 via-transparent to-black/10',
  };
}

function signatureTitleHtml(title: string): string {
  const normalized = title.replace(/&lt;\s*br\s*\/?\s*&gt;/gi, '<br>');

  return normalized
    .split(/<\s*br\s*\/?\s*>/gi)
    .map(escapeHtml)
    .join('<br />');
}

function plainSignatureTitle(title: string): string {
  return title
    .replace(/&lt;\s*br\s*\/?\s*&gt;/gi, ' ')
    .replace(/<\s*br\s*\/?\s*>/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
