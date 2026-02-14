# Implementation Plan: Alert Dialog Component

## Overview

สร้าง Alert Dialog component สำหรับ Nim UI โดยใช้ Radix UI AlertDialog primitive, CVA pattern สำหรับ variant styling ไฟล์ทั้งหมดอยู่ใน `packages/ui/src/components/` เป็น flat kebab-case รวมถึง docs page, MCP registry entry, และ sidebar config update

## Tasks

- [x] 1. Install Radix UI AlertDialog dependency and create component
  - [x] 1.1 Install `@radix-ui/react-alert-dialog` package in `packages/ui`
    - Run `pnpm add @radix-ui/react-alert-dialog` in `packages/ui`
    - _Requirements: 1.1_

  - [x] 1.2 Create `alert-dialog.tsx` with all AlertDialog components and CVA variants
    - Create `packages/ui/src/components/alert-dialog.tsx`
    - Import `@radix-ui/react-alert-dialog` primitives
    - Implement `AlertDialog` re-exporting Radix AlertDialog.Root
    - Implement `AlertDialogTrigger` with forwardRef wrapping Radix AlertDialog.Trigger
    - Implement `AlertDialogOverlay` with forwardRef, fixed inset-0 bg-black/50, animation classes
    - Define `alertDialogContentVariants` CVA with variants: default (bg-white text-neutral-900 border border-neutral-200 shadow-lg + dark mode), destructive (bg-white text-neutral-900 border border-neutral-200 border-t-4 border-t-error-500 + dark mode), base classes include centering (fixed left-1/2 top-1/2 -translate-x/y-1/2) and animation
    - Implement `AlertDialogContent` with forwardRef, variant prop via CVA, Radix Portal, includes Overlay
    - Implement `AlertDialogHeader` with forwardRef, flex flex-col gap-2
    - Implement `AlertDialogFooter` with forwardRef, flex justify-end gap-2 mt-4
    - Implement `AlertDialogTitle` with forwardRef wrapping Radix AlertDialog.Title, text-lg font-semibold + dark mode
    - Implement `AlertDialogDescription` with forwardRef wrapping Radix AlertDialog.Description, text-sm text-neutral-500 + dark mode
    - Implement `AlertDialogAction` with forwardRef wrapping Radix AlertDialog.Action
    - Implement `AlertDialogCancel` with forwardRef wrapping Radix AlertDialog.Cancel
    - Export all components, variants, and TypeScript interfaces
    - Set displayName on all forwardRef components
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 7.1, 7.2, 7.4_

  - [x] 1.3 Update `packages/ui/src/components/index.ts` barrel export
    - Add `export * from './alert-dialog';`
    - _Requirements: 7.3_

- [x] 2. Checkpoint - Ensure component builds without errors
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Write tests for AlertDialog component
  - [x] 3.1 Write unit tests for AlertDialog component
    - Create `packages/ui/src/components/alert-dialog.test.tsx`
    - Test rendering: AlertDialog renders trigger, Content renders in portal when open, Overlay renders
    - Test variants: default variant has bg-white and border, destructive variant has border-t-error-500
    - Test interactions: click trigger opens dialog, Action closes dialog, Cancel closes dialog
    - Test accessibility: role="alertdialog", aria-labelledby, aria-describedby, focus trapping, Escape closes, focus returns to trigger
    - Test overlay: overlay does not close dialog on click
    - Test defaults: default variant applied when no variant specified
    - Test sub-components: Header renders with flex-col, Footer renders with justify-end, Title with text-lg, Description with text-sm
    - Test edge cases: controlled mode (open/onOpenChange), custom className, forwardRef on Content/Trigger/Action/Cancel
    - _Requirements: 1.2, 1.3, 2.1, 2.2, 2.3, 2.5, 2.6, 2.8, 3.1, 3.5, 4.1, 4.2, 4.3, 4.5, 5.1, 5.2, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 3.2 Write property test: Content variant styling correctness
    - **Property 1: Content variant styling includes correct light and dark mode classes**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.7**

  - [x] 3.3 Write property test: Module exports completeness
    - **Property 2: Module exports completeness**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create documentation and registry entries
  - [x] 5.1 Create AlertDialogDemo.tsx for docs interactive demos
    - Create `packages/docs/src/components/AlertDialogDemo.tsx`
    - Implement AlertDialogBasicDemo, AlertDialogDestructiveDemo
    - Import AlertDialog components and Button from `@nim-ui/components`
    - _Requirements: 2.1, 2.3, 5.1, 5.2_

  - [x] 5.2 Create alert-dialog.mdx documentation page
    - Create `packages/docs/src/content/docs/components/feedback/alert-dialog.mdx`
    - Include sections: Import, Basic Usage, Destructive Variant, Controlled Mode, Component Architecture, Props tables, Accessibility, Keyboard Support
    - Use ComponentPreview and PropsTable Astro components
    - Use `client:only="react"` for demo components
    - _Requirements: 2.1, 2.3, 6.1, 6.2, 6.3_

  - [x] 5.3 Add AlertDialog to sidebar config in astro.config.mjs
    - Add `{ label: 'Alert Dialog', slug: 'components/feedback/alert-dialog' }` to the Feedback section
    - _Requirements: 7.3_

  - [x] 5.4 Add AlertDialog entry to MCP registry
    - Add AlertDialog component entry to `packages/ui/src/registry/index.json`
    - Include name, category (overlay), description, keywords, file, variants, hasRadixPrimitive, examples
    - _Requirements: 7.3_

- [x] 6. Final checkpoint - Ensure all tests pass and docs build
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (2 properties total)
- Unit tests validate specific examples, accessibility, and edge cases
- ใช้ `fast-check` library สำหรับ property-based tests (มีอยู่แล้วใน project)
- AlertDialog ใช้ pattern เดียวกับ Popover แต่มี alertdialog-specific features (overlay ไม่ปิด dialog, role="alertdialog", destructive variant)
