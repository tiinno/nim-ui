# Implementation Plan: Dropdown Menu Component

## Overview

สร้าง Dropdown Menu component สำหรับ Nim UI โดยใช้ Radix UI DropdownMenu primitive, CVA pattern สำหรับ variant styling ไฟล์ทั้งหมดอยู่ใน `packages/ui/src/components/` เป็น flat kebab-case รวมถึง docs page, MCP registry entry, และ sidebar config update

## Tasks

- [x] 1. Install Radix UI DropdownMenu dependency and create component
  - [x] 1.1 Install `@radix-ui/react-dropdown-menu` package in `packages/ui`
    - Run `pnpm add @radix-ui/react-dropdown-menu` in `packages/ui`
    - _Requirements: 1.1_

  - [x] 1.2 Create `dropdown-menu.tsx` with all DropdownMenu components and CVA variants
    - Create `packages/ui/src/components/dropdown-menu.tsx`
    - Import `@radix-ui/react-dropdown-menu` primitives
    - Define inline SVG icons: CheckIcon, DotIcon, ChevronRightIcon
    - Implement `DropdownMenu` re-exporting Radix DropdownMenu.Root
    - Implement `DropdownMenuTrigger` with forwardRef wrapping Radix DropdownMenu.Trigger
    - Define `dropdownMenuContentVariants` CVA with variants: default (bg-white text-neutral-900 border border-neutral-200 shadow-md + dark mode), outline (bg-white text-neutral-900 border-2 border-neutral-300 + dark mode), base classes include animation (data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out)
    - Implement `DropdownMenuContent` with forwardRef, variant prop via CVA, side prop (default: bottom), sideOffset prop (default: 4), Radix Portal
    - Implement `DropdownMenuItem` with forwardRef, inset prop, focus styling (focus:bg-primary-500 focus:text-white), disabled styling, dark mode
    - Implement `DropdownMenuSeparator` with forwardRef, border styling + dark mode
    - Implement `DropdownMenuLabel` with forwardRef, inset prop, font-semibold text-neutral-500 styling
    - Implement `DropdownMenuCheckboxItem` with forwardRef, checked prop, ItemIndicator with CheckIcon
    - Implement `DropdownMenuRadioGroup` re-exporting Radix DropdownMenu.RadioGroup
    - Implement `DropdownMenuRadioItem` with forwardRef, ItemIndicator with DotIcon
    - Implement `DropdownMenuSub` re-exporting Radix DropdownMenu.Sub
    - Implement `DropdownMenuSubTrigger` with forwardRef, inset prop, ChevronRightIcon
    - Implement `DropdownMenuSubContent` with forwardRef, variant prop via shared CVA, Radix Portal
    - Export all components, variants, and TypeScript interfaces
    - Set displayName on all forwardRef components
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 9.1, 9.2, 9.4_

  - [x] 1.3 Update `packages/ui/src/components/index.ts` barrel export
    - Add `export * from './dropdown-menu';`
    - _Requirements: 9.3_

- [x] 2. Checkpoint - Ensure component builds without errors
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Write tests for DropdownMenu component
  - [x] 3.1 Write unit tests for DropdownMenu component
    - Create `packages/ui/src/components/dropdown-menu.test.tsx`
    - Test rendering: DropdownMenu renders trigger, Content renders in portal when open
    - Test variants: default variant has bg-white and border, outline variant has border-2
    - Test interactions: click opens menu, click item closes menu, click outside closes, Escape closes
    - Test keyboard: Arrow Down/Up navigate items, Enter selects item
    - Test accessibility: role="menu" on content, role="menuitem" on items, focus returns to trigger on close
    - Test defaults: default side is bottom, default sideOffset is 4
    - Test sub-components: Separator renders, Label renders with styling, disabled items have opacity-50
    - Test CheckboxItem: checked shows indicator, unchecked hides indicator, onCheckedChange called
    - Test RadioGroup/RadioItem: selected item shows indicator, onValueChange called
    - Test SubMenu: SubTrigger renders with chevron, SubContent renders
    - Test edge cases: controlled mode (open/onOpenChange), custom className, forwardRef works
    - _Requirements: 1.2, 1.3, 2.6, 2.7, 3.1, 3.3, 3.6, 4.1, 4.3, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 7.2, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

  - [x] 3.2 Write property test: Content variant styling correctness
    - **Property 1: Content variant styling includes correct light and dark mode classes**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.10**

  - [x] 3.3 Write property test: Inset prop adds left padding
    - **Property 2: Inset prop adds left padding across components**
    - **Validates: Requirements 3.4, 4.4, 7.3**

  - [x] 3.4 Write property test: CheckboxItem indicator matches checked state
    - **Property 3: CheckboxItem indicator matches checked state**
    - **Validates: Requirements 5.1, 5.3**

  - [x] 3.5 Write property test: RadioItem indicator matches selected value
    - **Property 4: RadioItem indicator matches selected value**
    - **Validates: Requirements 6.1, 6.3**

  - [x] 3.6 Write property test: Module exports completeness
    - **Property 5: Module exports completeness**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create documentation and registry entries
  - [x] 5.1 Create DropdownMenuDemo.tsx for docs interactive demos
    - Create `packages/docs/src/components/DropdownMenuDemo.tsx`
    - Implement DropdownMenuBasicDemo, DropdownMenuVariantsDemo, DropdownMenuCheckboxDemo, DropdownMenuRadioDemo, DropdownMenuSubMenuDemo
    - _Requirements: 2.1, 3.1, 5.1, 6.1, 7.2_

  - [x] 5.2 Create dropdown-menu.mdx documentation page
    - Create `packages/docs/src/content/docs/components/feedback/dropdown-menu.mdx`
    - Include sections: Import, Basic Usage, Variants, Checkbox Items, Radio Items, Sub-menus, Labels & Separators, Controlled Mode, Component Architecture, Props tables, Accessibility, Keyboard Support
    - _Requirements: 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1_

  - [x] 5.3 Add DropdownMenu to sidebar config in astro.config.mjs
    - Add `{ label: 'Dropdown Menu', slug: 'components/feedback/dropdown-menu' }` to the Feedback section
    - _Requirements: 9.3_

  - [x] 5.4 Add DropdownMenu entry to MCP registry
    - Add DropdownMenu component entry to `packages/ui/src/registry/index.json`
    - Include name, category (overlay), description, keywords, file, variants, hasRadixPrimitive, examples
    - _Requirements: 9.3_

- [x] 6. Final checkpoint - Ensure all tests pass and docs build
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (5 properties total)
- Unit tests validate specific examples, accessibility, and edge cases
- ใช้ `fast-check` library สำหรับ property-based tests (มีอยู่แล้วใน project)
- DropdownMenu ใช้ pattern เดียวกับ Popover แต่มี menu-specific features เพิ่มเติม (items, checkbox, radio, sub-menu, keyboard navigation)
