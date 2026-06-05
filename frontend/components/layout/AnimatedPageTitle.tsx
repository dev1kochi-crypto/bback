'use client';

import gsap from 'gsap';
import { useEffect, useRef } from 'react';

interface AnimatedPageTitleProps {
  title: string;
}

export function AnimatedPageTitle({ title }: AnimatedPageTitleProps) {
  const rootRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const root = rootRef.current;
    if (!root) {
      return;
    }

    const letters = root.querySelectorAll('[data-title-letter]');
    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

    timeline.fromTo(
      letters,
      { autoAlpha: 0, y: 24, z: -40, rotateX: -26 },
      {
        autoAlpha: 1,
        y: 0,
        z: 0,
        rotateX: 0,
        duration: 0.65,
        stagger: 0.04,
      },
    );

    gsap.to(root, {
      y: -5,
      duration: 3.2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: 1.4,
    });
  }, []);

  return (
    <h1 ref={rootRef} className="page-title">
      <span className="page-title__word">
        {title.split('').map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            data-title-letter
            className="page-title__letter"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </span>
        ))}
      </span>
    </h1>
  );
}
