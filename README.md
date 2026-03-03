### Quick start
- Clone
```bash
git clone https://github.com/dandidev/openapi-minidocs.git
```
- Run
```bash
npm run dev
```
- Build
```bash
npm run build
```
### Usage
```html
<div
  id="docs"
  data-title="Example API"
  data-spec="/openapi?format=json"
  data-group-by="tag"
  data-show-examples="true"></div>

<script src="https://cdn.jsdelivr.net/gh/dandidev/openapi-minidocs@v1.0.0/dist/minidocs.min.js"></script>
```