# Implementation Plan: Popover Component

## Overview

สร้าง Popover component สำหรับ Nim UI โดยใช้ Radix UI Popover primitive, CVA pattern สำหรับ variant styling ไฟล์ทั้งหมดอยู่ใน `packages/ui/src/components/` เป็น flat kebab-case รวมถึง docs page, MCP registry entry, และ sidebar config update

## Tasks

- [x] 1. Install Radix UI Popover dependency and create Popover component
  - [x] 1.1 Install `@radix-ui/react-popover` package in `packages/ui`
    - Run `pnpm add @radix-ui/react-popover` in `packages/ui`
    - _Requirements: 1.1_

  - [x] 1.2 Create `popover.tsx` with all Popover components and CVA variants
    - Create `packages/ui/src/components/popover.tsx`
    - Import `@radix-ui/react-popover` primitives
    - Implement `PopoverProvider` as optional wrapper that renders children directly
    - Implement `Popover` re-exporting Radix Popover.Root
    - Implement `PopoverTrigger` with forwardRef wrapping Radix Popover.Trigger
    - Define `popoverContentVariants` CVA with variants: default (bg-white text-neutral-900 border border-neutral-200 shadow-md + dark mode), outline (bg-white text-neutral-900 border-2 border-neutral-300 + dark mode), base classes include animation (data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out)
    - Implement `PopoverContent` with forwardRef, variant prop via CVA, side prop (default: bottom), sideOffset prop (default: 4), showArrow prop, Radix Portal
    - Implement `PopoverArrow` with forwardRef, fill-white dark:fill-neutral-800 for all variants
    - Implement `PopoverClose` with forwardRef wrapping Radix Popover.Close
    - Export all components, variants, and TypeScript interfaces (PopoverProviderProps, PopoverProps, PopoverTriggerProps, PopoverContentProps, PopoverArrowProps, PopoverCloseProps)
    - Set displayName on all forwardRef components
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 5.1, 5.2, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.1, 7.2, 7.4_

  - [x] 1.3 Update `packages/ui/src/components/index.ts` barrel export
    - Add `export * from './popover';`
    - _Requirements: 7.3_

- [x] 2. Checkpoint - Ensure component builds without errors
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Write tests for Popover component
  - [x] 3.1 Write unit tests for Popover component
    - Create `packages/ui/src/components/popover.test.tsx`
    - Test rendering: Popover renders with default props, PopoverContent renders in portal
    - Test variants: default variant has bg-white and border, outline variant has border-2
    - Test interactions: click opens popover, click outside closes, Escape closes, PopoverClose closes
    - Test accessibility: role="dialog" present, focus moves to content on open, focus returns to trigger on close, focus trap
    - Test defaults: default side is bottom, default sideOffset is 4
    - Test edge cases: controlled mode (open/onOpenChange), custom className, forwardRef works
    - Test arrow: showArrow=true renders arrow, showArrow=false/undefined does not
    - Test PopoverClose: click closes popover, asChild works
    - _Requirements: 1.2, 1.3, 2.6, 2.7, 4.1, 4.2, 4.3, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 3.2 Write property test: Variant styling correctness
    - **Property 1: Popover variant styling includes correct light and dark mode classes**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.10**

  - [x] 3.3 Write property test: Arrow presence matches showArrow prop
    - **Property 2: Arrow presence matches showArrow prop**
    - **Validates: Requirements 3.1, 3.3**

  - [x] 3.4 Write property test: Arrow fill color is consistent across variants
    - **Property 3: Arrow fill color is consistent across variants**
    - **Validates: Requirements 3.2**

  - [x] 3.5 Write property test: Module exports completeness
    - **Property 4: Module exports completeness**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create documentation and registry entries
  - [x] 5.1 Create PopoverDemo.tsx for docs interactive demos
    - Create `packages/docs/src/components/PopoverDemo.tsx`
    - Implement PopoverBasicDemo, PopoverVariantsDemo, PopoverArrowDemo, PopoverSidesDemo, PopoverCloseDemo
    - _Requirements: 2.1, 2.5, 3.1, 4.2_

  - [x] 5.2 Create popover.mdx documentation page
    - Create `packages/docs/src/content/docs/components/feedback/popover.mdx`
    - Include sections: Import, Basic Usage, Variants, Arrow, Positioning, Close Button, Controlled Mode, Component Architecture, Props tables, Accessibility, Keyboard Support
    - _Requirements: 2.1, 2.5, 3.1, 4.1, 6.1_

  - [x] 5.3 Add Popover to sidebar config in astro.config.mjs
    - Add `{ label: 'Popover', slug: 'components/feedback/popover' }` to the Feedback section
    - _Requirements: 7.3_

  - [x] 5.4 Add Popover entry to MCP registry
    - Add Popover component entry to `packages/ui/src/registry/index.json`
    - Include name, category (overlay), description, keywords, file, variants, hasRadixPrimitive, examples
    - _Requirements: 7.3_

- [x] 6. Final checkpoint - Ensure all tests pass and docs build
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (4 properties total)
- Unit tests validate specific examples, accessibility, and edge cases
- ใช้ `fast-check` library สำหรับ property-based tests (มีอยู่แล้วใน project)
- Popover ใช้ pattern เดียวกับ Tooltip แต่เปิดด้วย click แทน hover, มี focus trap, และรองรับ rich content
