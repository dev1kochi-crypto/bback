'use client';

import { AnimatePresence, motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

const ease = [0.22, 1, 0.36, 1] as const;

export function CommercePage({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function CommerceStagger({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type CommerceItemProps = Omit<HTMLMotionProps<'div'>, 'children'> & {
  children: ReactNode;
};

export function CommerceItem({ children, className = '', ...props }: CommerceItemProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 14 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.36, ease } },
      }}
      layout
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CommercePanel({ children, className = '', delay = 0.12 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.44, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function CommerceSection({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <section className={className}>{children}</section>;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease, delay }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export function CommerceFade({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function CommerceDrawer({ open, children, className = '' }: { open: boolean; children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return open ? <aside className={className}>{children}</aside> : null;
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.34, ease }}
          className={className}
        >
          {children}
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

export function CommerceOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return open ? <div className="fixed inset-0 z-[240] bg-black/72" onClick={onClose} /> : null;
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24 }}
          className="fixed inset-0 z-[240] bg-black/72"
          onClick={onClose}
        />
      ) : null}
    </AnimatePresence>
  );
}
