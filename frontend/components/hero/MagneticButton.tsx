'use client';

import Link from 'next/link';
import { useRef } from 'react';

interface MagneticButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'solid' | 'outline';
}

export function MagneticButton({ href, children, variant = 'solid' }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={(event) => {
        const element = ref.current;
        if (!element) {
          return;
        }

        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        element.style.transform = `translate(${x * 0.16}px, ${y * 0.18}px) scale(1.035)`;
      }}
      onMouseLeave={() => {
        if (ref.current) {
          ref.current.style.transform = 'translate(0, 0) scale(1)';
        }
      }}
      className={[
        'theme-btn relative inline-flex  min-w-36 items-center justify-center overflow-hidden  uppercase tracking-normal transition-transform duration-300 ease-out',
        variant === 'solid'
          ? 'bg-ember text-white shadow-glow before:absolute before:inset-0 before:-translate-x-full before:bg-white/20 before:transition-transform before:duration-500 hover:before:translate-x-full'
          : 'border border-white/70 bg-black/20 text-white backdrop-blur hover:border-ember hover:text-ember',
      ].join(' ')}
    >
      <span className="relative z-10">
        {children}</span>
    </Link>
  );
}
