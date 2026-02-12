import 'anatomy_part.dart';

/// A group of related anatomical parts (e.g., "Neck", "Chest").
class BodyPartGroup {
  final String id;
  final String name;
  final List<AnatomyPart> parts;
  final List<String> keywords;
  final List<String> selectIds;
  final List<String> deselectIds;
  final String zoomId;

  const BodyPartGroup({
    required this.id,
    required this.name,
    required this.parts,
    this.keywords = const [],
    this.selectIds = const [],
    this.deselectIds = const [],
    this.zoomId = '',
  });
}
