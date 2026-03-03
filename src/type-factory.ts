import {
    ArrayTypeNode, MapTypeNode, ObjectTypeNode, PrimitiveTypeNode,
    TypeNode, UnionTypeNode, UnknownTypeNode
  } from './types';
  import { RefResolver } from './ref-resolver';
  
  export class TypeFactory {
  
    constructor(private readonly resolver: RefResolver) {}
  
    toTypeNode(schema: any, seen = new Set<any>()): TypeNode {
      if (!schema) return new UnknownTypeNode('null schema');
  
      schema = this.resolver.resolve(schema);
  
      if (typeof schema === 'object') {
        if (seen.has(schema)) return new UnknownTypeNode('recursive');
        seen.add(schema);
      }
  
      if (schema.oneOf || schema.anyOf) {
        const arr = (schema.oneOf || schema.anyOf) as any[];
        return new UnionTypeNode(arr.map(s => this.toTypeNode(s, new Set(seen))));
      }
  
      if (schema.type === 'array') {
        return new ArrayTypeNode(this.toTypeNode(schema.items, new Set(seen)));
      }
  
      if (schema.type === 'object' && schema.additionalProperties && !schema.properties) {
        const ap = schema.additionalProperties === true ? {} : schema.additionalProperties;
        const value =
          ap && Object.keys(ap).length ? this.toTypeNode(ap, new Set(seen)) : new UnknownTypeNode('any');
        return new MapTypeNode(value);
      }
  
      if ((schema.type === 'object' || !schema.type) && schema.properties) {
        const required = new Set<string>(schema.required || []);
        const fields = Object.entries(schema.properties).map(([name, prop]) => ({
          name,
          required: required.has(name),
          type: this.toTypeNode(prop, new Set(seen))
        }));
        return new ObjectTypeNode(fields);
      }
  
      if (schema.type) {
        return new PrimitiveTypeNode(String(schema.type), schema.format ? String(schema.format) : undefined);
      }
  
      return new UnknownTypeNode('unhandled schema');
    }
  }