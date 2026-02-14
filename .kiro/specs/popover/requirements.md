# Requirements Document

## Introduction

Popover component สำหรับ Nim UI component library เป็น component ในหมวด Overlay ที่แสดงเนื้อหาแบบ rich content (ไม่จำกัดแค่ข้อความ) เมื่อผู้ใช้คลิกบน trigger element สร้างบน Radix UI Popover primitive (`@radix-ui/react-popover`) ตามแบบแผน CVA pattern ของ library รองรับ compound component pattern (PopoverProvider, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverClose), หลายตำแหน่ง (top, bottom, left, right), configurable sideOffset, arrow indicator, controlled mode, enter/exit animation, dark mode, และ accessibility ครบถ้วน

## Glossary

- **Popover_Provider**: Context provider component (optional) สำหรับจัดการ shared state ของ popover หลายตัว เช่น การปิด popover อื่นเมื่อเปิดตัวใหม่
- **Popover_Root**: Radix UI Popover Root component ที่จัดการ open/close state ของ popover แต่ละรายการ
- **Popover_Trigger**: Element ที่เมื่อคลิกจะเปิด/ปิด popover
- **Popover_Content**: Component ที่แสดงเนื้อหาของ popover รองรับ variant และ side ผ่าน CVA
- **Popover_Arrow**: ลูกศรชี้จาก popover ไปยัง trigger element
- **Popover_Close**: ปุ่มปิด popover ที่อยู่ภายใน popover content
- **Side**: ตำแหน่งแสดงผลของ popover เทียบกับ trigger ได้แก่ top, bottom, left, right
- **Variant**: รูปแบบสีของ popover ได้แก่ default (พื้นหลังขาว/เข้มใน dark mode), outline (มีขอบเด่นชัด)

## Requirements

### Requirement 1: Popover Root

**User Story:** ในฐานะนักพัฒนา ฉันต้องการ Popover Root component เพื่อจัดการ open/close state ของ popover และรองรับทั้ง controlled และ uncontrolled mode

#### Acceptance Criteria

1. THE Popover_Root SHALL wrap Radix UI Popover Root และรับ props สำหรับ open, defaultOpen, onOpenChange, และ modal
2. WHEN open prop ถูกกำหนด, THE Popover_Root SHALL ทำงานใน controlled mode โดยใช้ค่า open ที่กำหนด
3. WHEN onOpenChange callback ถูกกำหนด, THE Popover_Root SHALL เรียก callback เมื่อ open state เปลี่ยนแปลง
4. WHEN defaultOpen prop ถูกกำหนด, THE Popover_Root SHALL ใช้ค่านั้นเป็น initial open state สำหรับ uncontrolled mode

### Requirement 2: Popover Content Component

**User Story:** ในฐานะนักพัฒนา ฉันต้องการ Popover Content component ที่รองรับหลาย variant และตำแหน่ง เพื่อให้สามารถแสดง rich content ได้อย่างยืดหยุ่น

#### Acceptance Criteria

1. THE Popover_Content SHALL ใช้ CVA pattern สำหรับ variant styling โดยรองรับ variant: default, outline
2. WHEN variant เป็น default, THE Popover_Content SHALL แสดงพื้นหลังสีขาว (white) พร้อมข้อความสีเข้ม (neutral-900), ขอบ (border-neutral-200), และเงา (shadow-md)
3. WHEN variant เป็น outline, THE Popover_Content SHALL แสดงพื้นหลังสีขาว (white) พร้อมข้อความสีเข้ม (neutral-900) และขอบหนาเด่นชัด (border-2 border-neutral-300)
4. THE Popover_Content SHALL รองรับ dark mode โดยมี dark variant classes สำหรับทุก variant
5. WHEN side prop ถูกกำหนดเป็นค่าใดค่าหนึ่งจาก top, bottom, left, right, THE Popover_Content SHALL แสดงผลที่ตำแหน่งตาม side ที่กำหนด
6. THE Popover_Content SHALL มี default side เป็น bottom
7. THE Popover_Content SHALL ใช้ forwardRef pattern ตามแบบแผนของ Nim UI
8. THE Popover_Content SHALL รองรับ sideOffset prop สำหรับกำหนดระยะห่างจาก trigger element
9. THE Popover_Content SHALL มี default sideOffset เท่ากับ 4 pixels
10. THE Popover_Content SHALL ใช้ enter/exit animation จากระบบ CSS animation ที่มีอยู่ (animate-fade-in, animate-fade-out)

### Requirement 3: Popover Arrow

**User Story:** ในฐานะนักพัฒนา ฉันต้องการ arrow indicator บน popover เพื่อให้ผู้ใช้เห็นความสัมพันธ์ระหว่าง popover กับ trigger element ได้ชัดเจน

#### Acceptance Criteria

1. WHERE showArrow prop ถูกเปิดใช้งาน, THE Popover_Content SHALL แสดง Popover_Arrow ที่ชี้ไปยัง trigger element
2. THE Popover_Arrow SHALL มีสีที่สอดคล้องกับ variant ของ Popover_Content (fill-white สำหรับ default, fill-white สำหรับ outline พร้อม dark mode classes)
3. WHEN showArrow prop ไม่ถูกกำหนดหรือเป็น false, THE Popover_Content SHALL ไม่แสดง arrow

### Requirement 4: Popover Close

**User Story:** ในฐานะนักพัฒนา ฉันต้องการปุ่มปิด popover ภายใน content เพื่อให้ผู้ใช้สามารถปิด popover ได้อย่างชัดเจน

#### Acceptance Criteria

1. THE Popover_Close SHALL wrap Radix UI Popover Close และรองรับ forwardRef pattern
2. WHEN ผู้ใช้คลิก Popover_Close, THE Popover_Root SHALL ปิด popover ทันที
3. THE Popover_Close SHALL รองรับ asChild prop เพื่อให้นักพัฒนาใช้ custom element เป็นปุ่มปิดได้

### Requirement 5: Popover Provider (Optional)

**User Story:** ในฐานะนักพัฒนา ฉันต้องการ Popover Provider component (optional) เพื่อให้สามารถจัดการ context ร่วมกันระหว่าง popover หลายตัวได้

#### Acceptance Criteria

1. THE Popover_Provider SHALL เป็น optional wrapper ที่ไม่จำเป็นต้องใช้สำหรับ popover เดี่ยว
2. THE Popover_Provider SHALL รับ children prop และ render children โดยตรง

### Requirement 6: Accessibility

**User Story:** ในฐานะผู้ใช้ที่ใช้ assistive technology ฉันต้องการให้ popover สามารถเข้าถึงได้ผ่าน screen reader และ keyboard เพื่อให้ได้รับข้อมูลเพิ่มเติมเท่าเทียมกับผู้ใช้ทั่วไป

#### Acceptance Criteria

1. THE Popover_Content SHALL render ด้วย role="dialog" ตาม WAI-ARIA specification
2. WHEN Popover_Trigger ถูกคลิก, THE Popover_Content SHALL เปิดและ focus จะถูกย้ายไปยัง content
3. WHEN ผู้ใช้กด Escape key, THE Popover_Content SHALL ปิดทันทีและ focus จะกลับไปที่ trigger
4. THE Popover_Content SHALL trap focus ภายใน popover เมื่อเปิดอยู่ เพื่อป้องกันการ tab ออกนอก popover
5. THE Popover_Content SHALL ใช้ Radix UI Portal เพื่อ render นอก DOM hierarchy ของ trigger โดยไม่กระทบ accessibility tree
6. WHEN ผู้ใช้คลิกนอก Popover_Content, THE Popover_Root SHALL ปิด popover ทันที

### Requirement 7: TypeScript และ Export

**User Story:** ในฐานะนักพัฒนา ฉันต้องการ TypeScript types ที่ครบถ้วนและ export ที่ถูกต้อง เพื่อให้สามารถใช้งาน Popover component ได้อย่างปลอดภัยและสะดวก

#### Acceptance Criteria

1. THE Popover_Content SHALL export TypeScript interfaces สำหรับ props ทั้งหมด: PopoverProps, PopoverProviderProps, PopoverTriggerProps, PopoverContentProps, PopoverArrowProps, PopoverCloseProps
2. THE Popover_Content SHALL export CVA variants type ผ่าน VariantProps
3. WHEN component ถูก export จาก index.ts, THE Popover_Content SHALL สามารถ import ได้จาก '@nim-ui/components'
4. THE Popover_Content SHALL export popoverContentVariants สำหรับให้นักพัฒนาใช้ variant classes ภายนอก component ได้
