# เอกสารข้อกำหนด: ระบบ CSS Animation สำหรับ Nim UI

## บทนำ

ระบบ CSS Animation สำหรับ Nim UI เป็นการเพิ่มชุด transition และ animation ที่ใช้ CSS เพียงอย่างเดียว (ไม่ใช้ JS animation library) ให้กับ component library ที่มีอยู่แล้ว 31 components เพื่อให้ UI มีความรู้สึกเนียนและเป็นมืออาชีพมากขึ้น โดยใช้ Tailwind CSS v4 utilities, `@keyframes`, และ CSS custom properties เท่านั้น ไม่เพิ่มขนาด JS bundle

## อภิธานศัพท์

- **Animation_System**: ระบบรวมของ CSS keyframes, transitions, design tokens สำหรับ duration/easing, และ Tailwind utility classes ที่ใช้ขับเคลื่อน animation ทั้งหมดใน Nim UI
- **Animation_Token**: CSS custom property ที่กำหนดค่า duration และ easing curve สำหรับใช้ร่วมกันทั้ง library เช่น `--duration-fast`, `--ease-out`
- **GPU_Property**: CSS property ที่ browser สามารถ composite บน GPU ได้โดยไม่ trigger layout/paint ได้แก่ `transform` และ `opacity`
- **Reduced_Motion_Mode**: สถานะที่ผู้ใช้เปิด `prefers-reduced-motion: reduce` ใน OS ซึ่งระบบต้องลดหรือปิด animation
- **Radix_Data_Attribute**: HTML data attribute ที่ Radix UI primitives กำหนดให้ เช่น `data-[state=open]`, `data-[state=closed]`, `data-[state=checked]` ใช้เป็น selector สำหรับ animation state
- **Overlay_Component**: Component ที่แสดงเป็น layer ซ้อนทับ UI หลัก ได้แก่ Modal, Drawer, Select dropdown
- **Form_Control_Component**: Component สำหรับรับ input จากผู้ใช้ ได้แก่ Input, Textarea, Checkbox, Switch, Radio, Select trigger, Button
- **Interactive_Component**: Component ที่มี hover/focus state ได้แก่ Button, Card, Badge, Tabs trigger

## ข้อกำหนด

### ข้อกำหนดที่ 1: Animation Design Tokens

**User Story:** ในฐานะนักพัฒนา ฉันต้องการชุด design tokens สำหรับ animation ที่เป็นมาตรฐานเดียวกันทั้ง library เพื่อให้ timing และ easing ของทุก component สอดคล้องกัน

#### เกณฑ์การยอมรับ

1. THE Animation_System SHALL กำหนด CSS custom properties สำหรับ duration อย่างน้อย 3 ระดับ: fast (100-150ms), normal (200-250ms), และ slow (300-350ms)
2. THE Animation_System SHALL กำหนด CSS custom properties สำหรับ easing curve อย่างน้อย 3 แบบ: ease-out (สำหรับ enter), ease-in (สำหรับ exit), และ ease-in-out (สำหรับ state change)
3. THE Animation_System SHALL ประกาศ tokens ทั้งหมดใน `packages/ui/src/styles.css` ภายใน `@theme` block เพื่อให้ Tailwind CSS v4 สร้าง utility classes อัตโนมัติ
4. THE Animation_System SHALL ส่งออก token values ใน `packages/tailwind-config/src/tokens.js` เพื่อให้เป็น single source of truth

### ข้อกำหนดที่ 2: Reduced Motion Accessibility

**User Story:** ในฐานะผู้ใช้ที่มีความไวต่อ motion ฉันต้องการให้ระบบเคารพการตั้งค่า `prefers-reduced-motion` ของฉัน เพื่อให้ฉันใช้งาน UI ได้อย่างสะดวกสบาย

#### เกณฑ์การยอมรับ

1. WHILE Reduced_Motion_Mode เปิดอยู่, THE Animation_System SHALL ลด duration ของ animation ทั้งหมดเหลือ 0ms หรือใกล้เคียง
2. WHILE Reduced_Motion_Mode เปิดอยู่, THE Animation_System SHALL คง transition ของ color และ opacity ไว้ได้ แต่ต้องปิด transform-based animation ทั้งหมด
3. THE Animation_System SHALL ใช้ CSS media query `@media (prefers-reduced-motion: reduce)` ในการจัดการ reduced motion โดยไม่ต้องใช้ JavaScript

### ข้อกำหนดที่ 3: GPU-Accelerated Animation เท่านั้น

**User Story:** ในฐานะนักพัฒนา ฉันต้องการให้ animation ทั้งหมดใช้เฉพาะ GPU-accelerated properties เพื่อให้ได้ประสิทธิภาพ 60fps โดยไม่ trigger layout reflow

#### เกณฑ์การยอมรับ

1. THE Animation_System SHALL ใช้เฉพาะ GPU_Property (`transform` และ `opacity`) สำหรับ animation ทั้งหมด
2. THE Animation_System SHALL ใช้เฉพาะ `box-shadow` และ `border-color` สำหรับ transition ของ hover/focus state (ซึ่งเป็น paint-only ไม่ trigger layout)
3. THE Animation_System SHALL ไม่ animate properties ที่ trigger layout เช่น `width`, `height`, `margin`, `padding`, `top`, `left`

### ข้อกำหนดที่ 4: Overlay Component Animations (Modal, Drawer, Select)

**User Story:** ในฐานะผู้ใช้ ฉันต้องการให้ Modal, Drawer, และ Select dropdown มี animation เปิด/ปิดที่เนียน เพื่อให้รู้สึกถึงบริบทของ UI ที่เปลี่ยนไป

#### เกณฑ์การยอมรับ

1. WHEN Overlay_Component เปลี่ยนเป็นสถานะ open, THE Animation_System SHALL แสดง enter animation ด้วย fade-in ร่วมกับ scale หรือ slide ตาม component type
2. WHEN Overlay_Component เปลี่ยนเป็นสถานะ closed, THE Animation_System SHALL แสดง exit animation ด้วย fade-out ร่วมกับ scale หรือ slide ย้อนกลับ
3. THE Animation_System SHALL ใช้ Radix_Data_Attribute (`data-[state=open]` และ `data-[state=closed]`) เป็น selector สำหรับ animation state ของ Overlay_Component
4. WHEN Modal เปิด, THE Animation_System SHALL แสดง overlay backdrop ด้วย fade-in animation
5. WHEN Drawer เปิด, THE Animation_System SHALL แสดง slide-in animation จากทิศทางที่ตรงกับ `side` prop (left หรือ right)

### ข้อกำหนดที่ 5: Form Control Transitions

**User Story:** ในฐานะผู้ใช้ ฉันต้องการให้ form controls มี transition ที่เนียนเมื่อเปลี่ยนสถานะ เพื่อให้รู้สึกถึง feedback จากการโต้ตอบ

#### เกณฑ์การยอมรับ

1. WHEN Input หรือ Textarea ได้รับ focus, THE Animation_System SHALL แสดง transition ของ border-color และ ring อย่างเนียน
2. WHEN Switch เปลี่ยนสถานะ checked/unchecked, THE Animation_System SHALL แสดง transition ของ thumb position (translate) และ background-color
3. WHEN Checkbox เปลี่ยนสถานะ checked/unchecked, THE Animation_System SHALL แสดง transition ของ background-color และ border-color
4. THE Animation_System SHALL ใช้ Radix_Data_Attribute (`data-[state=checked]`, `data-[state=unchecked]`) เป็น selector สำหรับ form control state transitions

### ข้อกำหนดที่ 6: Interactive Component Feedback

**User Story:** ในฐานะผู้ใช้ ฉันต้องการให้ Button, Card, Badge, และ Tabs มี visual feedback เมื่อ hover และ interact เพื่อให้รู้สึกว่า UI ตอบสนอง

#### เกณฑ์การยอมรับ

1. WHEN ผู้ใช้ hover บน Button, THE Animation_System SHALL แสดง transition ของ background-color ด้วย duration ระดับ fast
2. WHEN ผู้ใช้กด Button (active state), THE Animation_System SHALL แสดง subtle scale-down effect ด้วย `transform: scale()`
3. WHEN ผู้ใช้ hover บน Card, THE Animation_System SHALL แสดง transition ของ shadow ที่เพิ่มขึ้นและ subtle translate-y ขึ้นเล็กน้อย
4. WHEN TabsTrigger เปลี่ยนเป็นสถานะ active, THE Animation_System SHALL แสดง transition ของ background-color และ shadow อย่างเนียน
5. WHEN Badge ปรากฏขึ้น, THE Animation_System SHALL รองรับ optional enter animation class ที่นักพัฒนาสามารถเพิ่มได้

### ข้อกำหนดที่ 7: Keyframe Definitions

**User Story:** ในฐานะนักพัฒนา ฉันต้องการชุด `@keyframes` ที่พร้อมใช้งาน เพื่อให้สามารถนำไปใช้กับ component ต่างๆ ได้อย่างสะดวก

#### เกณฑ์การยอมรับ

1. THE Animation_System SHALL กำหนด `@keyframes` สำหรับ fade-in, fade-out, scale-in, scale-out, slide-in-from-top, slide-in-from-bottom, slide-in-from-left, slide-in-from-right, และ slide-out ในทิศทางตรงข้าม
2. THE Animation_System SHALL ประกาศ `@keyframes` ทั้งหมดใน `packages/ui/src/styles.css`
3. THE Animation_System SHALL สร้าง Tailwind utility classes สำหรับ keyframes ทั้งหมดผ่าน `@theme` block เพื่อให้ใช้เป็น `animate-fade-in`, `animate-slide-in-from-left` เป็นต้น
4. THE Animation_System SHALL ใช้เฉพาะ GPU_Property (`transform` และ `opacity`) ใน keyframe definitions ทั้งหมด

### ข้อกำหนดที่ 8: Zero JS Bundle Impact

**User Story:** ในฐานะนักพัฒนา ฉันต้องการให้ระบบ animation ไม่เพิ่มขนาด JavaScript bundle เพื่อรักษาประสิทธิภาพของ library

#### เกณฑ์การยอมรับ

1. THE Animation_System SHALL ใช้เฉพาะ CSS (Tailwind classes, `@keyframes`, CSS custom properties) สำหรับ animation ทั้งหมด
2. THE Animation_System SHALL ไม่เพิ่ม JavaScript dependency ใหม่สำหรับ animation (เช่น Framer Motion, react-spring)
3. THE Animation_System SHALL ไม่เพิ่ม JavaScript runtime code สำหรับการจัดการ animation state

### ข้อกำหนดที่ 9: Backward Compatibility

**User Story:** ในฐานะนักพัฒนาที่ใช้ Nim UI อยู่แล้ว ฉันต้องการให้การเพิ่ม animation ไม่ทำให้ component ที่มีอยู่เสียหาย เพื่อให้ฉันอัปเดตได้อย่างมั่นใจ

#### เกณฑ์การยอมรับ

1. WHEN Animation_System ถูกเพิ่มเข้าไป, THE Animation_System SHALL ไม่เปลี่ยนแปลง public API (props interface) ของ component ที่มีอยู่
2. WHEN Animation_System ถูกเพิ่มเข้าไป, THE Animation_System SHALL ทำให้ test suite ที่มีอยู่ทั้งหมด (1188+ tests) ยังคงผ่าน
3. IF component มี animation อยู่แล้ว (Modal, Drawer, Select), THEN THE Animation_System SHALL ปรับปรุง animation ให้ใช้ token ใหม่โดยไม่เปลี่ยนพฤติกรรมที่มองเห็นได้
