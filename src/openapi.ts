import type { OpenAPIV3_1 } from 'openapi-types';

export async function loadSpec(specUrl: string): Promise<OpenAPIV3_1.Document> {
  const res = await fetch(specUrl, { headers: { Accept: 'application/json' } });
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Failed to load ${specUrl}: ${res.status} ${res.statusText}\n\n${text.slice(0, 600)}`);
  }

  try {
    return JSON.parse(text) as OpenAPIV3_1.Document;
  } catch {
    throw new Error(`Spec is not valid JSON. First bytes:\n\n${text.slice(0, 600)}`);
  }
}