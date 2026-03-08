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

export function mount(
  target: MountTarget,
  config: MiniDocsConfig = DEFAULT_CONFIG
): void {
  const element = resolveElement(target);

  let root = roots.get(element);
  if (!root) {
    root = createRoot(element);
    roots.set(element, root);
  }

  root.render(<App config={config} />);
}

export function unmount(target: MountTarget): void {
  const element = resolveElement(target);
  const root = roots.get(element);

  if (!root) {
    return;
  }

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