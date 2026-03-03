import type { OpenAPIV3_1 } from 'openapi-types';
import type { HttpMethod } from './models';

export function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object';
}

export function isRefObject(v: unknown): v is OpenAPIV3_1.ReferenceObject {
  return isRecord(v) && typeof (v as any).$ref === 'string';
}

export function pickContentType(content: unknown): string | undefined {
  if (!isRecord(content)) return undefined;
  if (typeof content['application/json'] !== 'undefined') return 'application/json';
  const keys = Object.keys(content);
  return keys[0];
}

/**
 * OpenAPI examples may appear in multiple places. Prefer explicit media example, then schema example, then default.
 */
export function pickExample(opts: {
  media?: unknown;
  schema?: unknown;
}): unknown {
  const media = opts.media as any;
  const schema = opts.schema as any;
  return (
    media?.example ??
    schema?.example ??
    schema?.default
  );
}

export function normalizeTag(tags: unknown): string {
  if (Array.isArray(tags) && typeof tags[0] === 'string' && tags[0]) return tags[0];
  return 'Endpoints';
}

export function normalizeHttpMethod(m: string): HttpMethod | undefined {
  const method = m.toUpperCase();
  if (
    method === 'GET' ||
    method === 'POST' ||
    method === 'PUT' ||
    method === 'PATCH' ||
    method === 'DELETE' ||
    method === 'HEAD' ||
    method === 'OPTIONS' ||
    method === 'TRACE'
  ) return method as HttpMethod;
  return undefined;
}
