import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { ComponentPreview, PreviewCode } from './preview';
import { PropsTable } from './props-table';
import { ColorSwatch } from './color-swatch';
import { LivePlayground } from './live-playground';

// ComponentPreview/PropsTable/ColorSwatch/LivePlayground ลงทะเบียน global —
// MDX ที่ port มาไม่ต้อง import เอง (codemod ตัด import เดิมทิ้ง)
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ComponentPreview,
    PreviewCode,
    PropsTable,
    ColorSwatch,
    LivePlayground,
    ...components,
  };
}
