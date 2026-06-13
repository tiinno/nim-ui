'use client';
// Client boundary shim — dist ของ @nim-ui/components ไม่มี 'use client' banner
// MDX/page ทุกไฟล์ import ผ่านโมดูลนี้แทนการ import ตรง
export * from '@nim-ui/components';
