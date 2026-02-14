# Requirements Document

## Introduction

Dropdown Menu component สำหรับ Tiinno UI component library เป็น component ในหมวด Overlay/Navigation ที่แสดงรายการเมนูแบบ dropdown เมื่อผู้ใช้คลิกบน trigger element สร้างบน Radix UI Dropdown Menu primitive (`@radix-ui/react-dropdown-menu`) ตามแบบแผน CVA pattern ของ library รองรับ compound component pattern (DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent), หลายตำแหน่ง (top, bottom, left, right), configurable sideOffset, checkbox items, radio items, sub-menus, dark mode, และ accessibility ครบถ้วน

## Glossary

- **DropdownMenu_Root**: Radix UI DropdownMenu Root component ที่จัดการ open/close state ของ dropdown menu
- **DropdownMenu_Trigger**: Element ที่เมื่อคลิกจะเปิด/ปิด dropdown menu
- **DropdownMenu_Content**: Component ที่แสดงรายการเมนูของ dropdown รองรับ variant และ side ผ่าน CVA
- **DropdownMenu_Item**: รายการเมนูแต่ละรายการที่ผู้ใช้สามารถเลือกได้
- **DropdownMenu_Separator**: เส้นแบ่งระหว่างกลุ่มรายการเมนู
- **DropdownMenu_Label**: ข้อความ label สำหรับกลุ่มรายการเมนู
- **DropdownMenu_CheckboxItem**: รายการเมนูที่มี checkbox สำหรับเลือก/ยกเลิกเลือก
- **DropdownMenu_RadioGroup**: กลุ่มของ radio items สำหรับเลือกรายการเดียว
- **DropdownMenu_RadioItem**: รายการเมนูแบบ radio ภายใน RadioGroup
- **DropdownMenu_Sub**: Sub-menu container สำหรับเมนูย่อย
- **DropdownMenu_SubTrigger**: รายการเมนูที่เปิด sub-menu เมื่อ hover หรือคลิก
- **DropdownMenu_SubContent**: เนื้อหาของ sub-menu
- **Side**: ตำแหน่งแสดงผลของ dropdown menu เทียบกับ trigger ได้แก่ top, bottom, left, right
- **Variant**: รูปแบบสีของ dropdown menu content ได้แก่ default (พื้นหลังขาว/เข้มใน dark mode), outline (มีขอบเด่นชัด)
- **Inset**: การจัดตำแหน่ง padding ของ item ให้เยื้องเข้าไปเพื่อจัดแนวกับ label

## Requirements

### Requirement 1: DropdownMenu Root

**User Story:** ในฐานะนักพัฒนา ฉันต้องการ DropdownMenu Root component เพื่อจัดการ open/close state ของ dropdown menu และรองรับทั้ง controlled และ uncontrolled mode

#### Acceptance Criteria

1. THE DropdownMenu_Root SHALL wrap Radix UI DropdownMenu Root และรับ props สำหรับ open, defaultOpen, onOpenChange, dir, และ modal
2. WHEN open prop ถูกกำหนด, THE DropdownMenu_Root SHALL ทำงานใน controlled mode โดยใช้ค่า open ที่กำหนด
3. WHEN onOpenChange callback ถูกกำหนด, THE DropdownMenu_Root SHALL เรียก callback เมื่อ open state เปลี่ยนแปลง
4. WHEN defaultOpen prop ถูกกำหนด, THE DropdownMenu_Root SHALL ใช้ค่านั้นเป็น initial open state สำหรับ uncontrolled mode

### Requirement 2: DropdownMenu Content Component

**User Story:** ในฐานะนักพัฒนา ฉันต้องการ DropdownMenu Content component ที่รองรับหลาย variant และตำแหน่ง เพื่อให้สามารถแสดงรายการเมนูได้อย่างยืดหยุ่น

#### Acceptance Criteria

1. THE DropdownMenu_Content SHALL ใช้ CVA pattern สำหรับ variant styling โดยรองรับ variant: default, outline
2. WHEN variant เป็น default, THE DropdownMenu_Content SHALL แสดงพื้นหลังสีขาว (white) พร้อมข้อความสีเข้ม (neutral-900), ขอบ (border-neutral-200), และเงา (shadow-md)
3. WHEN variant เป็น outline, THE DropdownMenu_Content SHALL แสดงพื้นหลังสีขาว (white) พร้อมข้อความสีเข้ม (neutral-900) และขอบหนาเด่นชัด (border-2 border-neutral-300)
4. THE DropdownMenu_Content SHALL รองรับ dark mode โดยมี dark variant classes สำหรับทุก variant
5. WHEN side prop ถูกกำหนดเป็นค่าใดค่าหนึ่งจาก top, bottom, left, right, THE DropdownMenu_Content SHALL แสดงผลที่ตำแหน่งตาม side ที่กำหนด
6. THE DropdownMenu_Content SHALL มี default side เป็น bottom
7. THE DropdownMenu_Content SHALL ใช้ forwardRef pattern ตามแบบแผนของ Tiinno UI
8. THE DropdownMenu_Content SHALL รองรับ sideOffset prop สำหรับกำหนดระยะห่างจาก trigger element
9. THE DropdownMenu_Content SHALL มี default sideOffset เท่ากับ 4 pixels
10. THE DropdownMenu_Content SHALL ใช้ enter/exit animation จากระบบ CSS animation ที่มีอยู่ (animate-fade-in, animate-fade-out)

### Requirement 3: DropdownMenu Item

**User Story:** ในฐานะนักพัฒนา ฉันต้องการ DropdownMenu Item component สำหรับแสดงรายการเมนูแต่ละรายการ พร้อม hover/focus styling และรองรับ disabled state

#### Acceptance Criteria

1. THE DropdownMenu_Item SHALL render ด้วย styling สำหรับ hover state (bg-primary-500 text-white) และ focus state ที่สอดคล้องกัน
2. THE DropdownMenu_Item SHALL รองรับ dark mode hover/focus styling
3. WHEN disabled prop เป็น true, THE DropdownMenu_Item SHALL แสดงด้วย opacity ลดลง (opacity-50) และป้องกันการ interaction
4. THE DropdownMenu_Item SHALL รองรับ inset prop สำหรับเพิ่ม padding ด้านซ้ายเพื่อจัดแนวกับ label
5. THE DropdownMenu_Item SHALL ใช้ forwardRef pattern ตามแบบแผนของ Tiinno UI
6. WHEN ผู้ใช้คลิก DropdownMenu_Item, THE DropdownMenu_Root SHALL ปิด dropdown menu ทันที

### Requirement 4: DropdownMenu Separator และ Label

**User Story:** ในฐานะนักพัฒนา ฉันต้องการ Separator และ Label components เพื่อจัดกลุ่มและแบ่งรายการเมนูให้เป็นระเบียบ

#### Acceptance Criteria

1. THE DropdownMenu_Separator SHALL render เส้นแบ่งแนวนอน (border-neutral-200) พร้อม dark mode support (dark:border-neutral-700)
2. THE DropdownMenu_Separator SHALL มี margin แนวตั้ง (-mx-1 my-1) เพื่อขยายเต็มความกว้างของ content
3. THE DropdownMenu_Label SHALL render ข้อความ label ด้วย styling ที่แตกต่างจาก item (text-sm font-semibold text-neutral-500)
4. THE DropdownMenu_Label SHALL รองรับ inset prop สำหรับเพิ่ม padding ด้านซ้าย

### Requirement 5: DropdownMenu CheckboxItem

**User Story:** ในฐานะนักพัฒนา ฉันต้องการ CheckboxItem component สำหรับรายการเมนูที่สามารถเลือก/ยกเลิกเลือกได้ เพื่อให้ผู้ใช้สามารถ toggle options ภายใน dropdown menu

#### Acceptance Criteria

1. THE DropdownMenu_CheckboxItem SHALL รองรับ checked prop สำหรับ controlled checkbox state
2. THE DropdownMenu_CheckboxItem SHALL รองรับ onCheckedChange callback เมื่อ checked state เปลี่ยนแปลง
3. WHEN checked เป็น true, THE DropdownMenu_CheckboxItem SHALL แสดง check indicator icon ที่ด้านซ้ายของ item
4. THE DropdownMenu_CheckboxItem SHALL มี hover/focus styling เหมือนกับ DropdownMenu_Item
5. THE DropdownMenu_CheckboxItem SHALL ใช้ forwardRef pattern ตามแบบแผนของ Tiinno UI

### Requirement 6: DropdownMenu RadioGroup และ RadioItem

**User Story:** ในฐานะนักพัฒนา ฉันต้องการ RadioGroup และ RadioItem components สำหรับรายการเมนูที่เลือกได้เพียงรายการเดียวจากกลุ่ม เพื่อให้ผู้ใช้สามารถเลือก option แบบ exclusive ภายใน dropdown menu

#### Acceptance Criteria

1. THE DropdownMenu_RadioGroup SHALL รองรับ value prop สำหรับ controlled selected value
2. THE DropdownMenu_RadioGroup SHALL รองรับ onValueChange callback เมื่อ selected value เปลี่ยนแปลง
3. WHEN RadioItem ถูกเลือก, THE DropdownMenu_RadioItem SHALL แสดง dot indicator icon ที่ด้านซ้ายของ item
4. THE DropdownMenu_RadioItem SHALL มี hover/focus styling เหมือนกับ DropdownMenu_Item
5. THE DropdownMenu_RadioItem SHALL ใช้ forwardRef pattern ตามแบบแผนของ Tiinno UI

### Requirement 7: DropdownMenu Sub-menu

**User Story:** ในฐานะนักพัฒนา ฉันต้องการ Sub-menu components สำหรับสร้างเมนูย่อยภายใน dropdown menu เพื่อจัดระเบียบรายการเมนูที่ซับซ้อน

#### Acceptance Criteria

1. THE DropdownMenu_Sub SHALL wrap Radix UI DropdownMenu Sub สำหรับจัดการ open/close state ของ sub-menu
2. THE DropdownMenu_SubTrigger SHALL render ด้วย hover/focus styling เหมือน DropdownMenu_Item พร้อม chevron icon ที่ด้านขวา
3. THE DropdownMenu_SubTrigger SHALL รองรับ inset prop สำหรับเพิ่ม padding ด้านซ้าย
4. THE DropdownMenu_SubContent SHALL ใช้ CVA variant styling เหมือน DropdownMenu_Content (default, outline) พร้อม animation
5. THE DropdownMenu_SubContent SHALL ใช้ Radix Portal สำหรับ render นอก DOM hierarchy

### Requirement 8: Accessibility

**User Story:** ในฐานะผู้ใช้ที่ใช้ assistive technology ฉันต้องการให้ dropdown menu สามารถเข้าถึงได้ผ่าน screen reader และ keyboard เพื่อให้สามารถใช้งานเมนูได้เท่าเทียมกับผู้ใช้ทั่วไป

#### Acceptance Criteria

1. THE DropdownMenu_Content SHALL render ด้วย role="menu" ตาม WAI-ARIA specification
2. THE DropdownMenu_Item SHALL render ด้วย role="menuitem"
3. WHEN ผู้ใช้กด Arrow Down key, THE DropdownMenu_Content SHALL ย้าย focus ไปยัง item ถัดไป
4. WHEN ผู้ใช้กด Arrow Up key, THE DropdownMenu_Content SHALL ย้าย focus ไปยัง item ก่อนหน้า
5. WHEN ผู้ใช้กด Enter หรือ Space key บน item, THE DropdownMenu_Content SHALL เลือก item นั้นและปิด menu
6. WHEN ผู้ใช้กด Escape key, THE DropdownMenu_Content SHALL ปิดทันทีและ focus จะกลับไปที่ trigger
7. THE DropdownMenu_Content SHALL ใช้ Radix UI Portal เพื่อ render นอก DOM hierarchy ของ trigger โดยไม่กระทบ accessibility tree
8. WHEN ผู้ใช้คลิกนอก DropdownMenu_Content, THE DropdownMenu_Root SHALL ปิด dropdown menu ทันที

### Requirement 9: TypeScript และ Export

**User Story:** ในฐานะนักพัฒนา ฉันต้องการ TypeScript types ที่ครบถ้วนและ export ที่ถูกต้อง เพื่อให้สามารถใช้งาน DropdownMenu component ได้อย่างปลอดภัยและสะดวก

#### Acceptance Criteria

1. THE DropdownMenu_Content SHALL export TypeScript interfaces สำหรับ props ทั้งหมด: DropdownMenuProps, DropdownMenuTriggerProps, DropdownMenuContentProps, DropdownMenuItemProps, DropdownMenuSeparatorProps, DropdownMenuLabelProps, DropdownMenuCheckboxItemProps, DropdownMenuRadioGroupProps, DropdownMenuRadioItemProps, DropdownMenuSubProps, DropdownMenuSubTriggerProps, DropdownMenuSubContentProps
2. THE DropdownMenu_Content SHALL export CVA variants type ผ่าน VariantProps
3. WHEN component ถูก export จาก index.ts, THE DropdownMenu_Content SHALL สามารถ import ได้จาก '@tiinno-ui/components'
4. THE DropdownMenu_Content SHALL export dropdownMenuContentVariants สำหรับให้นักพัฒนาใช้ variant classes ภายนอก component ได้
