import type { EndpointModel } from '../models';
import { TypeFactory } from '../type-factory';
import { ParameterList } from './ParameterList';
import { BodyView } from './BodyView';
import { ResponseList } from './ResponseList';

interface EndpointCardProps {
  endpoint: EndpointModel;
  showExamples: boolean;
  factory: TypeFactory;
}

export function EndpointCard({ endpoint, showExamples, factory }: EndpointCardProps) {
  return (
    <details className="ep">
      <summary className="ep-summary">
        <div className="ep-title">
          <span className="method">{endpoint.method}</span>
          <code>{endpoint.path}</code>
        </div>
        {endpoint.summary && <span className="ep-summary-text">{endpoint.summary}</span>}
      </summary>
      <div className="ep-body">
        {endpoint.parameters.length > 0 && (
          <>
            <h3>Parameters</h3>
            <ParameterList parameters={endpoint.parameters} showExamples={showExamples} factory={factory} />
          </>
        )}
        {endpoint.requestBody && (
          <>
            <h3>Request body</h3>
            <BodyView body={endpoint.requestBody} showExamples={showExamples} factory={factory} />
          </>
        )}
        <h3>Responses</h3>
        <ResponseList responses={endpoint.responses} showExamples={showExamples} factory={factory} />
      </div>
    </details>
  );
}
