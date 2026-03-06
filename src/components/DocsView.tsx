import type { OpenAPIV3_1 } from 'openapi-types';
import { RefResolver } from '../ref-resolver';
import { OpenApiAdapter } from '../openapi-adapter';
import { EndpointCard } from './EndpointCard';
import { TypeFactory } from '../type-factory';

interface DocsViewProps {
  spec: OpenAPIV3_1.Document;
  groupBy: 'tag' | 'none';
  showExamples: boolean;
}

export function DocsView({ spec, groupBy, showExamples }: DocsViewProps) {
  const resolver = new RefResolver(spec);
  const factory = new TypeFactory(resolver);
  const adapter = new OpenApiAdapter(resolver);
  const endpoints = adapter.parseEndpoints(spec);
  const grouped = adapter.group(endpoints, groupBy);

  const groups = [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div>
      {groups.map(([tag, list]) => (
        <div key={tag} className="grp">
          <h2>{tag}</h2>
          {list.map((ep) => (
            <EndpointCard
              key={`${ep.method}-${ep.path}`}
              endpoint={ep}
              showExamples={showExamples}
              factory={factory}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
