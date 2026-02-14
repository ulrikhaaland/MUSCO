const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const inputPath = path.join(projectRoot, 'shared/anatomy/body_part_groups.json');
const dartOutputPath = path.join(projectRoot, 'flutter_app/lib/config/body_part_groups.dart');
const tsOutputPath = path.join(projectRoot, 'shared/anatomy/body_part_groups.ts');
const viewerSharedInputPath = path.join(projectRoot, 'shared/anatomy/viewer_shared.json');
const viewerSharedTsOutputPath = path.join(projectRoot, 'shared/anatomy/viewer_shared.ts');
const viewerSharedDartOutputPath = path.join(projectRoot, 'flutter_app/lib/config/viewer_shared.dart');
const helperTsOutputPath = path.join(projectRoot, 'shared/anatomy/anatomy_helpers.ts');
const helperDartOutputPath = path.join(projectRoot, 'flutter_app/lib/utils/anatomy_helpers.dart');

function escapeDartString(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'");
}

function generateDart(groups) {
  const lines = [];
  lines.push('// AUTO-GENERATED from shared/anatomy/body_part_groups.json — do not edit by hand.');
  lines.push('// Run: node scripts/convert_body_parts.js');
  lines.push('');
  lines.push("import '../models/anatomy_part.dart';");
  lines.push("import '../models/body_part_group.dart';");
  lines.push('');
  lines.push('const Map<String, BodyPartGroup> bodyPartGroups = {');

  for (const [groupKey, group] of Object.entries(groups)) {
    lines.push(`  '${escapeDartString(groupKey)}': BodyPartGroup(`);
    lines.push(`    id: '${escapeDartString(group.id)}',`);
    lines.push(`    name: '${escapeDartString(group.name)}',`);
    lines.push(`    zoomId: '${escapeDartString(group.zoomId)}',`);

    lines.push('    selectIds: [');
    for (const id of group.selectIds || []) {
      lines.push(`      '${escapeDartString(id)}',`);
    }
    lines.push('    ],');

    lines.push('    deselectIds: [');
    for (const id of group.deselectIds || []) {
      lines.push(`      '${escapeDartString(id)}',`);
    }
    lines.push('    ],');

    lines.push('    keywords: [');
    for (const keyword of group.keywords || []) {
      lines.push(`      '${escapeDartString(keyword)}',`);
    }
    lines.push('    ],');

    lines.push('    parts: [');
    for (const part of group.parts || []) {
      lines.push(
        `      AnatomyPart(objectId: '${escapeDartString(part.objectId)}', name: '${escapeDartString(part.name)}'),`
      );
    }
    lines.push('    ],');
    lines.push('  ),');
  }

  lines.push('};');
  lines.push('');
  return lines.join('\n');
}

function generateTs(groups) {
  const json = JSON.stringify(groups, null, 2);
  return `// AUTO-GENERATED from shared/anatomy/body_part_groups.json — do not edit by hand.\n// Run: node scripts/convert_body_parts.js\n\nexport interface SharedAnatomyPart {\n  objectId: string;\n  name: string;\n}\n\nexport interface SharedBodyPartGroup {\n  id: string;\n  name: string;\n  zoomId: string;\n  keywords: string[];\n  selectIds: string[];\n  deselectIds: string[];\n  parts: SharedAnatomyPart[];\n}\n\nexport const bodyPartGroups: Record<string, SharedBodyPartGroup> = ${json};\n`;
}

function generateViewerSharedTs(viewerShared) {
  const modelIds = JSON.stringify(viewerShared.modelIds || {}, null, 2);
  const aliases = JSON.stringify(viewerShared.bodyGroupNameToConfig || {}, null, 2);

  return `// AUTO-GENERATED from shared/anatomy/viewer_shared.json — do not edit by hand.\n// Run: node scripts/convert_body_parts.js\n\nexport const modelIds = ${modelIds} as const;\n\nexport const bodyGroupNameToConfig = ${aliases} as const;\n`;
}

function generateViewerSharedDart(viewerShared) {
  const modelIds = viewerShared.modelIds || {};
  const aliases = viewerShared.bodyGroupNameToConfig || {};
  const lines = [];

  lines.push('// AUTO-GENERATED from shared/anatomy/viewer_shared.json — do not edit by hand.');
  lines.push('// Run: node scripts/convert_body_parts.js');
  lines.push('');
  lines.push('const Map<String, String> kViewerModelIds = {');
  for (const [key, value] of Object.entries(modelIds)) {
    lines.push(`  '${escapeDartString(key)}': '${escapeDartString(value)}',`);
  }
  lines.push('};');
  lines.push('');
  lines.push('const Map<String, String> kBodyGroupNameToConfig = {');
  for (const [key, value] of Object.entries(aliases)) {
    lines.push(`  '${escapeDartString(key)}': '${escapeDartString(value)}',`);
  }
  lines.push('};');
  lines.push('');

  return lines.join('\n');
}

function generateHelpersTs() {
  return `// AUTO-GENERATED helper logic shared across web and Flutter.
// Run: node scripts/convert_body_parts.js

import { bodyPartGroups } from './body_part_groups';

export type SharedGender = 'male' | 'female';

export function getNeutralId(id: string): string {
  return id.replace(/human_19_(male|female)_/, '');
}

export function getGenderedId(id: string, gender: SharedGender): string {
  const neutralId = getNeutralId(id);
  return \`human_19_\${gender}_\${neutralId}\`;
}

export function idsMatch(id1: string, id2: string): boolean {
  return getNeutralId(id1) === getNeutralId(id2);
}

export function findGroupKeyById(id: string): string | null {
  const neutralId = getNeutralId(id);
  for (const [groupKey, group] of Object.entries(bodyPartGroups)) {
    const allGroupIds = [...group.parts.map((part) => part.objectId), ...group.selectIds];
    if (allGroupIds.some((gid) => getNeutralId(gid) === neutralId)) {
      return groupKey;
    }
  }
  return null;
}

export function createSelectionMap(
  ids: string[],
  gender: SharedGender,
  select: boolean = true
): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const id of ids) {
    out[getGenderedId(id, gender)] = select;
  }
  return out;
}
`;
}

function generateHelpersDart() {
  return `// AUTO-GENERATED helper logic shared across web and Flutter.
// Run: node scripts/convert_body_parts.js

import '../config/body_part_groups.dart';
import '../models/body_part_group.dart';

String getNeutralId(String id) =>
    id.replaceAll(RegExp(r'human_19_(male|female)_'), '');

String getGenderedId(String id, String gender) {
  final neutralId = getNeutralId(id);
  return 'human_19_\${gender}_\$neutralId';
}

bool idsMatch(String id1, String id2) => getNeutralId(id1) == getNeutralId(id2);

String? getPartGroupKey(String id) {
  final neutralId = getNeutralId(id);

  for (final entry in bodyPartGroups.entries) {
    final group = entry.value;
    final allGroupIds = [
      ...group.parts.map((p) => p.objectId),
      ...group.selectIds,
    ];
    if (allGroupIds.any((gid) => getNeutralId(gid) == neutralId)) {
      return entry.key;
    }
  }

  return null;
}

BodyPartGroup? getPartGroup(String id) {
  final groupKey = getPartGroupKey(id);
  if (groupKey == null) return null;
  return bodyPartGroups[groupKey];
}

Map<String, bool> createSelectionMap(
  List<String> ids,
  String gender, {
  bool select = true,
}) {
  return {for (final id in ids) getGenderedId(id, gender): select};
}
`;
}

function main() {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Missing ${path.relative(projectRoot, inputPath)}. Ensure shared/anatomy/body_part_groups.json exists.`);
  }
  if (!fs.existsSync(viewerSharedInputPath)) {
    throw new Error(`Missing ${path.relative(projectRoot, viewerSharedInputPath)}.`);
  }

  const groups = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const viewerShared = JSON.parse(fs.readFileSync(viewerSharedInputPath, 'utf8'));

  fs.writeFileSync(dartOutputPath, generateDart(groups));
  fs.writeFileSync(tsOutputPath, generateTs(groups));
  fs.writeFileSync(viewerSharedTsOutputPath, generateViewerSharedTs(viewerShared));
  fs.writeFileSync(viewerSharedDartOutputPath, generateViewerSharedDart(viewerShared));
  fs.writeFileSync(helperTsOutputPath, generateHelpersTs());
  fs.writeFileSync(helperDartOutputPath, generateHelpersDart());

  console.log(`Generated ${path.relative(projectRoot, dartOutputPath)}`);
  console.log(`Generated ${path.relative(projectRoot, tsOutputPath)}`);
  console.log(`Generated ${path.relative(projectRoot, viewerSharedTsOutputPath)}`);
  console.log(`Generated ${path.relative(projectRoot, viewerSharedDartOutputPath)}`);
  console.log(`Generated ${path.relative(projectRoot, helperTsOutputPath)}`);
  console.log(`Generated ${path.relative(projectRoot, helperDartOutputPath)}`);
}

main();
