import type { OpenAPIV3_1 } from 'openapi-types';
import type { EndpointModel, GroupedEndpoints, HttpMethod, ParameterLocation, ParameterModel, ResponseModel, BodyModel } from './models';
import { RefResolver } from './ref-resolver';
import { isRecord, isRefObject, normalizeHttpMethod, normalizeTag, pickContentType, pickExample } from './openapi-utils';

/**
 * Converts OpenAPI v3.1 document into a normalized, renderer-friendly model.
 */
export class OpenApiAdapter {
  constructor(private readonly resolver: RefResolver) {}

  parseEndpoints(spec: OpenAPIV3_1.Document): EndpointModel[] {
    const out: EndpointModel[] = [];
    const paths = (spec.paths ?? {}) as any;

    for (const [path, itemRaw] of Object.entries(paths)) {
      const item = (itemRaw ?? {}) as any;

      // Path-level parameters are applied to every operation.
      const pathParamsRaw: unknown[] = Array.isArray(item.parameters) ? item.parameters : [];

      for (const [m, opRaw] of Object.entries(item)) {
        const method = normalizeHttpMethod(String(m));
        if (!method) continue;

        const op = opRaw as any;
        if (!op || typeof op !== 'object') continue;

        const tag = normalizeTag(op.tags);
        const summary = typeof op.summary === 'string' ? op.summary : undefined;
        const description = typeof op.description === 'string' ? op.description : undefined;

        const parameters = this.parseParameters([...pathParamsRaw, ...(Array.isArray(op.parameters) ? op.parameters : [])]);
        const requestBody = this.parseRequestBody(op.requestBody);
        const responses = this.parseResponses(op.responses);

        out.push({
          tag,
          method,
          path,
          summary,
          description,
          parameters,
          requestBody,
          responses,
        });
      }
    }

    out.sort((a, b) => (a.tag + a.path + a.method).localeCompare(b.tag + b.path + b.method));
    return out;
  }

  group(endpoints: EndpointModel[], groupBy: 'tag' | 'none'): GroupedEndpoints {
    const grouped: GroupedEndpoints = new Map();
    for (const ep of endpoints) {
      const key = groupBy === 'tag' ? ep.tag : 'Endpoints';
      grouped.set(key, [...(grouped.get(key) ?? []), ep]);
    }
    return grouped;
  }

  private parseParameters(rawParams: unknown[]): ParameterModel[] {
    const out: ParameterModel[] = [];

    for (const pRaw of rawParams) {
      const p = this.resolver.resolve(pRaw) as any;
      if (!p || typeof p !== 'object') continue;
      if (isRefObject(p)) continue; // if resolver couldn't resolve it

      const name = typeof p.name === 'string' ? p.name : undefined;
      const loc = typeof p.in === 'string' ? (p.in as ParameterLocation) : undefined;
      if (!name || !loc) continue;

      const required = !!p.required;
      const description = typeof p.description === 'string' ? p.description : undefined;

      const schema = p.schema ? this.resolver.resolve(p.schema) : undefined;
      const def = (schema as any)?.default;
      const example = p.example ?? (schema as any)?.example ?? def;

      out.push({
        name,
        in: loc,
        required,
        description,
        schema,
        default: def,
        example,
      });
    }

    // Keep stable ordering: path params first, then query, then others.
    const weight = (loc: ParameterLocation) => (loc === 'path' ? 0 : loc === 'query' ? 1 : loc === 'header' ? 2 : 3);
    out.sort((a, b) => weight(a.in) - weight(b.in) || a.name.localeCompare(b.name));
    return out;
  }

  private parseRequestBody(raw: unknown): BodyModel | undefined {
    if (!raw) return undefined;
    const rb = this.resolver.resolve(raw) as any;
    if (!rb || typeof rb !== 'object') return undefined;

    const content = rb.content;
    const ct = pickContentType(content);
    if (!ct) return undefined;

    const media = isRecord(content) ? (content as any)[ct] : undefined;
    const schema = media?.schema ? this.resolver.resolve(media.schema) : undefined;
    if (!schema) return undefined;

    const description = typeof rb.description === 'string' ? rb.description : undefined;
    const example = pickExample({ media, schema });

    return { contentType: ct, schema, description, example };
  }

  private parseResponses(raw: unknown): ResponseModel[] {
    const out: ResponseModel[] = [];
    if (!raw || typeof raw !== 'object') return out;

    for (const [status, respRaw] of Object.entries(raw as any)) {
      const resp = this.resolver.resolve(respRaw) as any;
      if (!resp || typeof resp !== 'object') continue;

      const description = typeof resp.description === 'string' ? resp.description : undefined;
      const content = resp.content;
      const ct = pickContentType(content);

      if (!ct) {
        out.push({ status, description });
        continue;
      }

      const media = isRecord(content) ? (content as any)[ct] : undefined;
      const schema = media?.schema ? this.resolver.resolve(media.schema) : undefined;
      const example = pickExample({ media, schema });

      out.push({
        status,
        description,
        contentType: ct,
        schema,
        example,
      });
    }

    out.sort((a, b) => a.status.localeCompare(b.status));
    return out;
  }
}
