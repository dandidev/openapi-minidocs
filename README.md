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

- Build SPA app
```bash
npm run build
```

- Build single-file CDN bundle
```bash
npm run build:min
```

- Preview SPA build
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

```html
<div id="docs"></div>

<script src="https://cdn.jsdelivr.net/gh/dandidev/openapi-minidocs@v1.0.0/dist/minidocs.min.js"></script>
<script>
  MiniDocs.mount('#docs');
</script>
```