import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {bank} from '../lib/content.ts';

assert.equal(bank.length, 36, 'Preserve the original 36 two-part evidence items');
assert.equal(new Set(bank.map(q => q.id)).size, bank.length);
for (const q of bank) {
  assert.ok(q.answer >= 0 && q.answer < q.options.length, q.id);
  assert.ok(q.reason >= 0 && q.reason < q.reasons.length, q.id);
}
const root = new URL('../', import.meta.url);
for (const name of ['lib/content.ts', 'components/learnloom-app.tsx', 'components/lesson.tsx', 'components/support.tsx', 'public/fonts/fonts.css']) {
  const source = readFileSync(new URL(name, root), 'utf8');
  for (const match of source.matchAll(/\/(?:images|fonts)\/[\w.-]+\.(?:png|webp|ttf|woff2)/g)) {
    assert.ok(existsSync(fileURLToPath(new URL('public' + match[0], root))), match[0]);
  }
}
assert.ok(!readFileSync(new URL('components/molecule.tsx', root), 'utf8').includes("from 'three'"));
console.log('PASS: 36 original items, unique IDs, answer bounds, local assets, lazy 3D entry');
