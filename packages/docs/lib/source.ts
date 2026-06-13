import { docs } from 'collections/server';
import { loader } from 'fumadocs-core/source';

// baseUrl '/' — คง URL เดิมของ Starlight (/components/..., /guides/...) ไม่มี /docs prefix
export const source = loader({
  baseUrl: '/',
  source: docs.toFumadocsSource(),
});
