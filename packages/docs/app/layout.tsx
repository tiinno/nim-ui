import './global.css';
import { Provider } from '@/components/provider';
import { Fraunces, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

// Editorial-ink type system — Fraunces (display) / Hanken Grotesk (UI) / JetBrains Mono (code).
// Deliberately NOT Inter/Geist to avoid the generic shadcn-default aesthetic.
const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
});
const sans = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Nim UI',
    default: 'Nim UI',
  },
  description:
    'Quiet, accessible React UI kit for dashboards, backoffice, and commerce operations',
  icons: { icon: '/favicon.svg' },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
