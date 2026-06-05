'use client';

import { absoluteAssetUrl } from '@/lib/api';
import type { AboutUsContent } from '@/types/about';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef, useState } from 'react';

interface AboutStorySectionProps {
  about: AboutUsContent | null;
}

const fallbackMediaImage = absoluteAssetUrl('/app/images/about2.png') ?? '/app/images/about2.png';
const titleUnderline = absoluteAssetUrl('/app/images/Vector-2.png') ?? '/app/images/Vector-2.png';

export function AboutStorySection({ about }: AboutStorySectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const titleY = useTransform(scrollYProgress, [0, 1], [24, -26]);
  const mediaY = useTransform(scrollYProgress, [0, 1], [34, -34]);
  const glowY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const title = about?.about_page_title || [about?.line_1, about?.line_2].filter(Boolean).join(' ') || 'Smile, You Are In B-Back';
  const videoSrc = about?.video_type === 'upload' ? about.video_file : about?.video_url;
  const mediaImage = about?.video_thumbnail || fallbackMediaImage;
  const description = about?.long_description || about?.short_description;
  const embedSrc = getPlayableVideoUrl(videoSrc);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[#071011] px-6 pb-[52px] pt-[78px] text-white sm:px-10 lg:px-16 lg:pb-[64px] lg:pt-[88px]">
      {!prefersReducedMotion ? (
        <>
          <motion.div
            className="pointer-events-none absolute left-[7%] top-[18%] h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(246,139,36,0.12),transparent_70%)] blur-2xl"
            style={{ y: glowY }}
          />
          <motion.div
            className="pointer-events-none absolute right-[10%] top-[42%] h-2 w-2 rounded-full bg-ember/70 shadow-[0_0_36px_rgba(246,139,36,0.8)]"
            animate={{ y: [0, -28, 0], x: [0, 12, 0], scale: [1, 1.35, 1], opacity: [0.35, 0.9, 0.35] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="pointer-events-none absolute left-[18%] bottom-[22%] h-10 w-10 rounded-full bg-white/10 blur-[1px]"
            animate={{ y: [0, -40, 0], x: [0, -16, 0], opacity: [0.12, 0.28, 0.12] }}
            transition={{ duration: 8.4, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
          />
        </>
      ) : null}
      <div className="mx-auto max-w-[1420px]">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.45 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto text-center"
          style={prefersReducedMotion ? undefined : { y: titleY }}
        >
          <h2 className="font-display text-[clamp(3.1rem,4.2vw,5.05rem)] font-black uppercase leading-[0.96] tracking-[0.01em] text-white md:whitespace-nowrap">
            {title}
          </h2>
          <Image
            src={titleUnderline}
            alt=""
            width={306}
            height={14}
            className="mx-auto mt-[18px] h-auto w-[282px] translate-x-[168px] object-contain max-md:translate-x-0"
          />
          {description ? (
            <div
              className="mx-auto mt-[34px] max-w-[1060px] text-center text-[16px] leading-[1.58] text-[#9b9b9b] sm:text-[19px] [&_p]:m-0"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : (
            <p className="mx-auto mt-[34px] max-w-[1060px] text-[16px] leading-[1.58] text-[#9b9b9b] sm:text-[19px]">
              Premium burgers, crafted bites, and a restaurant experience built around bold flavor and warm service.
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-[86px] aspect-[616/367] max-w-[1320px] overflow-hidden bg-[#151515] shadow-[0_26px_70px_rgba(0,0,0,0.45)]"
          style={prefersReducedMotion ? undefined : { y: mediaY, transformPerspective: 1200 }}
          whileHover={prefersReducedMotion ? undefined : { rotateX: 1.5, scale: 1.008 }}
        >
          {isPlaying && embedSrc ? (
            about?.video_type === 'upload' || isDirectVideoUrl(embedSrc) ? (
              <video controls autoPlay playsInline className="h-full w-full object-cover">
                <source src={embedSrc} />
              </video>
            ) : (
              <iframe
                src={embedSrc}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title="About B-back video"
              />
            )
          ) : (
            <>
              <Image src={mediaImage} alt="B-back restaurant service" fill sizes="(min-width: 1024px) 1480px, 100vw" className="object-cover" priority={false} />
              <div className="absolute inset-0 bg-black/10" />
              <button
                type="button"
                aria-label="Play about video"
                disabled={!videoSrc}
                onClick={() => videoSrc && setIsPlaying(true)}
                className="absolute left-1/2 top-1/2 grid h-[86px] w-[86px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#645b5d]/85 text-white shadow-[0_18px_45px_rgba(0,0,0,0.4)] transition duration-300 enabled:hover:scale-105 enabled:hover:bg-[#72686a] disabled:cursor-default"
              >
                <span className="ml-1 h-0 w-0 border-y-[15px] border-l-[22px] border-y-transparent border-l-white" />
              </button>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function getPlayableVideoUrl(src?: string | null): string | null {
  if (!src) {
    return null;
  }

  try {
    const url = new URL(src);
    const host = url.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : src;
    }

    if (host.includes('youtube.com')) {
      const id = url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).pop();
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : src;
    }

    if (host.includes('vimeo.com')) {
      const id = url.pathname.split('/').filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : src;
    }

    return src;
  } catch {
    return src;
  }
}

function isDirectVideoUrl(src: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(src);
}
