'use client';

import type { AboutUsContent } from '@/types/about';
import { motion, useReducedMotion } from 'framer-motion';

interface AboutValuesSectionProps {
  about: AboutUsContent | null;
}

const cards = [
  { key: 'mission', title: 'Mission', field: 'mission' },
  { key: 'vision', title: 'Vision', field: 'vision' },
  { key: 'core_value', title: 'Core Value', field: 'core_value' },
] as const;

export function AboutValuesSection({ about }: AboutValuesSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[#000] px-6 pb-[80px] pt-[48px] text-white sm:px-10 sm:pb-[92px] sm:pt-[60px] lg:px-16 lg:pb-[104px] lg:pt-[68px]">
      {!prefersReducedMotion ? (
        <motion.div
          className="pointer-events-none absolute inset-x-[12%] top-0 h-[260px] rounded-full bg-[radial-gradient(circle,rgba(246,139,36,0.08),transparent_72%)] blur-3xl"
          animate={{ opacity: [0.18, 0.38, 0.18], scale: [1, 1.08, 1] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : null}
      <div className="mx-auto grid max-w-[1480px] gap-12 text-center md:grid-cols-3 lg:gap-[150px]">
        {cards.map((card, index) => (
          <motion.article
            key={card.key}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 28, rotateX: 5, filter: 'blur(8px)' }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: [0, -5, 0], rotateX: 0, filter: 'blur(0px)' }}
            whileHover={prefersReducedMotion ? undefined : { y: -8, rotateX: 2, scale: 1.015 }}
            viewport={{ once: false, amount: 0.28 }}
            transition={{
              opacity: { duration: 0.65, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] },
              y: { duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: index * 0.45 },
              rotateX: { duration: 0.65, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] },
              filter: { duration: 0.65, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] },
            }}
            className="mx-auto max-w-[450px]"
            style={{ transformPerspective: 1000, transformStyle: 'preserve-3d' }}
          >
            <ValueBadge title={card.title} />
            <p className="mx-auto mt-9 max-w-[430px] text-center text-[16px] leading-[1.42] text-[#9f9f9f] sm:mt-[48px] sm:text-[18px] lg:mt-[58px] lg:text-[20px] lg:leading-[1.38]">
              {about?.[card.field] || `Add ${card.title.toLowerCase()} content in the About Us admin module.`}
            </p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function ValueBadge({ title }: { title: string }) {
  return (
    <div className="relative mx-auto h-[96px] w-[232px] sm:h-[108px] sm:w-[262px] lg:h-[118px] lg:w-[286px]">
      <svg
        viewBox="0 0 286 118"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        <path
          d="M32 75C21 47 67 20 135 11C203 2 262 20 255 52C247 88 183 110 104 106C62 104 39 94 32 75Z"
          fill="none"
          stroke="#ff850f"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M170 13C198 12 225 19 241 34"
          fill="none"
          stroke="#ff850f"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <h3 className="absolute inset-0 flex items-center justify-center pb-1 font-display text-[28px] font-black uppercase leading-none text-white sm:text-[32px] lg:text-[35px]">
        {title}
      </h3>
    </div>
  );
}
