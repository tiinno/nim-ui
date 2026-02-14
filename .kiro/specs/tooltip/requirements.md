# Requirements Document

## Introduction

Tooltip component สำหรับ Nim UI component library เป็น component ในหมวด Overlay ที่แสดงข้อความอธิบายเพิ่มเติมเมื่อผู้ใช้ hover หรือ focus บน element สร้างบน Radix UI Tooltip primitive (`@radix-ui/react-tooltip`) ตามแบบแผน CVA pattern ของ library รองรับหลายตำแหน่ง (top, bottom, left, right), configurable delay, arrow indicator, dark mode, และ accessibility ครบถ้วน

## Glossary

- **Tooltip_Provider**: Radix UI Tooltip Provider component ที่ครอบ application เพื่อจัดการ context ของ tooltip ทั้งหมด รวมถึง global delay settings
- **Tooltip_Root**: Radix UI Tooltip Root component ที่จัดการ open/close state ของ tooltip แต่ละรายการ
- **Tooltip_Trigger**: Element ที่เมื่อ hover หรือ focus จะแสดง tooltip
- **Tooltip_Content**: Component ที่แสดงเนื้อหาของ tooltip รองรับ variant และ side ผ่าน CVA
- **Tooltip_Arrow**: ลูกศรชี้จาก tooltip ไปยัง trigger element
- **Side**: ตำแหน่งแสดงผลของ tooltip เทียบกับ trigger ได้แก่ top, bottom, left, right
- **Delay**: ระยะเวลาเป็น milliseconds ก่อนที่ tooltip จะปรากฏ (delayDuration) หรือหายไป (skipDelayDuration)
- **Variant**: รูปแบบสีของ tooltip ได้แก่ default (dark background), light (light background)

## Requirements

### Requirement 1: Tooltip Provider

**User Story:** ในฐานะนักพัฒนา ฉันต้องการ Tooltip Provider component เพื่อให้สามารถกำหนด global delay settings สำหรับ tooltip ทั้งหมดใน application ได้

#### Acceptance Criteria

1. THE Tooltip_Provider SHALL wrap Radix UI Tooltip Provider และรับ props สำหรับ delayDuration และ skipDelayDuration
2. WHEN delayDuration prop ถูกกำหนด, THE Tooltip_Provider SHALL ใช้ค่านั้นเป็น default delay ก่อนแสดง tooltip
3. WHEN skipDelayDuration prop ถูกกำหนด, THE Tooltip_Provider SHALL ใช้ค่านั้นเป็น delay สำหรับการแสดง tooltip ถัดไปเมื่อ tooltip อื่นเพิ่งถูกปิด
4. THE Tooltip_Provider SHALL มี default delayDuration เท่ากับ 300 milliseconds

### Requirement 2: Tooltip Content Component

**User Story:** ในฐานะนักพัฒนา ฉันต้องการ Tooltip Content component ที่รองรับหลาย variant และตำแหน่ง เพื่อให้สามารถแสดงข้อความอธิบายได้อย่างยืดหยุ่น

#### Acceptance Criteria

1. THE Tooltip_Content SHALL ใช้ CVA pattern สำหรับ variant styling โดยรองรับ variant: default, light
2. WHEN variant เป็น default, THE Tooltip_Content SHALL แสดงพื้นหลังสีเข้ม (neutral-900) พร้อมข้อความสีอ่อน (neutral-50)
3. WHEN variant เป็น light, THE Tooltip_Content SHALL แสดงพื้นหลังสีอ่อน (white) พร้อมข้อความสีเข้ม (neutral-900) และขอบ (border)
4. THE Tooltip_Content SHALL รองรับ dark mode โดยมี dark variant classes สำหรับทุก variant
5. WHEN side prop ถูกกำหนดเป็นค่าใดค่าหนึ่งจาก top, bottom, left, right, THE Tooltip_Content SHALL แสดงผลที่ตำแหน่งตาม side ที่กำหนด
6. THE Tooltip_Content SHALL มี default side เป็น top
7. THE Tooltip_Content SHALL ใช้ forwardRef pattern ตามแบบแผนของ Nim UI
8. THE Tooltip_Content SHALL รองรับ sideOffset prop สำหรับกำหนดระยะห่างจาก trigger element
9. THE Tooltip_Content SHALL มี default sideOffset เท่ากับ 4 pixels
10. THE Tooltip_Content SHALL ใช้ enter/exit animation จากระบบ CSS animation ที่มีอยู่ (animate-fade-in, animate-fade-out)

### Requirement 3: Tooltip Arrow

**User Story:** ในฐานะนักพัฒนา ฉันต้องการ arrow indicator บน tooltip เพื่อให้ผู้ใช้เห็นความสัมพันธ์ระหว่าง tooltip กับ trigger element ได้ชัดเจน

#### Acceptance Criteria

1. WHERE showArrow prop ถูกเปิดใช้งาน, THE Tooltip_Content SHALL แสดง Tooltip_Arrow ที่ชี้ไปยัง trigger element
2. THE Tooltip_Arrow SHALL มีสีที่สอดคล้องกับ variant ของ Tooltip_Content (สีเข้มสำหรับ default, สีอ่อนสำหรับ light)
3. WHEN showArrow prop ไม่ถูกกำหนดหรือเป็น false, THE Tooltip_Content SHALL ไม่แสดง arrow

### Requirement 4: Delay Configuration

**User Story:** ในฐานะนักพัฒนา ฉันต้องการกำหนด delay สำหรับการเปิดและปิด tooltip แต่ละรายการ เพื่อให้สามารถปรับ UX ตามบริบทการใช้งานได้

#### Acceptance Criteria

1. WHEN delayDuration prop ถูกกำหนดบน Tooltip_Root, THE Tooltip_Root SHALL ใช้ค่านั้นแทน default จาก Provider
2. WHEN delayDuration ถูกกำหนดเป็น 0, THE Tooltip_Content SHALL แสดงทันทีเมื่อ hover หรือ focus
3. THE Tooltip_Root SHALL รองรับ open และ onOpenChange props สำหรับ controlled mode

### Requirement 5: Accessibility

**User Story:** ในฐานะผู้ใช้ที่ใช้ assistive technology ฉันต้องการให้ tooltip สามารถเข้าถึงได้ผ่าน screen reader และ keyboard เพื่อให้ได้รับข้อมูลเพิ่มเติมเท่าเทียมกับผู้ใช้ทั่วไป

#### Acceptance Criteria

1. THE Tooltip_Content SHALL render ด้วย role="tooltip" ตาม WAI-ARIA specification
2. WHEN Tooltip_Trigger ได้รับ keyboard focus, THE Tooltip_Content SHALL แสดงผลเช่นเดียวกับ hover
3. WHEN ผู้ใช้กด Escape key, THE Tooltip_Content SHALL ปิดทันที
4. THE Tooltip_Trigger SHALL มี aria-describedby ที่เชื่อมโยงกับ Tooltip_Content เพื่อให้ screen reader อ่านเนื้อหา tooltip
5. THE Tooltip_Content SHALL ใช้ Radix UI Portal เพื่อ render นอก DOM hierarchy ของ trigger โดยไม่กระทบ accessibility tree

### Requirement 6: TypeScript และ Export

**User Story:** ในฐานะนักพัฒนา ฉันต้องการ TypeScript types ที่ครบถ้วนและ export ที่ถูกต้อง เพื่อให้สามารถใช้งาน Tooltip component ได้อย่างปลอดภัยและสะดวก

#### Acceptance Criteria

1. THE Tooltip_Content SHALL export TypeScript interfaces สำหรับ props ทั้งหมด: TooltipProps, TooltipProviderProps, TooltipTriggerProps, TooltipContentProps, TooltipArrowProps
2. THE Tooltip_Content SHALL export CVA variants type ผ่าน VariantProps
3. WHEN component ถูก export จาก index.ts, THE Tooltip_Content SHALL สามารถ import ได้จาก '@nim-ui/components'
4. THE Tooltip_Content SHALL export tooltipContentVariants สำหรับให้นักพัฒนาใช้ variant classes ภายนอก component ได้
