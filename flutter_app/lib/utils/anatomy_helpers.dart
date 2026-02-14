// AUTO-GENERATED helper logic shared across web and Flutter.
// Run: node scripts/convert_body_parts.js

import '../config/body_part_groups.dart';
import '../models/body_part_group.dart';

String getNeutralId(String id) =>
    id.replaceAll(RegExp(r'human_19_(male|female)_'), '');

String getGenderedId(String id, String gender) {
  final neutralId = getNeutralId(id);
  return 'human_19_${gender}_$neutralId';
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
