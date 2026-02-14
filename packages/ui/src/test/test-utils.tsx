import { ReactElement } from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';

/**
 * Custom render function with common providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  return render(ui, { ...options });
}

/**
 * Utility to test dark mode variants
 */
export function enableDarkMode() {
  document.documentElement.classList.add('dark');
}

export function disableDarkMode() {
  document.documentElement.classList.remove('dark');
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
