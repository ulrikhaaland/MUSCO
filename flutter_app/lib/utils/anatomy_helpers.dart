import '../config/body_part_groups.dart';
import '../models/body_part_group.dart';

/// Strip gender prefix from a BioDigital object ID.
String getNeutralId(String id) =>
    id.replaceAll(RegExp(r'human_19_(male|female)_'), '');

/// Add gender prefix to a BioDigital object ID.
String getGenderedId(String id, String gender) {
  final neutralId = getNeutralId(id);
  return 'human_19_${gender}_$neutralId';
}

/// Check if two object IDs match, ignoring gender prefix.
bool idsMatch(String id1, String id2) => getNeutralId(id1) == getNeutralId(id2);

/// Find the [BodyPartGroup] that contains the given object ID.
BodyPartGroup? getPartGroup(String id) {
  final neutralId = getNeutralId(id);

  for (final group in bodyPartGroups.values) {
    final allGroupIds = [
      ...group.parts.map((p) => p.objectId),
      ...group.selectIds,
    ];
    if (allGroupIds.any((gid) => getNeutralId(gid) == neutralId)) {
      return group;
    }
  }
  return null;
}

/// Build a selection map from a list of neutral IDs + gender.
Map<String, bool> createSelectionMap(
  List<String> ids,
  String gender, {
  bool select = true,
}) {
  return {for (final id in ids) getGenderedId(id, gender): select};
}
