export type MiniDocsConfig = {
    title: string;
    specUrl: string;
    groupBy: 'tag' | 'none';
    showExamples: boolean;
  };
  
  export function readConfig(hostId = 'docs'): { host: HTMLElement; config: MiniDocsConfig } {
    const host = document.getElementById(hostId);
    if (!host) throw new Error(`Missing #${hostId} element`);
  
    const title = host.getAttribute('data-title') || 'API';
    const specUrl = host.getAttribute('data-spec') || '/openapi?format=json';
    const groupBy = (host.getAttribute('data-group-by') || 'tag') as MiniDocsConfig['groupBy'];
    const showExamples = (host.getAttribute('data-show-examples') || 'true') !== 'false';
  
    return { host, config: { title, specUrl, groupBy, showExamples } };
  }