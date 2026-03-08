import { createRoot, type Root } from 'react-dom/client';
import { App } from './App';
import { DEFAULT_CONFIG, type MiniDocsConfig } from './config';
import './index.css';

type MountTarget = string | HTMLElement;

const roots = new WeakMap<HTMLElement, Root>();

function resolveElement(target: MountTarget): HTMLElement {
  const element =
    typeof target === 'string'
      ? document.querySelector<HTMLElement>(target)
      : target;

  if (!element) {
    throw new Error('MiniDocs mount target not found');
  }

  return element;
}

function resolveConfig(config?: Partial<MiniDocsConfig>): MiniDocsConfig {
  return {
    ...DEFAULT_CONFIG,
    ...config,
  };
}

export function mount(
  target: MountTarget,
  config?: Partial<MiniDocsConfig>
): void {
  const element = resolveElement(target);

  let root = roots.get(element);
  if (!root) {
    root = createRoot(element);
    roots.set(element, root);
  }

  const resolvedConfig = resolveConfig(config);
  
  if (!resolvedConfig.specUrl) {
    throw new Error('MiniDocs: specUrl is required');
  }

  root.render(<App config={resolvedConfig} />);
}

export function unmount(target: MountTarget): void {
  const element = resolveElement(target);
  const root = roots.get(element);

  if (!root) return;

  root.unmount();
  roots.delete(element);
}

export const MiniDocs = {
  mount,
  unmount,
  defaults: DEFAULT_CONFIG,
};

declare global {
  interface Window {
    MiniDocs: typeof MiniDocs;
  }
}

window.MiniDocs = MiniDocs;