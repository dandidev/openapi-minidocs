import { el, code } from './dom';
import {
  ArrayTypeNode, MapTypeNode, ObjectTypeNode, PrimitiveTypeNode,
  TypeNodeVisitor, UnionTypeNode, UnknownTypeNode
} from './types';

export class TypeDomVisitor implements TypeNodeVisitor<HTMLElement> {
  visitPrimitive(node: PrimitiveTypeNode): HTMLElement {
    const div = el('div');
    const ul = el('ul');
    const li = el('li');
    li.appendChild(code('value'));
    li.appendChild(document.createTextNode(': ' + node.label()));
    ul.appendChild(li);
    div.appendChild(ul);
    return div;
  }

  visitArray(node: ArrayTypeNode): HTMLElement {
    const div = el('div');
    const ul = el('ul');
    const li = el('li');
    li.appendChild(code('[]'));
    li.appendChild(document.createTextNode(': ' + node.label()));
    li.appendChild(node.item.accept(this));
    ul.appendChild(li);
    div.appendChild(ul);
    return div;
  }

  visitObject(node: ObjectTypeNode): HTMLElement {
    const div = el('div');
    const ul = el('ul');
    for (const f of node.fields) {
      const li = el('li');
      li.appendChild(code(f.name));
      li.appendChild(document.createTextNode(': ' + f.type.label() + (f.required ? ' (required)' : '')));
      if (!(f.type instanceof PrimitiveTypeNode)) li.appendChild(f.type.accept(this));
      ul.appendChild(li);
    }
    div.appendChild(ul);
    return div;
  }

  visitMap(node: MapTypeNode): HTMLElement {
    const div = el('div');
    const ul = el('ul');
    const li = el('li');
    li.appendChild(code('{key}'));
    li.appendChild(document.createTextNode(': ' + node.label()));
    li.appendChild(node.valueType.accept(this));
    ul.appendChild(li);
    div.appendChild(ul);
    return div;
  }

  visitUnion(node: UnionTypeNode): HTMLElement {
    const div = el('div');
    const ul = el('ul');
    const li = el('li');
    li.appendChild(code('variants'));
    li.appendChild(document.createTextNode(': union'));
    const inner = el('ul');
    for (const v of node.variants) {
      const it = el('li');
      it.appendChild(document.createTextNode(v.label()));
      it.appendChild(v.accept(this));
      inner.appendChild(it);
    }
    li.appendChild(inner);
    ul.appendChild(li);
    div.appendChild(ul);
    return div;
  }

  visitUnknown(node: UnknownTypeNode): HTMLElement {
    const div = el('div');
    const ul = el('ul');
    const li = el('li');
    li.appendChild(code('value'));
    li.appendChild(document.createTextNode(': ' + node.label()));
    ul.appendChild(li);
    div.appendChild(ul);
    return div;
  }
}