  export function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string): HTMLElementTagNameMap[K] {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }
  
  export function code(text: string): HTMLElement {
    const c = el('code');
    c.textContent = text;
    return c;
  }