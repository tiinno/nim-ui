/**
 * Registry schema definitions for component metadata
 * Used by MCP server to provide component information
 */

export interface ComponentMeta {
  /** Unique component identifier */
  name: string;
  /** Component category for organization */
  category: 'primitives' | 'layout' | 'data-display' | 'commerce' | 'landing' | 'forms';
  /** Brief description of component purpose */
  description: string;
  /** Keywords for search functionality */
  keywords: string[];
  /** File path relative to src/ */
  file: string;
  /** List of available variants */
  variants: {
    name: string;
    values: string[];
  }[];
  /** Whether component uses Radix UI */
  hasRadixPrimitive: boolean;
  /** Usage examples */
  examples: {
    title: string;
    code: string;
  }[];
}

export interface RegistryData {
  version: string;
  components: ComponentMeta[];
}
