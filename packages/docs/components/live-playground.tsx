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

/*
 * Nim Ink, dark column — the same nine tokens as the fenced code blocks (see
 * lib/nim-ink-theme.ts). Unconditionally dark in both site themes because this
 * editor panel is a fixed dark surface. prism-react-renderer takes fontWeight
 * and fontStyle directly in `style`, so none of the Shiki CSS plumbing in
 * global.css applies here.
 */
const inkTheme: PrismTheme = {
  plain: {
    color: '#D2CEC4',
    backgroundColor: 'transparent',
  },
  styles: [
    // comment
    { types: ['comment', 'prolog', 'doctype', 'cdata'], style: { color: '#9C947F', fontStyle: 'italic' } },
    // plain
    { types: ['plain', 'variable', 'parameter', 'text'], style: { color: '#D2CEC4' } },
    // property
    { types: ['attr-name', 'property', 'selector'], style: { color: '#9FB4CC' } },
    // entity
    { types: ['tag', 'class-name', 'maybe-class-name', 'builtin'], style: { color: '#EDEAE3', fontWeight: 'bold' } },
    // keyword
    { types: ['keyword', 'atrule', 'imports', 'exports'], style: { color: '#9DA2A8' } },
    // function
    { types: ['function', 'method', 'function-variable'], style: { color: '#7E95AF' } },
    // constant
    { types: ['number', 'boolean', 'constant', 'symbol', 'unit', 'entity'], style: { color: '#A08A62' } },
    // punctuation
    { types: ['punctuation', 'operator'], style: { color: '#848992' } },
    // string — last, so quote marks match their contents
    { types: ['string', 'attr-value', 'char', 'regex', 'url'], style: { color: '#B09B72' } },
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
  const [copied, setCopied] = useState(false);
  const dirty = source !== code.trim();

  const copySource = () => {
    void navigator.clipboard?.writeText(source).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="not-prose my-8 min-w-0 max-w-full overflow-hidden rounded-md border border-fd-border bg-white shadow-soft dark:bg-neutral-950">
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
            <span className="flex items-center gap-4">
              {dirty && (
                <button
                  type="button"
                  onClick={() => setSource(code.trim())}
                  className="rounded font-mono text-[11px] text-[oklch(0.72_0.05_248)] transition-colors hover:text-[oklch(0.85_0.04_250)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={copySource}
                aria-label="Copy code"
                className="rounded font-mono text-[11px] text-[oklch(0.6_0.012_262)] transition-colors hover:text-[oklch(0.9_0.005_90)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </span>
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
