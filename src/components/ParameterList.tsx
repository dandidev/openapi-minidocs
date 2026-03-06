import type { ParameterModel } from '../models';
import { TypeFactory } from '../type-factory';

interface ParameterListProps {
  parameters: ParameterModel[];
  showExamples: boolean;
  factory: TypeFactory;
}

function stringifyExampleInline(v: unknown): string {
  try {
    if (typeof v === 'string') {
      return v.length > 60 ? JSON.stringify(v.slice(0, 57) + '...') : JSON.stringify(v);
    }
    const txt = JSON.stringify(v);
    if (typeof txt === 'string') {
      return txt.length > 80 ? txt.slice(0, 77) + '...' : txt;
    }
    return String(v);
  } catch {
    return String(v);
  }
}

export function ParameterList({ parameters, showExamples, factory }: ParameterListProps) {
  return (
    <ul>
      {parameters.map((p) => {
        const schema = p.schema ?? {};
        const tn = factory.toTypeNode(schema as any);

        return (
          <li key={p.name}>
            <code>{p.name}</code>
            {` (${p.in}${p.required ? ', required' : ''}) → ${tn.label()}`}
            {p.default !== undefined && `, default: ${String(p.default)}`}
            {showExamples && p.example !== undefined && `, example: ${stringifyExampleInline(p.example)}`}
          </li>
        );
      })}
    </ul>
  );
}
