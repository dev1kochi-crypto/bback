'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

const easeOut = [0.22, 1, 0.36, 1] as const;

function ThankYouHeading({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <h1 className="thank-you-hero__title">
      <span className="thank-you-hero__title-inner">
        <span className="thank-you-hero__title-text">Tha</span>
        <span className="thank-you-hero__letter-n">
          <span className="thank-you-hero__title-text thank-you-hero__letter-n-char">n</span>
          <motion.span
            className="thank-you-hero__cap"
            aria-hidden="true"
            initial={
              reducedMotion
                ? { opacity: 0, x: '-50%', y: '0.12em', rotateZ: -10 }
                : {
                    opacity: 0,
                    x: 'calc(-50% + 9rem)',
                    y: '-220%',
                    z: 420,
                    rotateX: -68,
                    rotateY: 52,
                    rotateZ: 28,
                    scale: 0.28,
                  }
            }
            animate={{
              opacity: 1,
              x: '-50%',
              y: '0.12em',
              z: 0,
              rotateX: 0,
              rotateY: 0,
              rotateZ: -10,
              scale: 1,
            }}
            transition={
              reducedMotion
                ? { duration: 0.35, delay: 0.2 }
                : { duration: 1.15, delay: 0.42, ease: easeOut }
            }
          >
            <Image
              src="/app/images/Isolation_Mode.png"
              alt=""
              width={120}
              height={100}
              priority
              className="thank-you-hero__cap-image"
            />
          </motion.span>
        </span>
        <span className="thank-you-hero__title-text">k You</span>
      </span>
    </h1>
  );
}

export function ThankYouContent() {
  const reducedMotion = useReducedMotion();

  return (
    <main className="thank-you-page">
      <motion.section
        className="thank-you-page__stage"
        initial={reducedMotion ? false : { opacity: 0, y: 64 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.78, ease: easeOut }}
      >
        <ThankYouHeading reducedMotion={Boolean(reducedMotion)} />
        <motion.p
          className="thank-you-page__message"
          initial={reducedMotion ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reducedMotion ? 0.15 : 0.62, ease: easeOut }}
        >
          Your submission has been received.
          <br />
          We will be in touch and contact you soon!
        </motion.p>
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: reducedMotion ? 0.25 : 0.78, ease: easeOut }}
        >
          <Link href="/" className="thank-you-page__button">
            Back To Home Page
          </Link>
        </motion.div>
      </motion.section>
    </main>
  );
}
