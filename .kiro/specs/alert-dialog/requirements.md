# Requirements Document

## Introduction

Alert Dialog component สำหรับ Tiinno UI component library เป็น component ในหมวด Feedback/Overlay ที่แสดง dialog แบบ modal สำหรับการยืนยันการกระทำที่สำคัญ (เช่น ลบข้อมูล, ยกเลิกการเปลี่ยนแปลง) สร้างบน Radix UI Alert Dialog primitive (`@radix-ui/react-alert-dialog`) ตามแบบแผน CVA pattern ของ library รองรับ compound component pattern (AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel), overlay backdrop พร้อม animation, dark mode, และ accessibility ครบถ้วนตาม WAI-ARIA alertdialog pattern

## Glossary

- **AlertDialog_Root**: Radix UI AlertDialog Root component ที่จัดการ open/close state ของ alert dialog
- **AlertDialog_Trigger**: Element ที่เมื่อคลิกจะเปิด alert dialog
- **AlertDialog_Content**: Component หลักที่แสดงเนื้อหาของ alert dialog อยู่กลางหน้าจอ รองรับ variant ผ่าน CVA
- **AlertDialog_Overlay**: Backdrop overlay ที่ปิดพื้นหลังเมื่อ alert dialog เปิด
- **AlertDialog_Header**: Container สำหรับ Title และ Description ของ alert dialog
- **AlertDialog_Footer**: Container สำหรับ Action และ Cancel buttons ของ alert dialog
- **AlertDialog_Title**: หัวข้อของ alert dialog ใช้เป็น aria-labelledby
- **AlertDialog_Description**: คำอธิบายของ alert dialog ใช้เป็น aria-describedby
- **AlertDialog_Action**: ปุ่มยืนยันการกระทำ (confirm action) ที่ปิด dialog เมื่อคลิก
- **AlertDialog_Cancel**: ปุ่มยกเลิกที่ปิด dialog โดยไม่ดำเนินการ
- **Variant**: รูปแบบสีของ AlertDialog_Content ได้แก่ default (พื้นหลังขาว/เข้มใน dark mode), destructive (มี accent สีแดง/error สำหรับการกระทำอันตราย)

## Requirements

### Requirement 1: AlertDialog Root

**User Story:** ในฐานะนักพัฒนา ฉันต้องการ AlertDialog Root component เพื่อจัดการ open/close state ของ alert dialog และรองรับทั้ง controlled และ uncontrolled mode

#### Acceptance Criteria

1. THE AlertDialog_Root SHALL wrap Radix UI AlertDialog Root และรับ props สำหรับ open, defaultOpen, และ onOpenChange
2. WHEN open prop ถูกกำหนด, THE AlertDialog_Root SHALL ทำงานใน controlled mode โดยใช้ค่า open ที่กำหนด
3. WHEN onOpenChange callback ถูกกำหนด, THE AlertDialog_Root SHALL เรียก callback เมื่อ open state เปลี่ยนแปลง
4. WHEN defaultOpen prop ถูกกำหนด, THE AlertDialog_Root SHALL ใช้ค่านั้นเป็น initial open state สำหรับ uncontrolled mode

### Requirement 2: AlertDialog Content Component

**User Story:** ในฐานะนักพัฒนา ฉันต้องการ AlertDialog Content component ที่รองรับหลาย variant เพื่อให้สามารถแสดง alert dialog ได้ทั้งแบบปกติและแบบ destructive

#### Acceptance Criteria

1. THE AlertDialog_Content SHALL ใช้ CVA pattern สำหรับ variant styling โดยรองรับ variant: default, destructive
2. WHEN variant เป็น default, THE AlertDialog_Content SHALL แสดงพื้นหลังสีขาว (white) พร้อมข้อความสีเข้ม (neutral-900), ขอบ (border-neutral-200), และเงา (shadow-lg)
3. WHEN variant เป็น destructive, THE AlertDialog_Content SHALL แสดงพื้นหลังสีขาว (white) พร้อมขอบสีแดง (border-error-500) ที่ด้านบนหรือด้านซ้าย เพื่อบ่งบอกการกระทำอันตราย
4. THE AlertDialog_Content SHALL รองรับ dark mode โดยมี dark variant classes สำหรับทุก variant
5. THE AlertDialog_Content SHALL แสดงอยู่กลางหน้าจอ (centered) ทั้งแนวนอนและแนวตั้ง
6. THE AlertDialog_Content SHALL ใช้ forwardRef pattern ตามแบบแผนของ Tiinno UI
7. THE AlertDialog_Content SHALL ใช้ enter/exit animation สำหรับทั้ง content และ overlay (animate-fade-in, animate-fade-out)
8. THE AlertDialog_Content SHALL render ผ่าน Radix Portal นอก DOM hierarchy

### Requirement 3: AlertDialog Overlay

**User Story:** ในฐานะผู้ใช้ ฉันต้องการ backdrop overlay ที่ปิดพื้นหลังเมื่อ alert dialog เปิด เพื่อให้โฟกัสอยู่ที่ dialog เท่านั้น

#### Acceptance Criteria

1. THE AlertDialog_Overlay SHALL แสดง backdrop สีดำโปร่งแสง (bg-black/50) เมื่อ alert dialog เปิด
2. THE AlertDialog_Overlay SHALL ครอบคลุมทั้งหน้าจอ (fixed inset-0)
3. THE AlertDialog_Overlay SHALL มี animation สำหรับ fade-in เมื่อเปิดและ fade-out เมื่อปิด
4. THE AlertDialog_Overlay SHALL รองรับ forwardRef pattern
5. THE AlertDialog_Overlay SHALL ไม่ปิด dialog เมื่อคลิกที่ overlay (ต่างจาก Modal/Popover ปกติ เพราะ alert dialog ต้องการการตอบสนองจากผู้ใช้อย่างชัดเจน)

### Requirement 4: AlertDialog Header, Footer, Title, Description

**User Story:** ในฐานะนักพัฒนา ฉันต้องการ sub-components สำหรับจัดโครงสร้างเนื้อหาภายใน alert dialog เพื่อให้มี layout ที่สม่ำเสมอ

#### Acceptance Criteria

1. THE AlertDialog_Header SHALL render เป็น div container ด้วย flex column layout และ spacing ที่เหมาะสม
2. THE AlertDialog_Footer SHALL render เป็น div container ด้วย flex row layout, justify-end, และ gap สำหรับ buttons
3. THE AlertDialog_Title SHALL wrap Radix AlertDialog.Title ด้วย styling สำหรับ heading (text-lg font-semibold)
4. THE AlertDialog_Title SHALL รองรับ dark mode text color
5. THE AlertDialog_Description SHALL wrap Radix AlertDialog.Description ด้วย styling สำหรับ body text (text-sm text-neutral-500)
6. THE AlertDialog_Description SHALL รองรับ dark mode text color
7. THE AlertDialog_Header, AlertDialog_Footer, AlertDialog_Title, AlertDialog_Description SHALL ใช้ forwardRef pattern

### Requirement 5: AlertDialog Action และ Cancel

**User Story:** ในฐานะนักพัฒนา ฉันต้องการ Action และ Cancel button components เพื่อให้ผู้ใช้สามารถยืนยันหรือยกเลิกการกระทำใน alert dialog

#### Acceptance Criteria

1. THE AlertDialog_Action SHALL wrap Radix AlertDialog.Action และปิด dialog เมื่อคลิก
2. THE AlertDialog_Cancel SHALL wrap Radix AlertDialog.Cancel และปิด dialog เมื่อคลิก
3. THE AlertDialog_Action SHALL ใช้ forwardRef pattern
4. THE AlertDialog_Cancel SHALL ใช้ forwardRef pattern
5. WHEN AlertDialog_Cancel ถูกคลิก, THE AlertDialog_Root SHALL ปิด dialog โดยไม่ดำเนินการใดๆ

### Requirement 6: Accessibility

**User Story:** ในฐานะผู้ใช้ที่ใช้ assistive technology ฉันต้องการให้ alert dialog สามารถเข้าถึงได้ผ่าน screen reader และ keyboard เพื่อให้สามารถใช้งานได้เท่าเทียมกับผู้ใช้ทั่วไป

#### Acceptance Criteria

1. THE AlertDialog_Content SHALL render ด้วย role="alertdialog" ตาม WAI-ARIA specification
2. THE AlertDialog_Content SHALL มี aria-labelledby ที่เชื่อมกับ AlertDialog_Title
3. THE AlertDialog_Content SHALL มี aria-describedby ที่เชื่อมกับ AlertDialog_Description
4. WHEN alert dialog เปิด, THE AlertDialog_Content SHALL trap focus ภายใน dialog
5. WHEN ผู้ใช้กด Escape key, THE AlertDialog_Root SHALL ปิด dialog ทันที
6. WHEN alert dialog ปิด, THE AlertDialog_Root SHALL คืน focus กลับไปที่ trigger element
7. THE AlertDialog_Content SHALL ใช้ Radix UI Portal เพื่อ render นอก DOM hierarchy โดยไม่กระทบ accessibility tree

### Requirement 7: TypeScript และ Export

**User Story:** ในฐานะนักพัฒนา ฉันต้องการ TypeScript types ที่ครบถ้วนและ export ที่ถูกต้อง เพื่อให้สามารถใช้งาน AlertDialog component ได้อย่างปลอดภัยและสะดวก

#### Acceptance Criteria

1. THE AlertDialog component SHALL export TypeScript interfaces สำหรับ props ทั้งหมด: AlertDialogProps, AlertDialogTriggerProps, AlertDialogContentProps, AlertDialogOverlayProps, AlertDialogHeaderProps, AlertDialogFooterProps, AlertDialogTitleProps, AlertDialogDescriptionProps, AlertDialogActionProps, AlertDialogCancelProps
2. THE AlertDialog component SHALL export CVA variants type ผ่าน VariantProps
3. WHEN component ถูก export จาก index.ts, THE AlertDialog component SHALL สามารถ import ได้จาก '@tiinno-ui/components'
4. THE AlertDialog component SHALL export alertDialogContentVariants สำหรับให้นักพัฒนาใช้ variant classes ภายนอก component ได้
