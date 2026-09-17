#!/usr/bin/env node
/** CI contrast gate. Fails the build if any functional pair drops below WCAG AA. */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSS = readFileSync(join(__dirname, '..', 'styles', 'tokens.css'), 'utf8');

const toLin = (c) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const lum = (hex) => { const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b); };
const ratio = (a, b) => { const [la, lb] = [lum(a), lum(b)];
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]; return (hi + 0.05) / (lo + 0.05); };

function block(sel) {
  const m = CSS.match(new RegExp(`${sel}\\s*\\{([\\s\\S]*?)\\n\\}`, 'm'));
  if (!m) throw new Error(`Block not found: ${sel}`);
  return m[1];
}
function tok(blk, name) {
  const m = blk.match(new RegExp(`--${name}\\s*:\\s*(#[0-9A-Fa-f]{6})`));
  if (!m) throw new Error(`Token --${name} not found`);
  return m[1];
}

const light = block(':root');
const dark = block("\\[data-theme='dark'\\]");

const CHECKS = [
  ['light fg on bg', tok(light,'fg'), tok(light,'bg'), 4.5],
  ['light fg-muted on bg', tok(light,'fg-muted'), tok(light,'bg'), 4.5],
  ['light fn-copper on bg', tok(light,'fn-copper'), tok(light,'bg'), 4.5],
  ['light fn-teal on bg', tok(light,'fn-teal'), tok(light,'bg'), 4.5],
  ['light fn-grey on bg', tok(light,'fn-grey'), tok(light,'bg'), 4.5],
  ['light fn-rose on bg', tok(light,'fn-rose'), tok(light,'bg'), 4.5],
  ['light fn-success on bg', tok(light,'fn-success'), tok(light,'bg'), 4.5],
  ['light fn-copper on surface', tok(light,'fn-copper'), tok(light,'surface'), 4.5],
  ['light on-copper ON copper', tok(light,'on-copper'), tok(light,'fn-copper'), 4.5],
  ['light on-teal ON teal', tok(light,'on-teal'), tok(light,'fn-teal'), 4.5],
  ['light focus-ring on bg', tok(light,'focus-ring'), tok(light,'bg'), 3.0],
  ['dark fg on bg', tok(dark,'fg'), tok(dark,'bg'), 4.5],
  ['dark fg-muted on bg', tok(dark,'fg-muted'), tok(dark,'bg'), 4.5],
  ['dark fn-copper on bg', tok(dark,'fn-copper'), tok(dark,'bg'), 4.5],
  ['dark fn-teal on bg', tok(dark,'fn-teal'), tok(dark,'bg'), 4.5],
  ['dark fn-grey on bg', tok(dark,'fn-grey'), tok(dark,'bg'), 4.5],
  ['dark fn-rose on bg', tok(dark,'fn-rose'), tok(dark,'bg'), 4.5],
  ['dark fn-success on bg', tok(dark,'fn-success'), tok(dark,'bg'), 4.5],
  ['dark fn-copper on surface', tok(dark,'fn-copper'), tok(dark,'surface'), 4.5],
  ['dark fn-teal on surface', tok(dark,'fn-teal'), tok(dark,'surface'), 4.5],
  ['dark on-copper ON copper', tok(dark,'on-copper'), tok(dark,'fn-copper'), 4.5],
  ['dark on-teal ON teal', tok(dark,'on-teal'), tok(dark,'fn-teal'), 4.5],
  ['dark focus-ring on bg', tok(dark,'focus-ring'), tok(dark,'bg'), 3.0],
];

// Decorative tokens MUST fail: if one starts passing, someone has
// quietly repurposed it as a functional colour.
const DECOR = [
  ['decor-copper on light bg', tok(light,'decor-copper'), tok(light,'bg')],
  ['decor-teal on dark bg', tok(dark,'decor-teal'), tok(dark,'bg')],
];

let failed = 0;
console.log('\n  WCAG contrast gate\n  ' + '-'.repeat(58));
for (const [label, fg, bg, min] of CHECKS) {
  const r = ratio(fg, bg); const ok = r >= min; if (!ok) failed++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${label.padEnd(28)} ${fg} ${r.toFixed(2).padStart(6)}:1 (min ${min})`);
}
console.log('  ' + '-'.repeat(58));
for (const [label, fg, bg] of DECOR) {
  const r = ratio(fg, bg);
  if (r >= 3.0) { failed++; console.log(`  FAIL ${label} now passes 3:1 - promote to --fn-* or keep decorative.`); }
  else console.log(`  ---- ${label.padEnd(28)} ${fg} ${r.toFixed(2).padStart(6)}:1 decorative OK`);
}
console.log('  ' + '-'.repeat(58));
if (failed) { console.error(`\n  ${failed} contrast check(s) failed. Build blocked.\n`); process.exit(1); }
console.log(`\n  All ${CHECKS.length} functional pairs meet WCAG AA.\n`);
