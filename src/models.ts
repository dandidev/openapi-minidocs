import type { OpenAPIV3_1 } from 'openapi-types';

/**
 * Renderer-facing, normalized model.
 *
 * Goal: keep the renderer free from OpenAPI shape details.
 */

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'
  | 'TRACE';

export type ParameterLocation = 'query' | 'path' | 'header' | 'cookie';

export type SchemaLike =
  | OpenAPIV3_1.SchemaObject
  | OpenAPIV3_1.ReferenceObject
  | unknown;

export type ParameterModel = {
  name: string;
  in: ParameterLocation;
  required: boolean;
  description?: string;
  schema?: SchemaLike;
  default?: unknown;
  example?: unknown;
};

export type BodyModel = {
  contentType: string;
  schema: SchemaLike;
  description?: string;
  example?: unknown;
};

export type ResponseModel = {
  status: string;
  description?: string;
  contentType?: string;
  schema?: SchemaLike;
  example?: unknown;
};

export type EndpointModel = {
  tag: string;
  method: HttpMethod;
  path: string;
  summary?: string;
  description?: string;
  parameters: ParameterModel[];
  requestBody?: BodyModel;
  responses: ResponseModel[];
};

export type GroupedEndpoints = Map<string, EndpointModel[]>;
