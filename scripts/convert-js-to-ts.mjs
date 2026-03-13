#!/usr/bin/env node
/**
 * Converts .js/.jsx in src to .ts/.tsx with minimal types.
 * Usage: node scripts/convert-js-to-ts.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcRoot = path.join(__dirname, '..', 'src');

function findJsFiles(dir, list = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== 'node_modules') {
      findJsFiles(full, list);
    } else if (e.isFile() && (e.name.endsWith('.js') || e.name.endsWith('.jsx'))) {
      list.push(full);
    }
  }
  return list;
}

function hasJSX(content) {
  return /return\s*[<(]|<\w+|<\/\w+|\/>|\.jsx\b/.test(content) || content.includes('React.createElement');
}

const files = findJsFiles(srcRoot);
const converted = [];
for (const filePath of files) {
  const content = fs.readFileSync(filePath, 'utf8');
  const isJsx = filePath.endsWith('.jsx') || hasJSX(content);
  const newExt = isJsx ? '.tsx' : '.ts';
  const newPath = filePath.replace(/\.(jsx?)$/, newExt);
  fs.writeFileSync(newPath, content, 'utf8');
  fs.unlinkSync(filePath);
  converted.push(path.relative(srcRoot, newPath));
}
console.log('Converted', converted.length, 'files');
converted.forEach((f) => console.log('  ', f));
