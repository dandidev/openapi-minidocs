import type { OpenAPIV3_1 } from 'openapi-types';
import { el, code } from './dom';
import { TypeFactory } from './type-factory';
import { TypeDomVisitor } from './type-dom-visitor';
import { RefResolver } from './ref-resolver';
import { OpenApiAdapter } from './openapi-adapter';
import type { EndpointModel, ParameterModel, ResponseModel, BodyModel } from './models';

export class DocsRenderer {
  private factory!: TypeFactory;
  private typeVisitor = new TypeDomVisitor();

  render(
    spec: OpenAPIV3_1.Document,
    opts: { groupBy: 'tag' | 'none'; showExamples: boolean }
  ): HTMLElement {
    // resolver + factory inicializálása
    const resolver = new RefResolver(spec);
    this.factory = new TypeFactory(resolver);

    const adapter = new OpenApiAdapter(resolver);
    const endpoints = adapter.parseEndpoints(spec);
    const grouped = adapter.group(endpoints, opts.groupBy);

    return renderDocsView(grouped, {
      showExamples: opts.showExamples,
      renderEndpoint: (ep) => this.renderEndpoint(ep, opts.showExamples),
    });
  }

  private renderEndpoint(ep: EndpointModel, showExamples: boolean): HTMLElement {
    const card = el('div', 'ep');

    card.appendChild(renderEndpointTitle(ep));

    if (ep.summary) {
      const s = el('div', 'muted');
      s.textContent = ep.summary;
      card.appendChild(s);
    }

    if (ep.parameters.length) {
      card.appendChild(h3('Parameters'));
      card.appendChild(this.renderParameters(ep.parameters, showExamples));
    }

    if (ep.requestBody) {
      card.appendChild(h3('Request body'));
      card.appendChild(this.renderBody(ep.requestBody, showExamples));
    }

    card.appendChild(h3('Responses'));
    card.appendChild(this.renderResponses(ep.responses, showExamples));

    return card;
  }

  private renderParameters(params: ParameterModel[], showExamples: boolean): HTMLElement {
    const ul = el('ul');

    for (const p of params) {
      const li = el('li');
      li.appendChild(code(p.name));

      const schema = p.schema ?? {};
      const tn = this.factory.toTypeNode(schema as any);

      li.appendChild(
        document.createTextNode(
          ` (${p.in}${p.required ? ', required' : ''}) → ${tn.label()}`
        )
      );

      if (p.default !== undefined) {
        li.appendChild(document.createTextNode(`, default: ${String(p.default)}`));
      }

      if (showExamples && p.example !== undefined) {
        li.appendChild(document.createTextNode(`, example: ${stringifyExampleInline(p.example)}`));
      }

      ul.appendChild(li);
    }

    return ul;
  }

  private renderBody(body: BodyModel, showExamples: boolean): HTMLElement {
    const box = el('div', 'resp');
    const head = el('div', 'resp-head');

    head.appendChild(code(body.contentType));
    head.appendChild(document.createTextNode(' → '));

    const tn = this.factory.toTypeNode(body.schema as any);
    head.appendChild(code(tn.label()));

    box.appendChild(head);
    box.appendChild(tn.accept(this.typeVisitor));

    if (showExamples && body.example !== undefined) {
      const exampleTitle = el('div', 'muted');
      exampleTitle.textContent = 'Example';
      box.appendChild(exampleTitle);
      box.appendChild(renderExampleBlock(body.example));
    }

    return box;
  }

  private renderResponses(responses: ResponseModel[], showExamples: boolean): HTMLElement {
    const wrap = el('div');

    for (const r of responses) {
      const box = el('div', 'resp');
      const head = el('div', 'resp-head');

      const badge = el('span', 'badge');
      badge.textContent = r.status;
      head.appendChild(badge);

      if (r.contentType) head.appendChild(code(r.contentType));
      head.appendChild(document.createTextNode(' → '));

      if (r.schema) {
        const tn = this.factory.toTypeNode(r.schema as any);
        head.appendChild(code(tn.label()));
        box.appendChild(head);
        box.appendChild(tn.accept(this.typeVisitor));
      } else {
        head.appendChild(code('no body'));
        box.appendChild(head);
      }

      if (showExamples && r.example !== undefined) {
        box.appendChild(renderExampleBlock(r.example));
      }

      wrap.appendChild(box);
    }

    return wrap;
  }
}

function renderDocsView(
  grouped: Map<string, EndpointModel[]>,
  opts: { showExamples: boolean; renderEndpoint: (ep: EndpointModel) => HTMLElement }
): HTMLElement {
  const root = el('div');

  // Use stable order for groups
  const groups = [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  for (const [tag, list] of groups) {
    const grp = el('div', 'grp');

    const h2 = el('h2');
    h2.textContent = tag;
    grp.appendChild(h2);

    const frag = document.createDocumentFragment();
    for (const ep of list) frag.appendChild(opts.renderEndpoint(ep));
    grp.appendChild(frag);

    root.appendChild(grp);
  }

  return root;
}

function renderEndpointTitle(ep: EndpointModel): HTMLElement {
  const title = el('div', 'ep-title');

  const m = el('span', 'method');
  m.textContent = ep.method;

  title.appendChild(m);
  title.appendChild(code(ep.path));

  return title;
}

function renderExampleBlock(example: unknown): HTMLElement {
  const wrap = el('div', 'code-wrap');
  const pre = el('pre');

  const txt =
    typeof example === 'string'
      ? example
      : JSON.stringify(example, null, 2);

  pre.textContent = txt;

  const copy = el('div', 'copy-icon');

  copy.innerHTML = `
    <svg fill="none" viewBox="0 0 24 24" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M8 16h8M8 12h8m-6 8h6a2 2 0 002-2V8l-6-6H6a2 2 0 00-2 2v14a2 2 0 002 2z"/>
    </svg>
  `;

  copy.onclick = async () => {
    await navigator.clipboard.writeText(txt);
    copy.classList.add('copied');
    setTimeout(() => copy.classList.remove('copied'), 1200);
  };

  wrap.appendChild(pre);
  wrap.appendChild(copy);

  return wrap;
}

function stringifyExampleInline(v: unknown): string {
  try {
    if (typeof v === 'string') return v.length > 60 ? JSON.stringify(v.slice(0, 57) + '...') : JSON.stringify(v);
    const txt = JSON.stringify(v);
    if (typeof txt === 'string') return txt.length > 80 ? txt.slice(0, 77) + '...' : txt;
    return String(v);
  } catch {
    return String(v);
  }
}

function h3(text: string): HTMLElement {
  const h = el('h3');
  h.textContent = text;
  return h;
}
