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
 * If none exist, generate an example from the schema structure ("your example feature").
 */
export function pickExample(opts: {
  media?: unknown;
  schema?: unknown;
  resolver?: { resolve: (x: any) => any };
}): unknown {
  const media = opts.media as any;
  const schema = opts.schema as any;

  // 1) explicit example(s) in the spec (if present)
  const explicit =
    media?.example ??
    // OpenAPI `examples` object: pick first value if available
    (media?.examples && typeof media.examples === 'object'
      ? (Object.values(media.examples)[0] as any)?.value
      : undefined) ??
    schema?.example ??
    (Array.isArray(schema?.examples) ? schema.examples[0] : undefined) ??
    schema?.default;

  if (explicit !== undefined) return explicit;

  // 2) generated fallback from schema structure
  if (opts.resolver) return buildExampleFromSchema(schema, opts.resolver);

  return undefined;
}

function isObj(x: any): x is Record<string, any> {
  return !!x && typeof x === 'object' && !Array.isArray(x);
}
function isEmptyObj(x: any): boolean {
  return isObj(x) && Object.keys(x).length === 0;
}

function primitiveExample(schema: any): any {
  const t = schema?.type;
  const f = schema?.format;

  if (t === 'string') {
    if (Array.isArray(schema?.enum) && schema.enum.length) return schema.enum[0];
    if (f === 'date-time') return '2026-03-05T12:00:00Z';
    if (f === 'date') return '2026-03-05';
    if (f === 'uuid') return '00000000-0000-0000-0000-000000000000';
    if (f === 'email') return 'user@example.com';
    return 'string';
  }
  if (t === 'integer') return 0;
  if (t === 'number') return 0;
  if (t === 'boolean') return true;

  return undefined;
}

/**
 * Build an example payload from a schema (your "example" feature).
 * This is used when the spec does not provide explicit examples.
 */
export function buildExampleFromSchema(
  schemaRaw: unknown,
  resolver: { resolve: (x: any) => any },
  depth = 0,
  maxDepth = 4,
  maxProps = 10
): unknown {
  if (!schemaRaw || typeof schemaRaw !== 'object') return undefined;
  if (depth > maxDepth) return undefined;

  const schema: any = resolver.resolve(schemaRaw as any);
  if (!schema || typeof schema !== 'object') return undefined;

  // overrides if present
  if (schema.example !== undefined) return schema.example;
  if (schema.default !== undefined) return schema.default;
  if (Array.isArray(schema.enum) && schema.enum.length) return schema.enum[0];
  if (schema.const !== undefined) return schema.const;

  // combinators
  if (Array.isArray(schema.oneOf) && schema.oneOf.length) {
    return buildExampleFromSchema(schema.oneOf[0], resolver, depth + 1, maxDepth, maxProps);
  }
  if (Array.isArray(schema.anyOf) && schema.anyOf.length) {
    return buildExampleFromSchema(schema.anyOf[0], resolver, depth + 1, maxDepth, maxProps);
  }
  if (Array.isArray(schema.allOf) && schema.allOf.length) {
    // merge objects if possible
    const out: any = {};
    for (const part of schema.allOf) {
      const ex = buildExampleFromSchema(part, resolver, depth + 1, maxDepth, maxProps);
      if (isObj(ex)) Object.assign(out, ex);
    }
    if (Object.keys(out).length) return out;
    return buildExampleFromSchema(schema.allOf[0], resolver, depth + 1, maxDepth, maxProps);
  }

  // infer type
  const type =
    schema.type ??
    (schema.properties || schema.additionalProperties ? 'object' : undefined) ??
    (schema.items ? 'array' : undefined);

  if (type === 'array') {
    const itemEx = buildExampleFromSchema(schema.items ?? {}, resolver, depth + 1, maxDepth, maxProps);
    return itemEx === undefined ? [] : [itemEx];
  }

  if (type === 'object') {
    const out: any = {};
    const props = isObj(schema.properties) ? schema.properties : undefined;
    const required: string[] = Array.isArray(schema.required) ? schema.required : [];

    if (props) {
      const keys = [
        ...required,
        ...Object.keys(props).filter(k => !required.includes(k)),
      ].slice(0, maxProps);

      for (const k of keys) {
        const v = buildExampleFromSchema(props[k], resolver, depth + 1, maxDepth, maxProps);
        if (v !== undefined) out[k] = v;
      }
    }

    // additionalProperties map support (incl. Quarkus: {})
    if (schema.additionalProperties !== undefined) {
      const ap = schema.additionalProperties;

      // Quarkus root: additionalProperties: {}
      if (ap === true || isEmptyObj(ap)) {
        out['key'] = 'value';
      } else if (ap === false) {
        // nothing
      } else if (isObj(ap)) {
        out['key'] =
          buildExampleFromSchema(ap, resolver, depth + 1, maxDepth, maxProps) ?? 'value';
      }
    }

    return out;
  }

  const prim = primitiveExample(schema);
  if (prim !== undefined) return prim;

  return undefined;
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
