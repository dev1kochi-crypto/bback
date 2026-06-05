export default function Loading() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[500] h-[3px] overflow-hidden bg-white/10"
    >
      <div className="h-full w-1/3 animate-[page-load_0.9s_ease-in-out_infinite] bg-ember" />
    </div>
  );
}
