import type { BodyModel } from '../models';
import { TypeFactory } from '../type-factory';
import { TypeReactVisitor } from './TypeReactVisitor';
import { ExampleBlock } from './ExampleBlock';

interface BodyViewProps {
  body: BodyModel;
  showExamples: boolean;
  factory: TypeFactory;
}

export function BodyView({ body, showExamples, factory }: BodyViewProps) {
  const tn = factory.toTypeNode(body.schema as any);
  const visitor = new TypeReactVisitor();

  return (
    <div className="resp">
      <div className="resp-head">
        <code>{body.contentType}</code> → <code>{tn.label()}</code>
      </div>
      {tn.accept(visitor)}
      {showExamples && body.example !== undefined && (
        <>
          <div className="muted">Example</div>
          <ExampleBlock example={body.example} />
        </>
      )}
    </div>
  );
}
