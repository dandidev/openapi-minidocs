import { useEffect, useState } from 'react';
import type { OpenAPIV3_1 } from 'openapi-types';
import { loadSpec } from './openapi';
import { DEFAULT_CONFIG, type MiniDocsConfig } from './config';
import { DocsView } from './components/DocsView';

export function App() {
  const [config] = useState<MiniDocsConfig>(DEFAULT_CONFIG);
  const [spec, setSpec] = useState<OpenAPIV3_1.Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const loadedSpec = await loadSpec(config.specUrl);
        if (!cancelled) {
          setSpec(loadedSpec);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [config.specUrl]);

  if (loading) {
    return (
      <div>
        <header>{config.title}</header>
        <main>
          <div className="muted">Loading OpenAPI spec...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <header>{config.title}</header>
        <main>
          <pre className="err">{error}</pre>
        </main>
      </div>
    );
  }

  if (!spec) {
    return null;
  }

  return (
    <div>
      <header>{config.title}</header>
      <main>
        <div className="muted">OpenAPI: {config.specUrl}</div>
        <DocsView spec={spec} groupBy={config.groupBy} showExamples={config.showExamples} />
      </main>
    </div>
  );
}
