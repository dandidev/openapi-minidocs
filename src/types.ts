export type TypeNodeVisitor<R> = {
    visitPrimitive(node: PrimitiveTypeNode): R;
    visitArray(node: ArrayTypeNode): R;
    visitObject(node: ObjectTypeNode): R;
    visitMap(node: MapTypeNode): R;
    visitUnion(node: UnionTypeNode): R;
    visitUnknown(node: UnknownTypeNode): R;
  };
  
  export abstract class TypeNode {
    abstract label(): string;
    abstract accept<R>(v: TypeNodeVisitor<R>): R;
  }
  
  export class PrimitiveTypeNode extends TypeNode {
    constructor(public readonly type: string, public readonly format?: string) { super(); }
    label(): string { return this.format ? `${this.type} (${this.format})` : this.type; }
    accept<R>(v: TypeNodeVisitor<R>): R { return v.visitPrimitive(this); }
  }
  
  export class ArrayTypeNode extends TypeNode {
    constructor(public readonly item: TypeNode) { super(); }
    label(): string { return `array<${this.item.label()}>`; }
    accept<R>(v: TypeNodeVisitor<R>): R { return v.visitArray(this); }
  }
  
  export type Field = { name: string; type: TypeNode; required: boolean };
  
  export class ObjectTypeNode extends TypeNode {
    constructor(public readonly fields: Field[]) { super(); }
    label(): string { return 'object'; }
    accept<R>(v: TypeNodeVisitor<R>): R { return v.visitObject(this); }
  }
  
  export class MapTypeNode extends TypeNode {
    constructor(public readonly valueType: TypeNode) { super(); }
    label(): string { return `map<string, ${this.valueType.label()}>`; }
    accept<R>(v: TypeNodeVisitor<R>): R { return v.visitMap(this); }
  }
  
  export class UnionTypeNode extends TypeNode {
    constructor(public readonly variants: TypeNode[]) { super(); }
    label(): string { return 'union'; }
    accept<R>(v: TypeNodeVisitor<R>): R { return v.visitUnion(this); }
  }
  
  export class UnknownTypeNode extends TypeNode {
    constructor(private readonly why?: string) { super(); }
    label(): string { return this.why ? `unknown (${this.why})` : 'unknown'; }
    accept<R>(v: TypeNodeVisitor<R>): R { return v.visitUnknown(this); }
  }