type MenuPhotoPlaceholderProps = {
  size?: 'card' | 'thumb';
};

function NoPhotoBadge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" strokeDasharray="5 4" opacity="0.55" />
      <g stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 24h7l3-5h16l3 5h7a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V28a4 4 0 0 1 4-4z" />
        <circle cx="32" cy="36" r="7" />
        <path d="M18 18l28 28" />
      </g>
    </svg>
  );
}

export function MenuPhotoPlaceholder({ size = 'card' }: MenuPhotoPlaceholderProps) {
  const isCard = size === 'card';

  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center transition-colors duration-300 ${
        isCard ? '-translate-y-[10px] gap-3 px-3' : 'gap-1 px-1'
      }`}
      aria-hidden="true"
    >
      <NoPhotoBadge className={isCard ? 'h-[78px] w-[78px] text-white/90 group-hover:text-[#1a0f06] group-focus-within:text-[#1a0f06] group-active:text-[#1a0f06]' : 'h-10 w-10 text-white/85 group-active:text-[#1a0f06]'} />

      {isCard ? (
        <div className="text-center font-display font-black uppercase leading-[1.15] tracking-[0.18em] text-white transition-colors duration-300 group-hover:text-[#1a0f06] group-focus-within:text-[#1a0f06] group-active:text-[#1a0f06]">
          <p className="text-[13px]">Photo</p>
          <p className="text-[13px] text-white/75 group-hover:text-[#1a0f06]/80 group-focus-within:text-[#1a0f06]/80 group-active:text-[#1a0f06]/80">
            Coming Soon
          </p>
        </div>
      ) : (
        <p className="text-center font-display text-[7px] font-bold uppercase tracking-[0.1em] text-white/80 group-active:text-[#1a0f06]">
          Soon
        </p>
      )}
    </div>
  );
}
