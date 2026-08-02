'use client';
import { useState } from 'react';
import { Button, Skeleton, SkeletonGroup } from '@nim-ui/components';

/**
 * Toggling demo for SkeletonGroup — the transition is the point, so it needs
 * real state and therefore a client component (a live `<ComponentPreview>`
 * child cannot take a function prop across the RSC boundary).
 */
export function SkeletonGroupToggleDemo() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="w-full max-w-sm space-y-4">
      <SkeletonGroup
        loading={loading}
        label="Loading operator"
        fallback={
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        }
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-sm font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            AL
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-950 dark:text-neutral-50">Ada Lovelace</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">ada@nim.example</p>
          </div>
        </div>
      </SkeletonGroup>

      <Button size="sm" variant="outline" onClick={() => setLoading((v) => !v)}>
        {loading ? 'Finish loading' : 'Load again'}
      </Button>
    </div>
  );
}

/**
 * The same toggle with `loadedLabel` set, so the two can be compared side by
 * side — which is the only way to observe what that prop does.
 *
 * Without it the region's text goes to `''` when loading ends and nothing is
 * announced; with it the region announces completion. Neither behaviour is
 * visible on screen, and neither is observable from the DOM: both spellings
 * mount the same live region and keep the same node across the transition. It
 * takes a screen reader, which is why NIMUI-47 exists and why this demo does —
 * the "loadedLabel set vs unset" scenario had nothing on the site to test
 * against.
 */
export function SkeletonGroupLoadedLabelDemo() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="w-full max-w-sm space-y-4">
      <SkeletonGroup
        loading={loading}
        label="Loading operator"
        loadedLabel="Operator loaded"
        fallback={
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        }
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-sm font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            AL
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-950 dark:text-neutral-50">Ada Lovelace</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">ada@nim.example</p>
          </div>
        </div>
      </SkeletonGroup>

      <Button size="sm" variant="outline" onClick={() => setLoading((v) => !v)}>
        {loading ? 'Finish loading' : 'Load again'}
      </Button>
    </div>
  );
}
