# Requirements Document

## Introduction

ระบบ Toast/Notification สำหรับ Nim UI component library เป็น component ในหมวด Feedback ที่ให้ผู้ใช้แสดงข้อความแจ้งเตือนแบบ lightweight ที่ปรากฏชั่วคราวและหายไปอัตโนมัติ รองรับทั้ง declarative JSX API และ imperative API (`toast.success("Saved!")`) สร้างบน Radix UI Toast primitive (`@radix-ui/react-toast`) ตามแบบแผน CVA pattern ของ library

## Glossary

- **Toast**: ข้อความแจ้งเตือนแบบ lightweight ที่ปรากฏชั่วคราวบนหน้าจอ
- **Toast_Provider**: Radix UI Toast Provider component ที่ครอบ application เพื่อจัดการ context ของ toast ทั้งหมด
- **Toast_Viewport**: พื้นที่แสดงผล toast ที่กำหนดตำแหน่งบนหน้าจอ (เช่น top-right, bottom-center)
- **Toast_Component**: React component สำหรับแสดง toast แต่ละรายการ รองรับ variant และ size ผ่าน CVA
- **Toast_Store**: state management module ที่จัดการรายการ toast ทั้งหมดและให้ imperative API
- **Imperative_API**: ฟังก์ชัน `toast()`, `toast.success()`, `toast.error()`, `toast.warning()`, `toast.info()` สำหรับสร้าง toast จาก code โดยไม่ต้องใช้ JSX
- **Variant**: รูปแบบสีของ toast ได้แก่ default, success, error, warning, info
- **Position**: ตำแหน่งแสดงผลของ toast viewport ได้แก่ top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
- **Duration**: ระยะเวลาเป็น milliseconds ก่อนที่ toast จะหายไปอัตโนมัติ
- **Swipe_Direction**: ทิศทางการ swipe เพื่อปิด toast ที่ Radix UI Toast รองรับ

## Requirements

### Requirement 1: Toast Provider และ Viewport

**User Story:** ในฐานะนักพัฒนา ฉันต้องการ Toast Provider และ Viewport component เพื่อให้สามารถกำหนดตำแหน่งและ context สำหรับแสดง toast ทั้งหมดใน application ได้

#### Acceptance Criteria

1. THE Toast_Provider SHALL wrap Radix UI Toast Provider และรับ props สำหรับ swipe direction และ duration default
2. WHEN Toast_Viewport ถูก render, THE Toast_Viewport SHALL แสดงผลเป็น ARIA live region ที่ตำแหน่ง fixed บนหน้าจอ
3. WHEN position prop ถูกกำหนดเป็นค่าใดค่าหนึ่งจาก top-right, top-left, bottom-right, bottom-left, top-center, bottom-center, THE Toast_Viewport SHALL จัดตำแหน่งตาม position ที่กำหนด
4. THE Toast_Viewport SHALL ใช้ z-index ที่สูงพอเพื่อแสดงผลเหนือ content อื่นทั้งหมด
5. WHEN มี toast หลายรายการ, THE Toast_Viewport SHALL จัดเรียง toast เป็น stack ตามลำดับเวลาที่สร้าง

### Requirement 2: Toast Component

**User Story:** ในฐานะนักพัฒนา ฉันต้องการ Toast component ที่รองรับหลาย variant เพื่อให้สามารถแสดงข้อความแจ้งเตือนประเภทต่างๆ ได้อย่างชัดเจน

#### Acceptance Criteria

1. THE Toast_Component SHALL ใช้ CVA pattern สำหรับ variant styling โดยรองรับ variant: default, success, error, warning, info
2. WHEN variant เป็น success, THE Toast_Component SHALL แสดงสีพื้นหลังและขอบที่สื่อถึงความสำเร็จโดยใช้ success design token
3. WHEN variant เป็น error, THE Toast_Component SHALL แสดงสีพื้นหลังและขอบที่สื่อถึงข้อผิดพลาดโดยใช้ error design token
4. WHEN variant เป็น warning, THE Toast_Component SHALL แสดงสีพื้นหลังและขอบที่สื่อถึงคำเตือนโดยใช้ warning design token
5. WHEN variant เป็น info, THE Toast_Component SHALL แสดงสีพื้นหลังและขอบที่สื่อถึงข้อมูลโดยใช้ primary design token
6. THE Toast_Component SHALL รองรับ dark mode โดยมี dark variant classes สำหรับทุก variant
7. THE Toast_Component SHALL ใช้ forwardRef pattern ตามแบบแผนของ Nim UI
8. THE Toast_Component SHALL รองรับ sub-components: ToastTitle, ToastDescription, ToastClose, ToastAction

### Requirement 3: Auto-dismiss

**User Story:** ในฐานะผู้ใช้ ฉันต้องการให้ toast หายไปอัตโนมัติหลังจากระยะเวลาที่กำหนด เพื่อไม่ต้องปิดเองทุกครั้ง

#### Acceptance Criteria

1. WHEN toast ถูกแสดง, THE Toast_Component SHALL หายไปอัตโนมัติหลังจาก duration ที่กำหนด
2. THE Toast_Provider SHALL มี default duration เท่ากับ 5000 milliseconds
3. WHEN duration prop ถูกกำหนดบน toast แต่ละรายการ, THE Toast_Component SHALL ใช้ duration ของรายการนั้นแทน default
4. WHEN duration ถูกกำหนดเป็น Infinity, THE Toast_Component SHALL ไม่หายไปอัตโนมัติจนกว่าผู้ใช้จะปิดเอง

### Requirement 4: Manual Dismiss

**User Story:** ในฐานะผู้ใช้ ฉันต้องการปิด toast ด้วยตนเองผ่านปุ่มปิดหรือ keyboard เพื่อให้สามารถจัดการข้อความแจ้งเตือนได้ตามต้องการ

#### Acceptance Criteria

1. THE Toast_Component SHALL แสดงปุ่มปิด (ToastClose) ที่มี aria-label ระบุการกระทำ
2. WHEN ผู้ใช้คลิกปุ่มปิด, THE Toast_Component SHALL ปิด toast รายการนั้น
3. WHEN ผู้ใช้กด Escape key ขณะ focus อยู่บน toast, THE Toast_Component SHALL ปิด toast รายการนั้น
4. WHEN ผู้ใช้ swipe toast ตามทิศทางที่กำหนด, THE Toast_Component SHALL ปิด toast รายการนั้น

### Requirement 5: Animation

**User Story:** ในฐานะผู้ใช้ ฉันต้องการให้ toast มี animation เข้า-ออกที่ลื่นไหล เพื่อประสบการณ์การใช้งานที่ดี

#### Acceptance Criteria

1. WHEN toast ปรากฏ, THE Toast_Component SHALL ใช้ enter animation จากระบบ CSS animation ที่มีอยู่ (animate-fade-in, animate-slide-in-from-*)
2. WHEN toast หายไป, THE Toast_Component SHALL ใช้ exit animation จากระบบ CSS animation ที่มีอยู่ (animate-fade-out, animate-slide-out-to-*)
3. WHILE ผู้ใช้เปิด prefers-reduced-motion, THE Toast_Component SHALL ลด animation ตาม reduced motion CSS rule ที่มีอยู่ในระบบ

### Requirement 6: Imperative API

**User Story:** ในฐานะนักพัฒนา ฉันต้องการ imperative API สำหรับสร้าง toast จาก code เพื่อให้สามารถแสดง toast จาก event handler, async function, หรือ utility function ได้สะดวก

#### Acceptance Criteria

1. THE Toast_Store SHALL จัดการ state ของ toast ทั้งหมดผ่าน external store ที่ไม่ผูกกับ React component tree
2. THE Imperative_API SHALL มีฟังก์ชัน toast() ที่รับ object ประกอบด้วย title, description, variant, duration
3. THE Imperative_API SHALL มี shorthand functions: toast.success(), toast.error(), toast.warning(), toast.info() ที่กำหนด variant อัตโนมัติ
4. WHEN toast() ถูกเรียก, THE Toast_Store SHALL เพิ่ม toast ใหม่เข้า store และ trigger re-render ของ Toast_Viewport
5. WHEN toast ถูกปิด, THE Toast_Store SHALL ลบ toast ออกจาก store
6. THE Imperative_API SHALL คืนค่า id ของ toast ที่สร้างขึ้นเพื่อให้สามารถอ้างอิงหรือปิดได้ภายหลัง
7. THE Imperative_API SHALL มีฟังก์ชัน toast.dismiss(id) สำหรับปิด toast ที่ระบุ

### Requirement 7: Accessibility

**User Story:** ในฐานะผู้ใช้ที่ใช้ assistive technology ฉันต้องการให้ toast สามารถเข้าถึงได้ผ่าน screen reader และ keyboard เพื่อให้ได้รับข้อมูลแจ้งเตือนเท่าเทียมกับผู้ใช้ทั่วไป

#### Acceptance Criteria

1. THE Toast_Viewport SHALL render เป็น ARIA live region ด้วย role="region" และ aria-label ที่อธิบายจุดประสงค์
2. WHEN toast ใหม่ปรากฏ, THE Toast_Component SHALL ประกาศเนื้อหาผ่าน screen reader โดยใช้ Radix UI Toast ARIA attributes
3. THE Toast_Close SHALL มี aria-label ที่อธิบายการกระทำปิด toast
4. WHEN ผู้ใช้กด Tab, THE Toast_Component SHALL รองรับ focus navigation ไปยัง interactive elements ภายใน toast
5. THE Toast_Component SHALL ใช้ semantic HTML elements ที่เหมาะสม

### Requirement 8: TypeScript และ Export

**User Story:** ในฐานะนักพัฒนา ฉันต้องการ TypeScript types ที่ครบถ้วนและ export ที่ถูกต้อง เพื่อให้สามารถใช้งาน Toast component ได้อย่างปลอดภัยและสะดวก

#### Acceptance Criteria

1. THE Toast_Component SHALL export TypeScript interfaces สำหรับ props ทั้งหมด: ToastProps, ToastProviderProps, ToastViewportProps, ToastTitleProps, ToastDescriptionProps, ToastCloseProps, ToastActionProps
2. THE Toast_Component SHALL export CVA variants type ผ่าน VariantProps
3. THE Toast_Store SHALL export type สำหรับ toast data: ToastData ประกอบด้วย id, title, description, variant, duration
4. WHEN component ถูก export จาก index.ts, THE Toast_Component SHALL สามารถ import ได้จาก '@nim-ui/components'
