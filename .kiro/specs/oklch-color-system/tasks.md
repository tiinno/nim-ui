# Implementation Plan: ระบบสี OKLCH

## Overview

ย้ายระบบสีของ Nim UI จาก Hex เป็น OKLCH โดยสร้าง conversion script ก่อน แล้วอัปเดต token, CSS, docs, และ steering files ตามลำดับ Component source code ไม่ต้องแก้ไข

## Tasks

- [x] 1. สร้าง Color Conversion Script
  - [x] 1.1 สร้างไฟล์ `scripts/convert-colors.js` ที่ใช้ `culori` library แปลง Hex → OKLCH
    - ติดตั้ง `culori` เป็น devDependency
    - สร้างฟังก์ชัน `hexToOklch(hex)` ที่รับ hex string และคืนค่า OKLCH string ในรูปแบบ `oklch(L C H)`
    - สร้างฟังก์ชัน `oklchToHex(oklch)` สำหรับ round-trip verification
    - สร้างฟังก์ชัน `calculateDeltaE(hex1, hex2)` สำหรับตรวจสอบความแม่นยำ
    - Script ต้องแปลงค่าสีทั้งหมดจาก `tokens.js` และแสดงผลลัพธ์เป็นตาราง
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 1.2 เขียน property tests สำหรับ conversion functions
    - **Property 1: OKLCH format and range validity**
    - **Validates: Requirements 1.1, 1.3**
    - **Property 2: Hex→OKLCH round-trip accuracy**
    - **Validates: Requirements 1.2**
    - ใช้ `fast-check` library สร้าง random hex colors
    - ทุก test รันอย่างน้อย 100 iterations
    - Tag: `Feature: oklch-color-system, Property 1` และ `Property 2`

  - [x] 1.3 เขียน unit tests สำหรับ edge cases
    - ทดสอบ #000000 (สีดำ), #ffffff (สีขาว), #808080 (สีเทา)
    - ทดสอบ hex ที่ไม่ถูกต้อง throw error
    - ทดสอบ chroma = 0 สำหรับสีเทา
    - _Requirements: 1.1, 1.3_

- [x] 2. Checkpoint - ตรวจสอบ conversion script
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. อัปเดต Design Tokens
  - [x] 3.1 อัปเดต `packages/tailwind-config/src/tokens.js` ให้ใช้ค่า OKLCH
    - แปลงค่าสีทั้งหมดใน `tokens.colors` จาก Hex เป็น OKLCH
    - รักษาโครงสร้าง key เดิมทั้งหมด (primary.50-950, neutral.50-950, success, error, warning)
    - ใช้ค่าจาก conversion script
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.2 เขียน property test สำหรับ token values
    - **Property 3: All color values use OKLCH format**
    - **Validates: Requirements 2.1, 3.1, 3.2, 3.3, 5.1, 6.1**
    - Import token object แล้ว iterate ทุก color value
    - ตรวจสอบทุกค่า match pattern `oklch(...)`
    - Tag: `Feature: oklch-color-system, Property 3`

  - [x] 3.3 เขียน unit test ตรวจสอบ token structure
    - ตรวจสอบ key structure คงเดิม (primary, neutral, success, error, warning)
    - ตรวจสอบจำนวน shades ของแต่ละ palette คงเดิม
    - _Requirements: 2.2, 2.3_

- [x] 4. อัปเดต CSS Theme Configuration
  - [x] 4.1 อัปเดต `packages/ui/src/styles.css`
    - เปลี่ยนค่าสีทั้งหมดใน `@theme` block จาก Hex เป็น OKLCH
    - เปลี่ยน semantic variables ใน `@layer base` (:root และ .dark) จาก HSL เป็น OKLCH
    - _Requirements: 3.1, 3.3, 5.1, 5.2, 5.3_

  - [x] 4.2 อัปเดต `packages/docs/src/styles/custom.css`
    - เปลี่ยนค่าสีใน `@theme` block จาก Hex เป็น OKLCH
    - เปลี่ยน Starlight accent variables (`--sl-color-accent-*`) เป็น OKLCH
    - เปลี่ยน Pagefind UI variables เป็น OKLCH
    - _Requirements: 3.2, 6.1, 6.2, 6.3_

- [x] 5. Checkpoint - ตรวจสอบ build และ tests
  - รัน `pnpm build` ตรวจสอบ build สำเร็จ
  - รัน `pnpm test` ตรวจสอบ test ที่มีอยู่ผ่านทั้งหมด
  - รัน `pnpm typecheck` ตรวจสอบ TypeScript
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 6. อัปเดต Steering File และ Documentation
  - [x] 6.1 อัปเดต `.kiro/steering/design-tokens.md`
    - เปลี่ยนค่าสี Hex เป็น OKLCH ในเอกสาร
    - รักษาโครงสร้างเอกสารเดิม
    - _Requirements: 7.1, 7.2_

- [x] 7. Final Checkpoint - ตรวจสอบทั้งระบบ
  - รัน `pnpm lint && pnpm typecheck && pnpm test && pnpm build`
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks ที่มี `*` เป็น optional สามารถข้ามได้สำหรับ MVP
- Component source code ไม่ต้องแก้ไข — Tailwind class names คงเดิม
- ค่า OKLCH ที่แน่นอนจะได้จาก conversion script ใน task 1.1
- Property tests ใช้ `fast-check` library สำหรับ property-based testing
