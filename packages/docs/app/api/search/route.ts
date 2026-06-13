import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

// Static export: คาย search index เป็นไฟล์ static ที่ /api/search
export const revalidate = false;

export const { staticGET: GET } = createFromSource(source);
