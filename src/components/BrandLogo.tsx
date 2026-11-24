import { Compass } from 'lucide-react';

interface BrandLogoProps {
  compact?: boolean;
}

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <div
        className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-[#0E9F6E] text-white shadow-[0_4px_14px_rgb(14,159,110,0.28)]"
        aria-hidden="true"
      >
        <Compass className="h-5 w-5" strokeWidth={2.2} />
      </div>
      <div className="flex flex-col items-start text-left">
        <span
          className={`font-extrabold tracking-tight leading-none text-[#10231C] ${
            compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
          }`}
        >
          MakeIt<span className="text-[#0E9F6E]">Real</span>
        </span>
        <span className="mt-0.5 text-[11px] sm:text-xs font-light tracking-wide text-[#5B6B65] leading-none">
          &quot;hacelo real&quot;
        </span>
      </div>
    </div>
  );
}
