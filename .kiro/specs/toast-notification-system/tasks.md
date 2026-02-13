# Implementation Plan: Toast/Notification System

## Overview

สร้างระบบ Toast/Notification สำหรับ Tiinno UI โดยใช้ Radix UI Toast primitive, CVA pattern, และ external store สำหรับ imperative API ไฟล์ทั้งหมดอยู่ใน `packages/ui/src/components/` เป็น flat kebab-case

## Tasks

- [x] 1. Install Radix UI Toast dependency and create Toast Store
  - [x] 1.1 Install `@radix-ui/react-toast` package in `packages/ui`
    - Run `pnpm add @radix-ui/react-toast` in `packages/ui`
    - _Requirements: 1.1_

  - [x] 1.2 Create `toast-store.ts` with external store and imperative API
    - Create `packages/ui/src/components/toast-store.ts`
    - Implement `ToastData` and `ToastOptions` types
    - Implement store with `toasts` array, `listeners` Set, `subscribe()`, `getSnapshot()`, `add()`, `dismiss()`, `clear()`
    - Implement `toast()` function that creates ToastData with unique id and adds to store
    - Implement shorthand functions: `toast.success()`, `toast.error()`, `toast.warning()`, `toast.info()`
    - Implement `toast.dismiss(id)` and `toast.clear()`
    - Export `toast`, `toastStore`, `useToastStore`, and all types
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 8.3_

  - [x] 1.3 Write property tests for Toast Store
    - **Property 3: Toast store maintains chronological ordering**
    - **Validates: Requirements 1.5**
    - **Property 4: Toast add round-trip — toast() creates findable toast with matching properties**
    - **Validates: Requirements 6.2, 6.4, 6.6**
    - **Property 5: Toast dismiss removes only the targeted toast**
    - **Validates: Requirements 6.5, 6.7**
    - **Property 6: Shorthand functions set correct variant**
    - **Validates: Requirements 6.3**

- [x] 2. Checkpoint - Ensure store tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Create Toast Component with CVA variants
  - [x] 3.1 Create `toast.tsx` with Toast component and CVA variants
    - Create `packages/ui/src/components/toast.tsx`
    - Import `@radix-ui/react-toast` primitives
    - Define `toastVariants` CVA with variants: default, success, error, warning, info (light + dark mode classes using design tokens)
    - Define `viewportVariants` CVA with position variants: top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
    - Implement `ToastProvider` wrapping Radix Toast.Provider
    - Implement `ToastViewport` with forwardRef, position prop via CVA, ARIA live region attributes
    - Implement `Toast` component with forwardRef, variant prop via CVA, Radix Toast.Root as base, enter/exit animations using existing CSS animation classes (data-[state=open]:animate-slide-in-from-right, data-[state=closed]:animate-fade-out), swipe handling classes
    - Implement sub-components: `ToastTitle`, `ToastDescription`, `ToastClose` (with aria-label), `ToastAction` — all with forwardRef
    - Export all components, variants, and TypeScript interfaces
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 4.1, 5.1, 5.2, 7.1, 7.2, 7.3, 7.5, 8.1, 8.2_

  - [x] 3.2 Create `Toaster` convenience component in `toast.tsx`
    - Implement `Toaster` component that combines ToastProvider + ToastViewport + renders toasts from store via `useSyncExternalStore`
    - Accept `position`, `duration`, `swipeDirection` props
    - Wire `onOpenChange` to dismiss toast from store when closed
    - Render ToastTitle, ToastDescription, ToastAction, ToastClose for each toast
    - _Requirements: 1.1, 1.2, 1.5, 3.1, 3.2, 3.3, 3.4, 4.2, 4.3, 4.4_

  - [x] 3.3 Write property tests for Toast CVA variants
    - **Property 1: Position variant maps to correct CSS classes**
    - **Validates: Requirements 1.3**
    - **Property 2: Toast variant styling includes light and dark mode classes**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**

- [x] 4. Wire exports and integration
  - [x] 4.1 Update `packages/ui/src/components/index.ts` barrel export
    - Add `export * from './toast';` and `export * from './toast-store';`
    - _Requirements: 8.4_

  - [x] 4.2 Write module export property test and unit tests
    - **Property 7: Module exports completeness**
    - **Validates: Requirements 8.1, 8.2, 8.4**
    - Write unit tests for: rendering Toast with default props, each variant renders correct classes, ToastClose has aria-label, Toaster renders without errors, keyboard dismiss (Escape), focus navigation, duration Infinity edge case, dismiss non-existent id is no-op
    - _Requirements: 2.7, 2.8, 3.2, 3.4, 4.1, 4.2, 4.3, 7.1, 7.3, 7.4_

- [x] 5. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (7 properties total)
- Unit tests validate specific examples, accessibility, and edge cases
- ใช้ `fast-check` library สำหรับ property-based tests (มีอยู่แล้วใน project)
