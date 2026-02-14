# Implementation Plan: Tooltip Component

## Overview

สร้าง Tooltip component สำหรับ Tiinno UI โดยใช้ Radix UI Tooltip primitive, CVA pattern สำหรับ variant styling ไฟล์ทั้งหมดอยู่ใน `packages/ui/src/components/` เป็น flat kebab-case

## Tasks

- [x] 1. Install Radix UI Tooltip dependency and create Tooltip component
  - [x] 1.1 Install `@radix-ui/react-tooltip` package in `packages/ui`
    - Run `pnpm add @radix-ui/react-tooltip` in `packages/ui`
    - _Requirements: 1.1_

  - [x] 1.2 Create `tooltip.tsx` with all Tooltip components and CVA variants
    - Create `packages/ui/src/components/tooltip.tsx`
    - Import `@radix-ui/react-tooltip` primitives
    - Implement `TooltipProvider` wrapping Radix Tooltip.Provider with default delayDuration=300, skipDelayDuration=300
    - Implement `Tooltip` re-exporting Radix Tooltip.Root
    - Implement `TooltipTrigger` with forwardRef wrapping Radix Tooltip.Trigger
    - Define `tooltipContentVariants` CVA with variants: default (bg-neutral-900 text-neutral-50 + dark mode), light (bg-white text-neutral-900 border + dark mode), base classes include animation (data-[state=delayed-open]:animate-fade-in data-[state=closed]:animate-fade-out)
    - Implement `TooltipContent` with forwardRef, variant prop via CVA, side prop (default: top), sideOffset prop (default: 4), showArrow prop, Radix Portal
    - Implement `TooltipArrow` with forwardRef, fill color matching variant (fill-neutral-900 for default, fill-white for light, + dark mode)
    - Export all components, variants, and TypeScript interfaces (TooltipProviderProps, TooltipProps, TooltipContentProps, TooltipArrowProps)
    - Set displayName on all forwardRef components
    - _Requirements: 1.1, 1.2, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 3.1, 3.2, 3.3, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.4_

  - [x] 1.3 Update `packages/ui/src/components/index.ts` barrel export
    - Add `export * from './tooltip';`
    - _Requirements: 6.3_

- [x] 2. Checkpoint - Ensure component builds without errors
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Write tests for Tooltip component
  - [x] 3.1 Write unit tests for Tooltip component
    - Create `packages/ui/src/components/tooltip.test.tsx`
    - Test rendering: Tooltip renders with default props, TooltipContent renders in portal
    - Test variants: default variant has bg-neutral-900, light variant has bg-white and border
    - Test interactions: hover shows tooltip, focus shows tooltip, Escape closes tooltip
    - Test accessibility: role="tooltip" present, aria-describedby on trigger, keyboard focus works
    - Test defaults: default side is top, default sideOffset is 4
    - Test edge cases: controlled mode (open/onOpenChange), custom className, forwardRef works
    - Test arrow: showArrow=true renders arrow, showArrow=false/undefined does not
    - _Requirements: 2.7, 4.3, 5.1, 5.2, 5.3, 5.4_

  - [x] 3.2 Write property test: Variant styling correctness
    - **Property 1: Tooltip variant styling includes correct light and dark mode classes**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.10**

  - [x] 3.3 Write property test: Arrow presence matches showArrow prop
    - **Property 2: Arrow presence matches showArrow prop**
    - **Validates: Requirements 3.1, 3.3**

  - [x] 3.4 Write property test: Arrow fill color matches variant
    - **Property 3: Arrow fill color matches variant**
    - **Validates: Requirements 3.2**

  - [x] 3.5 Write property test: Module exports completeness
    - **Property 4: Module exports completeness**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

- [x] 4. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (4 properties total)
- Unit tests validate specific examples, accessibility, and edge cases
- ใช้ `fast-check` library สำหรับ property-based tests (มีอยู่แล้วใน project)
