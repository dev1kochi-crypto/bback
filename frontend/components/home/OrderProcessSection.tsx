'use client';

import { absoluteAssetUrl } from '@/lib/api';
import type { OrderProcessPayload } from '@/types/orderProcess';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';

interface OrderProcessSectionProps {
  payload: OrderProcessPayload;
}

const underline = '/app/images/Vector-2.png';
const friesTop = '/app/images/floating_fries_01 1.png';

export function OrderProcessSection({ payload }: OrderProcessSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const section = payload.section;
  const items = payload.items.filter((item) => item.title || item.description || item.icon);
  const titleHtml = section?.title ? lineBreakHtml(section.title) : null;
  const titleText = section?.title ? plainLineBreakText(section.title) : null;
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const imageProgress = useSpring(scrollYProgress, { stiffness: 76, damping: 24, mass: 0.42 });
  const imageX = useTransform(imageProgress, [0, 0.35, 1], ['-18%', '0%', '5%']);
  const imageRotate = useTransform(imageProgress, [0, 0.42, 1], [-4, 0, 1.2]);
  const imageScale = useTransform(imageProgress, [0, 0.42, 1], [0.92, 1, 1.025]);
  const contentY = useTransform(imageProgress, [0, 0.45, 1], [42, 0, -18]);

  if (!section?.display_home || !section.image || items.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[#050505] px-6 py-[82px] text-white sm:px-10 lg:px-12 lg:py-[108px]">
      <div className="pointer-events-none absolute inset-0 bg-[url('/app/images/Mask group (18).jpg')] bg-cover bg-center opacity-[0.18]" />
      <motion.div
        className="pointer-events-none absolute right-[-64px] top-[88px] hidden h-[560px] w-[250px] lg:block xl:right-[-42px] xl:h-[660px] xl:w-[295px] 2xl:right-[-28px]"
        initial={prefersReducedMotion ? false : { opacity: 0, x: 40, rotate: 8, filter: 'blur(8px)' }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0, rotate: 0, filter: 'blur(0px)' }}
        animate={prefersReducedMotion ? undefined : { y: [0, -18, 12, 0], rotate: [0, 3.5, -2, 0], scale: [1, 1.035, 0.99, 1] }}
        viewport={{ once: false, amount: 0.25 }}
        transition={{
          opacity: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
          x: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
          rotate: { duration: 7.6, repeat: Infinity, ease: 'easeInOut' },
          y: { duration: 7.6, repeat: Infinity, ease: 'easeInOut' },
          scale: { duration: 7.6, repeat: Infinity, ease: 'easeInOut' },
          filter: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
        }}
      >
        <Image src={absoluteAssetUrl(friesTop) ?? friesTop} alt="" fill sizes="175px" className="object-contain" unoptimized />
      </motion.div>

      <div className="relative z-10 mx-auto grid max-w-[1560px] items-center gap-7 lg:grid-cols-[minmax(510px,0.9fr)_minmax(430px,1fr)] xl:gap-5 2xl:gap-6">
        <motion.div
          className="relative min-h-[400px] lg:-ml-[9vw] lg:min-h-[560px] xl:-ml-[9vw] xl:min-h-[620px] 2xl:-ml-[9vw]"
          initial={prefersReducedMotion ? false : { opacity: 0, x: -120, rotateY: -12, filter: 'blur(14px)' }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0, rotateY: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
          style={prefersReducedMotion ? undefined : { x: imageX, rotateZ: imageRotate, scale: imageScale, transformPerspective: 1200, transformStyle: 'preserve-3d' }}
        >
          <Image
            src={section.image}
            alt={section.image_alt || titleText || 'Order process'}
            fill
            sizes="(min-width: 1024px) 760px, 100vw"
            className="object-contain object-left drop-shadow-[0_42px_80px_rgba(0,0,0,0.45)]"
          />
        </motion.div>

        <motion.div className="relative max-w-[720px] lg:-ml-10 xl:-ml-16 2xl:-ml-20" style={prefersReducedMotion ? undefined : { y: contentY }}>
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 34, rotateX: 7, filter: 'blur(10px)' }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
            viewport={{ once: false, amount: 0.35 }}
            transition={{ duration: 0.82, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformPerspective: 1000, transformStyle: 'preserve-3d' }}
          >
            {section.line_1 ? <p className="font-display text-[13px] font-semibold uppercase tracking-[0.04em] text-white/50">{section.line_1}</p> : null}
            {titleHtml ? (
              <>
                <h2
                  className="mt-2 max-w-[560px] font-title text-[clamp(3.8rem,5vw,6rem)] font-normal uppercase leading-[0.95] text-white"
                  dangerouslySetInnerHTML={{ __html: titleHtml }}
                />
                <motion.div
                  initial={prefersReducedMotion ? false : { scaleX: 0, opacity: 0 }}
                  whileInView={prefersReducedMotion ? undefined : { scaleX: 1, opacity: 1 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
                  className="mt-4 origin-left translate-x-[96px] max-sm:translate-x-0"
                >
                  <Image src={underline} alt="" width={306} height={14} className="h-auto w-[235px] object-contain" />
                </motion.div>
              </>
            ) : null}
            {section.description ? (
              <p className="mt-8 max-w-[640px] font-display text-[16px] font-light leading-[1.45] tracking-[0.25px] text-[#BEBEBE]">
                {section.description}
              </p>
            ) : null}
          </motion.div>

          <div className="relative mt-9 space-y-7 before:absolute before:left-[23px] before:top-6 before:h-[calc(100%-3rem)] before:w-px before:border-l before:border-dotted before:border-white/28">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                className="relative grid grid-cols-[48px_1fr] gap-5"
                initial={prefersReducedMotion ? false : { opacity: 0, x: 34, y: 12, rotateY: 6, filter: 'blur(8px)' }}
                whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0, y: 0, rotateY: 0, filter: 'blur(0px)' }}
                viewport={{ once: false, amount: 0.25 }}
                transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1], delay: index * 0.09 }}
                style={{ transformPerspective: 900, transformStyle: 'preserve-3d' }}
              >
                <motion.div
                  className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white"
                  animate={prefersReducedMotion ? undefined : { y: [0, -4, 0], boxShadow: ['0 0 0 rgba(255,122,0,0)', '0 0 24px rgba(255,122,0,0.28)', '0 0 0 rgba(255,122,0,0)'] }}
                  transition={prefersReducedMotion ? undefined : { duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: index * 0.35 }}
                >
                  {item.icon ? (
                    <Image src={item.icon} alt={item.icon_alt || ''} width={25} height={25} className="h-[25px] w-[25px] object-contain" />
                  ) : (
                    <span className="h-3 w-3 rounded-full bg-ember" />
                  )}
                </motion.div>
                <div className="pt-1">
                  {item.title ? <h3 className="font-display text-[18px] font-semibold leading-none tracking-[0.04em] text-white">{item.title}</h3> : null}
                  {item.description ? <p className="mt-2 max-w-[610px] font-display text-[15px] font-light leading-[1.45] tracking-[0.25px] text-[#BEBEBE]">{item.description}</p> : null}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function lineBreakHtml(value: string): string {
  const normalized = value.replace(/&lt;\s*br\s*\/?\s*&gt;/gi, '<br>');

  return normalized
    .split(/<\s*br\s*\/?\s*>/gi)
    .map(escapeHtml)
    .join('<br />');
}

function plainLineBreakText(value: string): string {
  return value
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
