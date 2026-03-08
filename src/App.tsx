import { useEffect, useState } from 'react';
import type { OpenAPIV3_1 } from 'openapi-types';
import { loadSpec } from './openapi';
import type { MiniDocsConfig } from './config';
import { DocsView } from './components/DocsView';

type AppProps = {
  config: MiniDocsConfig;
};

export function App({ config }: AppProps) {
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
    return <div>Loading OpenAPI spec...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!spec) {
    return null;
  }

  return (
    <DocsView
      spec={spec}
      groupBy={config.groupBy}
      showExamples={config.showExamples}
    />
  );
}