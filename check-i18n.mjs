#!/usr/bin/env node
/**
 * i18n consistency gate.
 *
 * Scans every .tsx/.ts file for dictionary references and verifies each
 * key exists in BOTH en.json and ar.json. A missing key renders as
 * "undefined" to a visitor — exactly the bug that survives review.
 *
 * Also catches locale drift: keys defined in one locale but not the
 * other, which produces a half-translated page.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const en = JSON.parse(readFileSync(join(root, 'lib/i18n/en.json'), 'utf8'));
const ar = JSON.parse(readFileSync(join(root, 'lib/i18n/ar.json'), 'utf8'));

function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') out[key] = v;
    else if (v && typeof v === 'object') Object.assign(out, flatten(v, key));
  }
  return out;
}
const flatEn = flatten(en), flatAr = flatten(ar);

const files = [];
(function walk(d) {
  for (const e of readdirSync(d)) {
    if (e === 'node_modules' || e === '.next' || e === '.open-next') continue;
    const p = join(d, e);
    statSync(p).isDirectory() ? walk(p) : ['.tsx', '.ts'].includes(extname(p)) && files.push(p);
  }
})(root);

const TOP = 'brand|nav|home|course|service|announcements|articles|about|contact|refund|status|cta|seats|time|policy|footer|a11y|theme|locale|review';
const used = new Map();

for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const rel = f.replace(root + '/', '');
  for (const m of src.matchAll(/\bdict\.((?:[a-zA-Z_$][\w$]*)(?:\.[a-zA-Z_$][\w$]*)+)/g)) {
    const key = m[1];
    if (key.startsWith('flat')) continue;
    if (new RegExp(`^(${TOP})\\b`).test(key)) used.set(key, rel);
  }
  // Literal keys only. Template literals with ${...} are DYNAMIC and
  // cannot be resolved statically; enumerated explicitly below instead.
  for (const m of src.matchAll(/dict\.flat\[['"`]([^'"`\]]+)['"`]\]/g)) {
    if (m[1].includes('${')) continue;
    used.set(m[1], rel);
  }
}

let failed = 0;
console.log('\n  i18n consistency gate\n  ' + '-'.repeat(64));
console.log(`  ${Object.keys(flatEn).length} keys in en.json | ${Object.keys(flatAr).length} in ar.json`);
console.log(`  ${used.size} literal keys referenced across ${files.length} source files`);
console.log('  ' + '-'.repeat(64));

for (const [key, file] of [...used].sort()) {
  const inEn = key in flatEn, inAr = key in flatAr;
  if (!inEn || !inAr) {
    failed++;
    const missing = [!inEn && 'en', !inAr && 'ar'].filter(Boolean).join(' + ');
    console.log(`  FAIL ${key.padEnd(38)} missing in ${missing}   (${file})`);
  }
}

// DYNAMIC key spaces. RefundNote builds `policy.${kind}.${k}` and
// LiveStatus builds `status.${badge}` — no static scan can resolve
// those, so enumerate the full space rather than silently skipping it.
const DYNAMIC_SPACES = [
  { pattern: 'policy.<kind>.<key>', keys: [
      'policy.course.fullRefundBefore', 'policy.course.creditWithin',
      'policy.course.noneAfterStart', 'policy.course.weCancelFullRefund',
      'policy.booking.fullRefundNotice', 'policy.booking.lateBecomesCredit',
      'policy.booking.creditValidity', 'policy.booking.weCancelFullRefund',
      'policy.physical.noChangeOfMind', 'policy.physical.faultyReplaced' ] },
  { pattern: 'status.<badge>', keys: [
      'status.checking', 'status.announced', 'status.enrollment_open',
      'status.closing_soon', 'status.full', 'status.in_progress',
      'status.completed', 'status.archived', 'status.available',
      'status.limited', 'status.fully_booked', 'status.draft' ] },
  { pattern: 'cta.* / seats.* / time.*', keys: [
      'cta.viewDetails', 'cta.enrol', 'cta.joinWaitlist',
      'cta.registerInterest', 'cta.book', 'cta.enquire',
      'seats.fewLeft', 'time.d', 'time.h', 'time.m', 'time.closed' ] },
];
for (const space of DYNAMIC_SPACES) {
  for (const key of space.keys) {
    const inEn = key in flatEn, inAr = key in flatAr;
    if (!inEn || !inAr) {
      failed++;
      const missing = [!inEn && 'en', !inAr && 'ar'].filter(Boolean).join(' + ');
      console.log(`  FAIL ${key.padEnd(38)} missing in ${missing}   (${space.pattern})`);
    }
  }
}

const onlyEn = Object.keys(flatEn).filter((k) => !(k in flatAr));
const onlyAr = Object.keys(flatAr).filter((k) => !(k in flatEn));
for (const k of onlyEn) { failed++; console.log(`  FAIL ${k.padEnd(38)} in en.json but NOT ar.json`); }
for (const k of onlyAr) { failed++; console.log(`  FAIL ${k.padEnd(38)} in ar.json but NOT en.json`); }

for (const [k, v] of Object.entries(flatEn)) {
  if (!String(v).trim()) { failed++; console.log(`  FAIL ${k.padEnd(38)} empty in en.json`); }
}
for (const [k, v] of Object.entries(flatAr)) {
  if (!String(v).trim()) { failed++; console.log(`  FAIL ${k.padEnd(38)} empty in ar.json`); }
}

console.log('  ' + '-'.repeat(64));
if (failed) { console.error(`\n  ${failed} i18n problem(s). Build blocked.\n`); process.exit(1); }
const dynCount = DYNAMIC_SPACES.reduce((n, s) => n + s.keys.length, 0);
console.log(`  All ${used.size} literal keys resolve in both locales.`);
console.log(`  All ${dynCount} dynamic keys across ${DYNAMIC_SPACES.length} key spaces resolve.`);
console.log(`  en.json and ar.json have identical key sets.\n`);
