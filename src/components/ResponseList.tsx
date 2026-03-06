import type { ReactNode } from 'react';
import type { ResponseModel } from '../models';
import type { TypeNodeVisitor } from '../types';
import { TypeFactory } from '../type-factory';
import { TypeReactVisitor } from './TypeReactVisitor';
import { ExampleBlock } from './ExampleBlock';

interface ResponseListProps {
  responses: ResponseModel[];
  showExamples: boolean;
  factory: TypeFactory;
}

export function ResponseList({ responses, showExamples, factory }: ResponseListProps) {
  const visitor: TypeNodeVisitor<ReactNode> = new TypeReactVisitor();

  return (
    <div>
      {responses.map((r) => (
        <div key={r.status} className="resp">
          <div className="resp-head">
            <span className="badge">{r.status}</span>
            {r.contentType && <code>{r.contentType}</code>}
            {r.contentType && ' → '}
            {r.schema ? (
              <>
                <code>{factory.toTypeNode(r.schema as any).label()}</code>
              </>
            ) : (
              <code>no body</code>
            )}
          </div>
          {r.schema ? (factory.toTypeNode(r.schema as any).accept(visitor) as ReactNode) : null}
          {showExamples && r.example !== undefined && <ExampleBlock example={r.example} />}
        </div>
      ))}
    </div>
  );
}
