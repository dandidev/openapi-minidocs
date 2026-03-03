export class RefResolver {
    constructor(private readonly spec: any) {}
  
    resolve(schema: any): any {
      if (!schema || typeof schema !== 'object') return schema;
  
      if (schema.$ref) {
        const path = schema.$ref.replace(/^#\//, '').split('/');
        let current: any = this.spec;
  
        for (const p of path) {
          current = current?.[p];
          if (!current) break;
        }
  
        return current ?? schema;
      }
  
      return schema;
    }
  }