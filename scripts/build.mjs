import { existsSync } from 'node:fs';
for (const file of ['dist/index.html','dist/app.js','dist/style.css']) if (!existsSync(file)) throw new Error(`Missing ${file}`);
console.log('Static files ready in dist; no dependencies or GitHub Actions required.');
