'use client';
// Inline handlers ใน MDX (server component) ส่งข้าม RSC boundary ไม่ได้ —
// export จากโมดูล client เพื่อให้กลายเป็น client reference ที่ serialize ได้
export const noop = () => undefined;
export const logValue = (...args: unknown[]) => console.log(...args);
export const logRemoveItem = () => console.log('Remove item');
export const logQuantity = (qty: number) => console.log('New quantity:', qty);
export const preventDefault = (e: { preventDefault(): void }) => e.preventDefault();
export const alertSubscribed = () => alert('Subscribed!');
export const alertSignUp = () => alert('Sign up clicked');
export const alertLearnMore = () => alert('Learn more clicked');
export const submitFormAlert = (e: { preventDefault(): void }) => {
  e.preventDefault();
  alert('Form submitted!');
};
