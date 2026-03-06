export type MiniDocsConfig = {
  title: string;
  specUrl: string;
  groupBy: 'tag' | 'none';
  showExamples: boolean;
};

export const DEFAULT_CONFIG: MiniDocsConfig = {
  title: 'Demo API',
  specUrl: './sample-openapi-01.json',
  groupBy: 'tag',
  showExamples: true,
};