import { readConfig } from './config';
import { injectBaseStyle } from './style';
import { loadSpec } from './openapi';
import { DocsRenderer } from './renderer';
import { el } from './dom';

async function main() {
  const { config } = readConfig('docs');

  const mainEl = injectBaseStyle(config.title);

  const status = el('div', 'muted');
  status.textContent = `OpenAPI: ${config.specUrl}`;
  mainEl.appendChild(status);

  const spec = await loadSpec(config.specUrl);

  const renderer = new DocsRenderer();
  const view = renderer.render(spec, { groupBy: config.groupBy, showExamples: config.showExamples });
  mainEl.appendChild(view);
}

main().catch(err => {
  const pre = document.createElement('pre');
  pre.className = 'err';
  pre.textContent = String((err as any)?.message || err);
  document.body.appendChild(pre);
});