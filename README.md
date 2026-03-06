### Quick start

- Clone
```bash
git clone https://github.com/dandidev/openapi-minidocs.git
```

- Install dependencies
```bash
npm install
```

- Run development server
```bash
npm run dev
```

- Build for production
```bash
npm run build
```

- Preview production build
```bash
npm run preview
```

### Development

- Lint code
```bash
npm run lint
```

- Fix linting issues automatically
```bash
npm run lint:fix
```

- Format code
```bash
npm run format
```

- Check code formatting
```bash
npm run format:check
```

### Usage

This is a React + TypeScript application that renders OpenAPI documentation. The app loads an OpenAPI specification from a URL and displays it in a structured, interactive format.

To customize the configuration, edit the `DEFAULT_CONFIG` in `src/config.ts` or modify `src/App.tsx` to accept configuration via props or environment variables.