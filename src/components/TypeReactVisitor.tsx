import {
  ArrayTypeNode,
  MapTypeNode,
  ObjectTypeNode,
  PrimitiveTypeNode,
  TypeNodeVisitor,
  UnionTypeNode,
  UnknownTypeNode,
} from '../types';

export class TypeReactVisitor implements TypeNodeVisitor<JSX.Element> {
  visitPrimitive(node: PrimitiveTypeNode): JSX.Element {
    return (
      <div>
        <ul>
          <li>
            <code>value</code>: {node.label()}
          </li>
        </ul>
      </div>
    );
  }

  visitArray(node: ArrayTypeNode): JSX.Element {
    return (
      <div>
        <ul>
          <li>
            <code>[]</code>: {node.label()}
            {node.item.accept(this)}
          </li>
        </ul>
      </div>
    );
  }

  visitObject(node: ObjectTypeNode): JSX.Element {
    return (
      <div>
        <ul>
          {node.fields.map((f) => (
            <li key={f.name}>
              <code>{f.name}</code>: {f.type.label()}
              {f.required ? ' (required)' : ''}
              {!(f.type instanceof PrimitiveTypeNode) && f.type.accept(this)}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  visitMap(node: MapTypeNode): JSX.Element {
    return (
      <div>
        <ul>
          <li>
            <code>{'{key}'}</code>: {node.label()}
            {node.valueType.accept(this)}
          </li>
        </ul>
      </div>
    );
  }

  visitUnion(node: UnionTypeNode): JSX.Element {
    return (
      <div>
        <ul>
          <li>
            <code>variants</code>: union
            <ul>
              {node.variants.map((v, idx) => (
                <li key={idx}>
                  {v.label()}
                  {v.accept(this)}
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </div>
    );
  }

  visitUnknown(node: UnknownTypeNode): JSX.Element {
    return (
      <div>
        <ul>
          <li>
            <code>value</code>: {node.label()}
          </li>
        </ul>
      </div>
    );
  }
}
