'use client';

import { Snippet, CopyButton } from '@/components/nim';

export function SnippetBasic() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Snippet text="ord_2f9c8a71-44d0-4b7e-9a3d-1c5e8b2f6a90" />
      <Snippet text="whsec_Xk92mPq47TzR8vLnW3jYbA5cD1eF6gH0" />
    </div>
  );
}

export function SnippetWithPrefix() {
  return (
    <div className="w-full max-w-md">
      <Snippet prefix="$" text="pnpm add @nim-ui/components" />
    </div>
  );
}

export function SnippetSizes() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Snippet size="sm" text="sk_live_51H8… (small)" />
      <Snippet size="md" text="sk_live_51H8… (medium)" />
    </div>
  );
}

export function CopyButtonInline() {
  return (
    <div className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
      <span className="font-mono text-xs">cus_9x82mQ</span>
      <CopyButton value="cus_9x82mQ" aria-label="Copy customer id" />
    </div>
  );
}
