'use client';

import { motion, useReducedMotion } from 'framer-motion';

function Shimmer({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-[4px] bg-white/[0.08] ${className}`} />;
}

export function OrdersLoadingSpinner({ label }: { label: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center justify-center py-16 sm:py-20"
    >
      <div className="relative flex h-[72px] w-[72px] items-center justify-center">
        <span className="absolute inset-0 rounded-full border border-white/10" />
        <motion.span
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-ember border-r-ember/35"
        />
        <span className="absolute inset-[10px] animate-pulse rounded-full bg-ember/15" />
        <span className="relative grid h-8 w-8 place-items-center font-display text-[15px] font-medium text-ember">B</span>
      </div>
      <p className="mt-6 font-body text-[14px] font-normal text-white/55">{label}</p>
      <div className="mt-3 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ember [animation-delay:-0.2s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ember/80 [animation-delay:-0.1s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ember/60" />
      </div>
    </motion.div>
  );
}

export function OrderListLoadingState() {
  return (
    <div>
      <OrdersLoadingSpinner label="Loading your orders" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <article key={index} className="rounded-[8px] bg-[#232323] px-[18px] py-[16px]">
            <Shimmer className="h-3 w-28" />
            <div className="mt-3 flex items-center gap-3">
              <Shimmer className="h-[52px] w-[52px] shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Shimmer className="h-4 w-3/4" />
                <Shimmer className="h-3 w-1/2" />
              </div>
              <Shimmer className="h-7 w-14 shrink-0" />
            </div>
            <div className="mt-3 space-y-2">
              <Shimmer className="h-3 w-36" />
              <Shimmer className="h-3 w-20" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Shimmer className="h-[34px] w-full rounded-[4px]" />
              <Shimmer className="h-[34px] w-full rounded-[4px]" />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function OrderDetailLoadingState() {
  return (
    <div>
      <OrdersLoadingSpinner label="Loading order details" />
      <div className="animate-pulse">
        <div className="mb-8 space-y-3">
          <div className="flex flex-wrap items-center gap-4">
            <Shimmer className="h-8 w-64 max-w-full" />
            <Shimmer className="h-9 w-28" />
          </div>
          <Shimmer className="h-4 w-48" />
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,880px)_420px] xl:gap-12">
          <div className="space-y-7">
            <div className="rounded-[8px] border border-white/[0.09] bg-[#080d0e] p-6">
              <Shimmer className="h-5 w-32" />
              <Shimmer className="mt-4 h-4 w-full max-w-[520px]" />
              <div className="mt-5 border-t border-white/[0.07] pt-5">
                <div className="flex items-center gap-6 py-2">
                  <Shimmer className="h-[98px] w-[132px] shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-3">
                    <Shimmer className="h-7 w-2/3" />
                    <Shimmer className="h-4 w-1/3" />
                    <Shimmer className="h-3 w-full" />
                  </div>
                  <Shimmer className="h-8 w-16 shrink-0" />
                </div>
              </div>
            </div>

            <div className="rounded-[8px] border border-white/[0.09] bg-[#080d0e] p-6">
              <div className="flex items-start justify-between gap-4">
                <Shimmer className="h-5 w-36" />
                <Shimmer className="h-9 w-32" />
              </div>
              <div className="mt-5 space-y-3 border-t border-white/[0.07] pt-5">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="grid grid-cols-3 gap-5">
                    <Shimmer className="h-4 w-full" />
                    <Shimmer className="h-4 w-full" />
                    <Shimmer className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-7">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-[8px] border border-white/[0.09] bg-[#080d0e] p-[18px]">
                <Shimmer className="h-5 w-40" />
                <div className="mt-4 space-y-3 border-t border-white/[0.07] pt-4">
                  <Shimmer className="h-4 w-full" />
                  <Shimmer className="h-4 w-4/5" />
                </div>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
}
