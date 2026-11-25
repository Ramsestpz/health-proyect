export default function Logo({ light = false }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg viewBox="0 0 64 64" className="h-9 w-9 shrink-0" aria-hidden="true">
        <rect width="64" height="64" rx="16" fill={light ? '#ffffff' : '#10243a'} />
        <path d="M32 54s-17-10.5-17-25a10 10 0 0 1 17-7 10 10 0 0 1 17 7c0 14.5-17 25-17 25z" fill="#e4572e" />
        <path d="M29 24h6v6h6v6h-6v6h-6v-6h-6v-6h6z" fill="#fff" />
      </svg>
      <span className={`font-display text-xl leading-none font-extrabold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>
        SaludCerca<span className="text-coral"> León</span>
      </span>
    </span>
  );
}
