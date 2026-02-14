# เอกสารข้อกำหนด: ระบบสี OKLCH

## บทนำ

ย้ายระบบสี (Color System) ของ Nim UI จากรูปแบบ Hex ไปเป็นรูปแบบ OKLCH เพื่อให้ได้สีที่สม่ำเสมอทางการรับรู้ (perceptually uniform) รองรับ P3 wide gamut display และใช้ประโยชน์จาก Tailwind CSS v4 ที่รองรับ OKLCH โดยตรง โดยต้องรักษาความเข้ากันได้กับ component ที่มีอยู่ทั้งหมด

## อภิธานศัพท์

- **Token_System**: ระบบ design token ที่กำหนดค่าสีใน `packages/tailwind-config/src/tokens.js`
- **Theme_Config**: การกำหนดค่าสีผ่าน `@theme` directive ใน CSS files (`styles.css`, `custom.css`)
- **Color_Palette**: ชุดสีทั้งหมดของระบบ ประกอบด้วย primary, neutral, success, error, warning
- **Semantic_Variables**: CSS custom properties สำหรับ light/dark mode ใน `@layer base`
- **Component_Library**: คอลเลกชัน React component ทั้งหมดใน `packages/ui/src/components/`
- **OKLCH**: รูปแบบสีที่ใช้ Lightness, Chroma, Hue — สม่ำเสมอทางการรับรู้
- **Converter**: ฟังก์ชันที่แปลงค่าสีจาก Hex เป็น OKLCH
- **Docs_Site**: เว็บไซต์เอกสารที่สร้างด้วย Astro Starlight ใน `packages/docs/`

## ข้อกำหนด

### ข้อกำหนดที่ 1: แปลงค่าสีจาก Hex เป็น OKLCH

**User Story:** ในฐานะนักพัฒนา ฉันต้องการแปลงค่าสีทั้งหมดจาก Hex เป็น OKLCH เพื่อให้ได้สีที่สม่ำเสมอทางการรับรู้และรองรับ wide gamut display

#### เกณฑ์การยอมรับ

1. THE Converter SHALL แปลงค่าสี Hex ทุกค่าใน Color_Palette เป็นรูปแบบ OKLCH ที่ถูกต้องตามข้อกำหนด CSS Color Level 4
2. WHEN แปลงค่าสี Hex เป็น OKLCH แล้วแปลงกลับเป็น Hex, THE Converter SHALL ให้ค่าสีที่มีค่า Delta E (OKLCH) ไม่เกิน 0.02 เมื่อเทียบกับค่าเดิม
3. THE Converter SHALL สร้างค่า OKLCH ในรูปแบบ `oklch(L C H)` โดยที่ L เป็นเปอร์เซ็นต์ (0%-100%), C เป็นค่า chroma (0-0.4), และ H เป็นองศา (0-360)

### ข้อกำหนดที่ 2: อัปเดต Design Token

**User Story:** ในฐานะนักพัฒนา ฉันต้องการให้ design token ใช้ค่าสี OKLCH เพื่อให้เป็น source of truth สำหรับระบบสีใหม่

#### เกณฑ์การยอมรับ

1. THE Token_System SHALL เก็บค่าสีทุกค่าในรูปแบบ OKLCH แทน Hex
2. THE Token_System SHALL รักษาโครงสร้าง key เดิมทั้งหมด (primary.50-950, neutral.50-950, success, error, warning)
3. WHEN Token_System ถูกอัปเดตเป็น OKLCH, THE Token_System SHALL ยังคงส่งออก (export) object ที่มี key เหมือนเดิมทุกประการ

### ข้อกำหนดที่ 3: อัปเดต Tailwind CSS Theme Configuration

**User Story:** ในฐานะนักพัฒนา ฉันต้องการให้ `@theme` directive ใน CSS ใช้ค่า OKLCH เพื่อให้ Tailwind CSS v4 สร้าง utility class ด้วยสี OKLCH

#### เกณฑ์การยอมรับ

1. THE Theme_Config SHALL กำหนดค่า CSS custom properties (`--color-*`) ด้วยค่า OKLCH ใน `@theme` block ของ `packages/ui/src/styles.css`
2. THE Theme_Config SHALL กำหนดค่า CSS custom properties (`--color-*`) ด้วยค่า OKLCH ใน `@theme` block ของ `packages/docs/src/styles/custom.css`
3. THE Theme_Config SHALL อัปเดต Semantic_Variables ใน `@layer base` ให้ใช้รูปแบบ OKLCH แทน HSL

### ข้อกำหนดที่ 4: รักษาความเข้ากันได้ของ Component

**User Story:** ในฐานะนักพัฒนา ฉันต้องการให้ component ทั้งหมดที่มีอยู่ยังคงทำงานได้ถูกต้องหลังจากเปลี่ยนระบบสี

#### เกณฑ์การยอมรับ

1. WHEN ระบบสีถูกเปลี่ยนเป็น OKLCH, THE Component_Library SHALL ยังคง build สำเร็จโดยไม่มี error
2. WHEN ระบบสีถูกเปลี่ยนเป็น OKLCH, THE Component_Library SHALL ผ่าน test ที่มีอยู่ทั้งหมด
3. THE Component_Library SHALL ไม่ต้องเปลี่ยนแปลง Tailwind class name ใดๆ ใน component source code
4. WHEN component ใช้ Tailwind class เช่น `bg-primary-600`, THE Theme_Config SHALL resolve เป็นค่า OKLCH ที่ถูกต้อง

### ข้อกำหนดที่ 5: รองรับ Dark Mode

**User Story:** ในฐานะผู้ใช้ ฉันต้องการให้ dark mode ยังคงทำงานได้อย่างถูกต้องหลังจากเปลี่ยนระบบสี

#### เกณฑ์การยอมรับ

1. THE Semantic_Variables SHALL กำหนดค่าสีสำหรับ light mode และ dark mode ในรูปแบบ OKLCH
2. WHEN สลับระหว่าง light mode และ dark mode, THE Theme_Config SHALL ให้ค่าสีที่ถูกต้องสำหรับแต่ละ mode
3. THE Semantic_Variables SHALL รักษา CSS custom property name เดิมทั้งหมด (`--background`, `--foreground`, `--primary` ฯลฯ)

### ข้อกำหนดที่ 6: อัปเดตเอกสาร Documentation Site

**User Story:** ในฐานะนักพัฒนา ฉันต้องการให้เอกสาร design system แสดงค่าสี OKLCH ใหม่ เพื่อให้ทีมใช้ค่าที่ถูกต้อง

#### เกณฑ์การยอมรับ

1. THE Docs_Site SHALL อัปเดตค่าสีใน `@theme` block ของ `custom.css` ให้เป็น OKLCH
2. THE Docs_Site SHALL อัปเดตค่า Starlight accent colors (`--sl-color-accent-*`) ให้ใช้ค่า OKLCH
3. THE Docs_Site SHALL อัปเดตค่า Pagefind search UI colors ให้ใช้ค่า OKLCH

### ข้อกำหนดที่ 7: อัปเดต Steering Files

**User Story:** ในฐานะนักพัฒนา ฉันต้องการให้ steering files แสดงค่าสี OKLCH ใหม่ เพื่อให้ AI assistant ใช้ค่าที่ถูกต้องเมื่อสร้าง component ใหม่

#### เกณฑ์การยอมรับ

1. THE Token_System SHALL อัปเดตไฟล์ `.kiro/steering/design-tokens.md` ให้แสดงค่าสี OKLCH แทน Hex
2. WHEN steering file ถูกอัปเดต, THE Token_System SHALL รักษาโครงสร้างเอกสารเดิมและอัปเดตเฉพาะค่าสี
