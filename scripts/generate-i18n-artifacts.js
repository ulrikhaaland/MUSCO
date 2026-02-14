const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const sharedLocalesDir = path.join(projectRoot, 'shared', 'i18n', 'locales');
const webSourceEnTs = path.join(
  projectRoot,
  'src',
  'app',
  'i18n',
  'translations',
  'en.ts'
);
const webSourceNbTs = path.join(
  projectRoot,
  'src',
  'app',
  'i18n',
  'translations',
  'nb.ts'
);
const sharedEnJson = path.join(sharedLocalesDir, 'en.json');
const sharedNbJson = path.join(sharedLocalesDir, 'nb.json');

const webGeneratedPath = path.join(
  projectRoot,
  'src',
  'app',
  'i18n',
  'generated',
  'translations.ts'
);
const flutterEnJson = path.join(
  projectRoot,
  'flutter_app',
  'assets',
  'i18n',
  'en.json'
);
const flutterNbJson = path.join(
  projectRoot,
  'flutter_app',
  'assets',
  'i18n',
  'nb.json'
);

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function parseWebTranslationTs(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const match = source.match(
    /const translations\s*=\s*({[\s\S]*?})\s*;\s*export default translations;/
  );
  if (!match) {
    throw new Error(`Could not parse translations object from ${filePath}`);
  }

  const parsed = Function(`"use strict"; return (${match[1]});`)();
  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Parsed invalid translations object from ${filePath}`);
  }
  return parsed;
}

function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function extractPlaceholders(value) {
  const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
  const placeholders = new Set();
  let match;
  while ((match = regex.exec(value)) !== null) {
    placeholders.add(match[1]);
  }
  return [...placeholders].sort();
}

function normalizeAndValidate(enMap, nbMap) {
  const enKeys = Object.keys(enMap).sort();
  const nbKeys = Object.keys(nbMap).sort();
  const enSet = new Set(enKeys);
  const nbSet = new Set(nbKeys);

  const missingInNb = enKeys.filter((key) => !nbSet.has(key));
  const missingInEn = nbKeys.filter((key) => !enSet.has(key));

  if (missingInNb.length || missingInEn.length) {
    const preview = (list) => list.slice(0, 10).join(', ');
    console.warn(
      [
        'Warning: locale key mismatch detected. Missing values will be filled from the other locale.',
        missingInNb.length
          ? `Missing in nb (${missingInNb.length}): ${preview(missingInNb)}`
          : null,
        missingInEn.length
          ? `Missing in en (${missingInEn.length}): ${preview(missingInEn)}`
          : null,
      ]
        .filter(Boolean)
        .join('\n')
    );
  }

  const allKeys = [...new Set([...enKeys, ...nbKeys])].sort();
  const normalizedEn = {};
  const normalizedNb = {};
  for (const key of allKeys) {
    normalizedEn[key] =
      enMap[key] ?? nbMap[key] ?? key;
    normalizedNb[key] =
      nbMap[key] ?? enMap[key] ?? key;
  }

  const placeholderMismatches = [];
  for (const key of allKeys) {
    const enVal = String(normalizedEn[key] ?? '');
    const nbVal = String(normalizedNb[key] ?? '');
    const enPlaceholders = extractPlaceholders(enVal);
    const nbPlaceholders = extractPlaceholders(nbVal);
    if (enPlaceholders.join('|') !== nbPlaceholders.join('|')) {
      placeholderMismatches.push({
        key,
        en: enPlaceholders.join(', ') || '(none)',
        nb: nbPlaceholders.join(', ') || '(none)',
      });
    }
  }

  if (placeholderMismatches.length) {
    const preview = placeholderMismatches
      .slice(0, 10)
      .map((m) => `${m.key} => en:[${m.en}] nb:[${m.nb}]`)
      .join('\n');
    console.warn(
      `Placeholder mismatch detected (${placeholderMismatches.length}).\n${preview}`
    );
  }

  return { normalizedEn, normalizedNb };
}

function writeWebGeneratedFile(enMap, nbMap) {
  ensureDir(path.dirname(webGeneratedPath));
  const content = `// AUTO-GENERATED from shared/i18n/locales/*.json - do not edit by hand.
// Run: node scripts/generate-i18n-artifacts.js

export const generatedTranslations = ${JSON.stringify(
    { en: enMap, nb: nbMap },
    null,
    2
  )} as const;

export type GeneratedLocale = keyof typeof generatedTranslations;
`;
  fs.writeFileSync(webGeneratedPath, `${content}\n`);
}

function bootstrapSharedFromWebIfMissing() {
  if (fs.existsSync(sharedEnJson) && fs.existsSync(sharedNbJson)) {
    return false;
  }

  const enMap = parseWebTranslationTs(webSourceEnTs);
  const nbMap = parseWebTranslationTs(webSourceNbTs);
  writeJson(sharedEnJson, enMap);
  writeJson(sharedNbJson, nbMap);
  return true;
}

function main() {
  const didBootstrap = bootstrapSharedFromWebIfMissing();

  const enMap = readJson(sharedEnJson);
  const nbMap = readJson(sharedNbJson);
  const { normalizedEn, normalizedNb } = normalizeAndValidate(enMap, nbMap);

  writeJson(sharedEnJson, normalizedEn);
  writeJson(sharedNbJson, normalizedNb);
  writeWebGeneratedFile(normalizedEn, normalizedNb);
  writeJson(flutterEnJson, normalizedEn);
  writeJson(flutterNbJson, normalizedNb);

  if (didBootstrap) {
    console.log('Bootstrapped shared locales from web translation TS files.');
  }
  console.log(
    `Validated i18n (${Object.keys(normalizedEn).length} keys, locales: en, nb).`
  );
  console.log(
    `Generated ${path.relative(projectRoot, webGeneratedPath)} and Flutter locale assets.`
  );
}

main();
