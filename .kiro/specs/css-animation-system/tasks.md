# Implementation Plan: CSS Animation System

## Overview

เพิ่มระบบ CSS-only animation ให้ Nim UI โดยแก้ไขไฟล์ที่มีอยู่แล้ว: เพิ่ม animation tokens, @keyframes, reduced motion support ใน styles.css และ tokens.js จากนั้นอัปเดต CVA class strings ของแต่ละ component

## Tasks

- [x] 1. Add animation design tokens and keyframes
  - [x] 1.1 Add animation tokens to `packages/tailwind-config/src/tokens.js`
    - Add `animation.duration` object with `fast` (150ms), `normal` (200ms), `slow` (300ms)
    - Add `animation.easing` object with `ease-out`, `ease-in`, `ease-in-out` cubic-bezier values
    - _Requirements: 1.1, 1.2, 1.4_
  - [x] 1.2 Add animation CSS custom properties and @keyframes to `packages/ui/src/styles.css`
    - Add `--duration-fast`, `--duration-normal`, `--duration-slow` to `@theme` block
    - Add `--ease-out`, `--ease-in`, `--ease-in-out` to `@theme` block
    - Add `--animate-*` declarations for all keyframe animations to `@theme` block
    - Add all 12 `@keyframes` definitions (fade-in/out, scale-in/out, slide-in/out × 4 directions)
    - Add `@media (prefers-reduced-motion: reduce)` rule to disable animations
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 7.1, 7.2, 7.3_
  - [x] 1.3 Write property tests for animation tokens and keyframes
    - **Property 1: Animation token completeness**
    - **Validates: Requirements 1.1, 1.2**
    - **Property 2: Token consistency (round-trip)**
    - **Validates: Requirements 1.4**
    - **Property 3: GPU-only keyframes**
    - **Validates: Requirements 3.1**
    - **Property 7: Keyframe completeness**
    - **Validates: Requirements 7.1**

- [x] 2. Checkpoint - Verify tokens and keyframes
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Update overlay component animations (Modal, Drawer, Select)
  - [x] 3.1 Update Modal component (`packages/ui/src/components/modal.tsx`)
    - Replace `tailwindcss-animate` classes in `ModalOverlay` with custom `animate-fade-in`/`animate-fade-out` using `data-[state=*]` selectors
    - Replace `tailwindcss-animate` classes in `ModalContent` with custom `animate-scale-in`/`animate-scale-out` using `data-[state=*]` selectors
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 9.3_
  - [x] 3.2 Update Drawer component (`packages/ui/src/components/drawer.tsx`)
    - Replace `tailwindcss-animate` classes in `DrawerOverlay` with custom `animate-fade-in`/`animate-fade-out`
    - Update `DrawerContent` side variants to use `animate-slide-in-from-left`/`animate-slide-out-to-left` for left side and `animate-slide-in-from-right`/`animate-slide-out-to-right` for right side
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 9.3_
  - [x] 3.3 Update Select component (`packages/ui/src/components/select.tsx`)
    - Replace `tailwindcss-animate` classes in `SelectContent` with custom `animate-scale-in`/`animate-scale-out` using `data-[state=*]` selectors
    - _Requirements: 4.1, 4.2, 4.3, 9.3_
  - [x] 3.4 Write property tests for overlay animations
    - **Property 4: Overlay animation state coverage**
    - **Validates: Requirements 4.1, 4.2, 4.3, 9.3**
    - **Property 5: Drawer direction matching**
    - **Validates: Requirements 4.5**

- [x] 4. Update form control transitions (Button, Input, Textarea, Switch, Checkbox)
  - [x] 4.1 Update Button component (`packages/ui/src/components/button.tsx`)
    - Change `transition-colors` to `transition-all duration-fast` in base CVA classes
    - Add `active:scale-[0.97]` to base CVA classes
    - _Requirements: 6.1, 6.2_
  - [x] 4.2 Update Input component (`packages/ui/src/components/input.tsx`)
    - Update `transition-colors` to `transition-[border-color,box-shadow] duration-fast ease-in-out` in base CVA classes
    - _Requirements: 5.1_
  - [x] 4.3 Update Textarea component (`packages/ui/src/components/textarea.tsx`)
    - Update `transition-colors` to `transition-[border-color,box-shadow] duration-fast ease-in-out` in base CVA classes
    - _Requirements: 5.1_
  - [x] 4.4 Update Switch component (`packages/ui/src/components/switch.tsx`)
    - Add `transition-colors duration-fast ease-in-out` to track (root) CVA classes
    - Ensure thumb already has `transition-transform`; add `duration-fast ease-out` if missing
    - _Requirements: 5.2, 5.4_
  - [x] 4.5 Update Checkbox component (`packages/ui/src/components/checkbox.tsx`)
    - Add `transition-[background-color,border-color] duration-fast ease-in-out` to base CVA classes
    - _Requirements: 5.3, 5.4_
  - [x] 4.6 Write property tests for form control transitions
    - **Property 6: Form control Radix state selectors**
    - **Validates: Requirements 5.4**

- [x] 5. Update interactive component feedback (Card, Tabs, Badge)
  - [x] 5.1 Update Card component (`packages/ui/src/components/card.tsx`)
    - Add `transition-[box-shadow,transform] duration-fast ease-out hover:-translate-y-0.5 hover:shadow-md` to base CVA classes
    - _Requirements: 6.3_
  - [x] 5.2 Update Tabs trigger (`packages/ui/src/components/tabs.tsx`)
    - Ensure `TabsTrigger` CVA has `transition-[background-color,box-shadow,color] duration-fast ease-in-out`
    - _Requirements: 6.4_
  - [x] 5.3 Update Badge component (`packages/ui/src/components/badge.tsx`)
    - Add `animate` boolean variant to CVA: `{ true: 'animate-scale-in' }`
    - Update `BadgeProps` interface to include the new variant
    - _Requirements: 6.5_
  - [x] 5.4 Write property test for backward compatibility
    - **Property 8: Backward compatible props**
    - **Validates: Requirements 9.1**

- [x] 6. Final checkpoint - Run full test suite
  - Ensure all 1188+ existing tests still pass
  - Run `pnpm lint && pnpm typecheck && pnpm test && pnpm build`
  - Ensure no new JS dependencies were added
  - Ask the user if questions arise.
  - _Requirements: 8.1, 8.2, 8.3, 9.2_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All changes are to existing files — no new component files are created
- Property tests go in `packages/ui/src/components/__tests__/animation-system.test.ts`
- The existing `tailwindcss-animate` classes in Modal/Drawer/Select will be replaced with custom keyframe-based classes
- Each task references specific requirements for traceability
