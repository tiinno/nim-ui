'use client';

import { useState } from 'react';
import { LiveProvider, LiveEditor, LivePreview, LiveError } from 'react-live';
import type { Language, PrismTheme } from 'prism-react-renderer';
import * as React from 'react';
import * as Nim from '@/components/nim';

/**
 * LivePlayground — editable example: edit the JSX below and the preview
 * re-renders instantly (react-live + sucrase, all client-side, so it works
 * on the static export).
 *
 * The editor panel stays deep-ink in both themes, mirroring the code blocks.
 */

// Ink-press editor theme — tuned to the JetBrains Mono / deep-ink code blocks
const inkTheme: PrismTheme = {
  plain: {
    color: 'oklch(0.9 0.005 90)',
    backgroundColor: 'transparent',
  },
  styles: [
    { types: ['comment', 'prolog', 'doctype', 'cdata'], style: { color: 'oklch(0.55 0.012 262)', fontStyle: 'italic' } },
    { types: ['punctuation'], style: { color: 'oklch(0.72 0.01 262)' } },
    { types: ['tag', 'keyword', 'operator'], style: { color: 'oklch(0.78 0.06 20)' } },
    { types: ['attr-name'], style: { color: 'oklch(0.82 0.05 250)' } },
    { types: ['string', 'attr-value', 'char'], style: { color: 'oklch(0.8 0.06 145)' } },
    { types: ['number', 'boolean', 'constant'], style: { color: 'oklch(0.8 0.07 70)' } },
    { types: ['function', 'class-name', 'maybe-class-name'], style: { color: 'oklch(0.85 0.04 250)' } },
    { types: ['variable', 'parameter'], style: { color: 'oklch(0.9 0.005 90)' } },
  ],
};

const scope = {
  ...Nim,
  React,
  useState: React.useState,
  useEffect: React.useEffect,
  useRef: React.useRef,
};

interface LivePlaygroundProps {
  /** Initial JSX source. Rendered with react-live in JSX-expression mode. */
  code: string;
  language?: Language;
}

export function LivePlayground({ code, language = 'tsx' }: LivePlaygroundProps) {
  const [source, setSource] = useState(code.trim());
  const dirty = source !== code.trim();

  return (
    <div className="not-prose my-8 min-w-0 max-w-full overflow-hidden rounded-xl border border-fd-border bg-white shadow-soft dark:bg-neutral-950">
      <LiveProvider code={source} scope={scope} theme={inkTheme} language={language}>
        <div className="preview-canvas relative isolate flex min-h-36 min-w-0 items-center justify-center overflow-x-auto p-6 sm:p-10">
          <div className="flex w-full min-w-0 flex-wrap items-center justify-center gap-4">
            <LivePreview />
          </div>
        </div>

        <LiveError className="m-0 block max-h-40 overflow-auto border-t border-error-200 bg-error-50 px-4 py-3 font-mono text-xs leading-5 text-error-700 dark:border-error-900/60 dark:bg-error-950/30 dark:text-error-300" />

        <div className="relative border-t border-fd-border bg-[oklch(0.16_0.012_264)]">
          <div className="flex items-center justify-between px-4 pt-2.5">
            <span className="font-mono text-[11px] font-medium uppercase tracking-wide text-[oklch(0.6_0.012_262)]">
              Editable
            </span>
            {dirty && (
              <button
                type="button"
                onClick={() => setSource(code.trim())}
                className="rounded font-mono text-[11px] text-[oklch(0.72_0.05_248)] transition-colors hover:text-[oklch(0.85_0.04_250)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
              >
                Reset
              </button>
            )}
          </div>
          <LiveEditor
            onChange={setSource}
            className="live-editor font-mono text-[13px] leading-6 [&_pre]:!bg-transparent [&_pre]:!p-4 [&_textarea]:!p-4 [&_textarea]:focus:outline-none"
          />
        </div>
      </LiveProvider>
    </div>
  );
}
