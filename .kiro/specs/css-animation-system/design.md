# Design Document: ระบบ CSS Animation สำหรับ Nim UI

## Overview

ระบบ CSS Animation นี้เพิ่ม transition และ animation ให้กับ Nim UI component library โดยใช้ CSS เพียงอย่างเดียว ไม่เพิ่ม JS bundle size แม้แต่ byte เดียว

แนวทางหลัก:
- ใช้ CSS custom properties เป็น animation design tokens (duration, easing)
- ใช้ `@keyframes` สำหรับ enter/exit animations
- ใช้ Tailwind CSS v4 `@theme` block เพื่อสร้าง utility classes อัตโนมัติ
- ใช้ Radix UI `data-[state=*]` attributes เป็น animation triggers
- ใช้เฉพาะ GPU-accelerated properties (`transform`, `opacity`)
- รองรับ `prefers-reduced-motion` ผ่าน CSS media query

ระบบนี้ไม่เพิ่ม component ใหม่ แต่ปรับปรุง CSS classes ของ component ที่มีอยู่แล้ว

## Architecture

```mermaid
graph TD
    subgraph "Design Tokens Layer"
        A[tokens.js] -->|export values| B[styles.css @theme block]
        B -->|generates| C[Tailwind Utility Classes]
    end

    subgraph "CSS Definitions Layer"
        D[@keyframes definitions] -->|referenced by| C
        E[@media prefers-reduced-motion] -->|overrides| D
        E -->|overrides| C
    end

    subgraph "Component Layer"
        C -->|applied via CVA| F[Overlay Components]
        C -->|applied via CVA| G[Form Controls]
        C -->|applied via CVA| H[Interactive Components]
    end

    subgraph "Radix Integration"
        I[data-state=open/closed] -->|triggers| F
        J[data-state=checked/unchecked] -->|triggers| G
    end
```

การเปลี่ยนแปลงจะเกิดขึ้นใน 3 ชั้น:

1. **Token Layer**: เพิ่ม animation tokens ใน `tokens.js` และ `styles.css`
2. **CSS Layer**: เพิ่ม `@keyframes` และ reduced motion overrides ใน `styles.css`
3. **Component Layer**: อัปเดต CVA class strings ใน component files ที่มีอยู่

ไม่มีไฟล์ใหม่ที่ต้องสร้าง — ทุกอย่างเป็นการแก้ไขไฟล์ที่มีอยู่แล้ว

## Components and Interfaces

### 1. Animation Tokens (tokens.js)

เพิ่ม `animation` key ใน tokens object:

```javascript
// packages/tailwind-config/src/tokens.js
export const tokens = {
  // ...existing tokens...
  animation: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
    },
    easing: {
      'ease-out': 'cubic-bezier(0.16, 1, 0.3, 1)',    // enter
      'ease-in': 'cubic-bezier(0.55, 0, 1, 0.45)',     // exit
      'ease-in-out': 'cubic-bezier(0.45, 0, 0.55, 1)', // state change
    },
  },
};
```

### 2. CSS Theme Declarations (styles.css)

เพิ่มใน `@theme` block:

```css
@theme {
  /* ...existing color tokens... */

  /* Animation duration tokens */
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;

  /* Animation easing tokens */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.55, 0, 1, 0.45);
  --ease-in-out: cubic-bezier(0.45, 0, 0.55, 1);

  /* Animation keyframe references for Tailwind utility generation */
  --animate-fade-in: fade-in var(--duration-normal) var(--ease-out);
  --animate-fade-out: fade-out var(--duration-normal) var(--ease-in);
  --animate-scale-in: scale-in var(--duration-normal) var(--ease-out);
  --animate-scale-out: scale-out var(--duration-normal) var(--ease-in);
  --animate-slide-in-from-top: slide-in-from-top var(--duration-normal) var(--ease-out);
  --animate-slide-in-from-bottom: slide-in-from-bottom var(--duration-normal) var(--ease-out);
  --animate-slide-in-from-left: slide-in-from-left var(--duration-slow) var(--ease-out);
  --animate-slide-in-from-right: slide-in-from-right var(--duration-slow) var(--ease-out);
  --animate-slide-out-to-top: slide-out-to-top var(--duration-normal) var(--ease-in);
  --animate-slide-out-to-bottom: slide-out-to-bottom var(--duration-normal) var(--ease-in);
  --animate-slide-out-to-left: slide-out-to-left var(--duration-slow) var(--ease-in);
  --animate-slide-out-to-right: slide-out-to-right var(--duration-slow) var(--ease-in);
}
```

### 3. Keyframe Definitions (styles.css)

```css
/* Fade */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* Scale */
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes scale-out {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.95); }
}

/* Slide from directions */
@keyframes slide-in-from-top {
  from { opacity: 0; transform: translateY(-0.5rem); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slide-in-from-bottom {
  from { opacity: 0; transform: translateY(0.5rem); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slide-in-from-left {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
@keyframes slide-in-from-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

/* Slide out to directions */
@keyframes slide-out-to-top {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-0.5rem); }
}
@keyframes slide-out-to-bottom {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(0.5rem); }
}
@keyframes slide-out-to-left {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}
@keyframes slide-out-to-right {
  from { transform: translateX(0); }
  to { transform: translateX(100%); }
}
```

### 4. Reduced Motion Override (styles.css)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 5. Component Updates

แต่ละ component จะถูกอัปเดตโดยเปลี่ยน CVA class strings เท่านั้น ไม่เปลี่ยน props interface:

#### Overlay Components

**Modal** — ปรับ overlay และ content ให้ใช้ custom keyframes แทน tailwindcss-animate:
- Overlay: `data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out`
- Content: `data-[state=open]:animate-scale-in data-[state=closed]:animate-scale-out`

**Drawer** — ปรับ slide animation ให้ใช้ custom keyframes:
- Left: `data-[state=open]:animate-slide-in-from-left data-[state=closed]:animate-slide-out-to-left`
- Right: `data-[state=open]:animate-slide-in-from-right data-[state=closed]:animate-slide-out-to-right`
- Overlay: `data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out`

**Select dropdown** — ปรับ enter/exit ให้ใช้ custom keyframes:
- Content: `data-[state=open]:animate-scale-in data-[state=closed]:animate-scale-out`

#### Form Controls

**Button** — เพิ่ม transition และ active feedback:
- Base: `transition-all duration-fast` (เปลี่ยนจาก `transition-colors`)
- Active: `active:scale-[0.97]`

**Input/Textarea** — เพิ่ม transition สำหรับ focus:
- Base: `transition-[border-color,box-shadow] duration-fast ease-in-out`

**Switch** — เพิ่ม transition สำหรับ track และ thumb:
- Track: `transition-colors duration-fast ease-in-out`
- Thumb: `transition-transform duration-fast ease-out` (มีอยู่แล้วบางส่วน)

**Checkbox** — เพิ่ม transition สำหรับ state change:
- Base: `transition-[background-color,border-color] duration-fast ease-in-out`

#### Interactive Components

**Card** — เพิ่ม hover effect:
- Base: `transition-[box-shadow,transform] duration-fast ease-out`
- Hover: `hover:-translate-y-0.5 hover:shadow-md`

**Tabs trigger** — เพิ่ม transition สำหรับ active state:
- Base: เพิ่ม `transition-[background-color,box-shadow,color] duration-fast ease-in-out` (มี `transition-all` อยู่แล้ว)

**Badge** — เพิ่ม optional enter animation class:
- เพิ่ม `animate` variant ใน CVA: `{ true: 'animate-scale-in' }`

## Data Models

ระบบนี้ไม่มี data model ใหม่ เนื่องจากเป็น CSS-only approach ทั้งหมด

### Token Structure

```typescript
// Type representation ของ animation tokens (สำหรับ documentation เท่านั้น)
interface AnimationTokens {
  duration: {
    fast: string;   // '150ms'
    normal: string; // '200ms'
    slow: string;   // '300ms'
  };
  easing: {
    'ease-out': string;    // cubic-bezier(0.16, 1, 0.3, 1)
    'ease-in': string;     // cubic-bezier(0.55, 0, 1, 0.45)
    'ease-in-out': string; // cubic-bezier(0.45, 0, 0.55, 1)
  };
}
```

### CSS Custom Properties ที่สร้างขึ้น

| Property | Value | ใช้สำหรับ |
|----------|-------|-----------|
| `--duration-fast` | `150ms` | hover, active, focus transitions |
| `--duration-normal` | `200ms` | modal/select enter/exit |
| `--duration-slow` | `300ms` | drawer slide |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | enter animations |
| `--ease-in` | `cubic-bezier(0.55, 0, 1, 0.45)` | exit animations |
| `--ease-in-out` | `cubic-bezier(0.45, 0, 0.55, 1)` | state change transitions |

### Tailwind Utility Classes ที่สร้างขึ้น

| Class | Animation |
|-------|-----------|
| `animate-fade-in` | fade-in 200ms ease-out |
| `animate-fade-out` | fade-out 200ms ease-in |
| `animate-scale-in` | scale-in 200ms ease-out |
| `animate-scale-out` | scale-out 200ms ease-in |
| `animate-slide-in-from-top` | slide-in-from-top 200ms ease-out |
| `animate-slide-in-from-bottom` | slide-in-from-bottom 200ms ease-out |
| `animate-slide-in-from-left` | slide-in-from-left 300ms ease-out |
| `animate-slide-in-from-right` | slide-in-from-right 300ms ease-out |
| `animate-slide-out-to-*` | reverse ของ slide-in |
| `duration-fast` | 150ms |
| `duration-normal` | 200ms |
| `duration-slow` | 300ms |


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Animation token completeness

*For any* animation token name in the required set (`{fast, normal, slow}` for duration, `{ease-out, ease-in, ease-in-out}` for easing), the `tokens.animation` object should contain a valid value — duration values matching `/^\d+ms$/` and easing values matching `/^cubic-bezier\(.+\)$/`.

**Validates: Requirements 1.1, 1.2**

### Property 2: Token consistency (round-trip)

*For any* animation token defined in `tokens.js`, the corresponding CSS custom property in `styles.css` `@theme` block should contain the same value. The JS source and CSS declaration must be in sync.

**Validates: Requirements 1.4**

### Property 3: GPU-only keyframes

*For any* `@keyframes` definition in `styles.css`, the only CSS properties animated should be a subset of `{transform, opacity}`. No layout-triggering properties (`width`, `height`, `margin`, `padding`, `top`, `left`, `right`, `bottom`) should appear.

**Validates: Requirements 3.1**

### Property 4: Overlay animation state coverage

*For any* overlay component (Modal, Drawer, Select) CVA class string, the string should contain both `data-[state=open]` with an enter animation class and `data-[state=closed]` with an exit animation class referencing the custom keyframe utilities.

**Validates: Requirements 4.1, 4.2, 4.3, 9.3**

### Property 5: Drawer direction matching

*For any* Drawer `side` variant value (`left` or `right`), the corresponding CVA class string should contain a slide animation class whose direction matches the side — `slide-in-from-left` for `left`, `slide-in-from-right` for `right`, and the reverse for exit.

**Validates: Requirements 4.5**

### Property 6: Form control Radix state selectors

*For any* Radix-based form control component (Switch, Checkbox), the CVA class string should contain `data-[state=checked]` and `data-[state=unchecked]` selectors with transition classes applied.

**Validates: Requirements 5.4**

### Property 7: Keyframe completeness

*For any* keyframe name in the required set (`{fade-in, fade-out, scale-in, scale-out, slide-in-from-top, slide-in-from-bottom, slide-in-from-left, slide-in-from-right, slide-out-to-top, slide-out-to-bottom, slide-out-to-left, slide-out-to-right}`), the `styles.css` file should contain a `@keyframes` declaration with that exact name.

**Validates: Requirements 7.1**

### Property 8: Backward compatible props

*For any* component that existed before the animation system was added, the TypeScript props interface should remain backward compatible — all previously required props should still be required, and no previously optional props should become required. New optional props (like Badge `animate`) are allowed.

**Validates: Requirements 9.1**

## Error Handling

ระบบ CSS Animation นี้เป็น CSS-only ดังนั้นไม่มี runtime errors ที่ต้องจัดการ อย่างไรก็ตาม มีกรณีที่ต้องพิจารณา:

1. **Browser ไม่รองรับ `@keyframes` หรือ CSS custom properties**: Tailwind CSS v4 ต้องการ browser ที่รองรับ CSS custom properties อยู่แล้ว ดังนั้นไม่ต้อง fallback เพิ่มเติม — component จะแสดงผลปกติโดยไม่มี animation

2. **`prefers-reduced-motion` ไม่ถูกรองรับ**: Browser เก่าที่ไม่รองรับ media query นี้จะแสดง animation ปกติ ซึ่งเป็น progressive enhancement ที่ยอมรับได้

3. **Tailwind CSS purge ลบ animation classes**: ต้องตรวจสอบว่า `data-[state=*]` variant classes ไม่ถูก purge — Tailwind CSS v4 จัดการเรื่องนี้อัตโนมัติเมื่อ classes ถูกใช้ใน source files

4. **Animation ซ้อนกัน**: เมื่อ Modal เปิดแล้วปิดเร็วๆ animation อาจซ้อนกัน — CSS `animation-fill-mode: both` (ซึ่ง Tailwind ใส่ให้อัตโนมัติ) จะจัดการกรณีนี้

## Testing Strategy

### Dual Testing Approach

ใช้ทั้ง unit tests และ property-based tests ร่วมกัน:

- **Unit tests** (Vitest + React Testing Library): ทดสอบ specific examples, edge cases, และ component rendering
- **Property-based tests** (fast-check): ทดสอบ universal properties ข้าม inputs ทั้งหมด

### Property-Based Testing

ใช้ `fast-check` library ที่มีอยู่แล้วใน project

**Configuration**:
- Minimum 100 iterations ต่อ property test
- แต่ละ test ต้อง reference design document property
- Tag format: `Feature: css-animation-system, Property {number}: {property_text}`

**Property tests ที่ต้องเขียน**:

1. **Property 1**: Token completeness — generate random token names from required set, verify tokens object contains valid values
2. **Property 2**: Token consistency — parse both tokens.js and styles.css, verify values match
3. **Property 3**: GPU-only keyframes — parse @keyframes from CSS, verify only transform/opacity are animated
4. **Property 4**: Overlay animation states — for each overlay component, verify both open/closed animation classes exist
5. **Property 5**: Drawer direction — for each side variant, verify matching slide direction
6. **Property 6**: Form control Radix selectors — for each Radix form control, verify data-[state=*] selectors
7. **Property 7**: Keyframe completeness — for each required keyframe name, verify @keyframes declaration exists
8. **Property 8**: Backward compatibility — verify component props interfaces haven't broken

### Unit Tests

Unit tests จะเน้น:

- **Rendering tests**: Component ยังคง render ได้ปกติหลังเพิ่ม animation classes
- **Specific examples**: Modal overlay มี fade-in class, Drawer left มี slide-in-from-left class
- **Edge cases**: Badge ที่ไม่มี animate prop ไม่มี animation class, reduced motion CSS rule มีอยู่ใน styles.css
- **Backward compatibility**: ทุก existing test (1188+) ยังคงผ่าน

### Test File Organization

- Property tests: สร้างไฟล์ `packages/ui/src/components/__tests__/animation-system.test.ts`
- Unit tests: เพิ่มใน test files ที่มีอยู่แล้วของแต่ละ component (เช่น `button.test.tsx`, `modal.test.tsx`)
- CSS parsing tests: อยู่ใน property test file เดียวกัน
