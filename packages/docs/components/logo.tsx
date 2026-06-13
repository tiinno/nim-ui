import type { SVGProps } from 'react';

/**
 * Nim UI monogram — an ink "chip" with a negative-space N.
 * The chip fills with the foreground ink; the N is knocked out in the
 * page background, so the mark inverts cleanly between light and dark.
 */
export function LogoMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <rect x="1.5" y="1.5" width="29" height="29" rx="7.5" className="fill-fd-foreground" />
      <path
        d="M10.6 22.5 V9.5 L21.4 22.5 V9.5"
        fill="none"
        className="stroke-fd-background"
        strokeWidth="3"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark className="h-[26px] w-[26px] shrink-0" />
      <span className="font-display text-[1.15rem] font-medium leading-none tracking-tight text-fd-foreground">
        Nim
      </span>
      <span className="rounded-[4px] border border-fd-border px-1.5 py-0.5 font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] leading-none text-fd-muted-foreground">
        UI
      </span>
    </span>
  );
}
