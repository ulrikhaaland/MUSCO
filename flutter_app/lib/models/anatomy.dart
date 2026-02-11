/// Gender for model selection.
enum Gender { male, female }

/// A selectable anatomy part from the 3D model.
class AnatomyPart {
  final String objectId;
  final String name;
  final String description;
  final bool available;
  final bool shown;
  final bool selected;
  final String? group;

  const AnatomyPart({
    required this.objectId,
    required this.name,
    this.description = '',
    this.available = true,
    this.shown = true,
    this.selected = false,
    this.group,
  });

  AnatomyPart copyWith({bool? selected}) {
    return AnatomyPart(
      objectId: objectId,
      name: name,
      description: description,
      available: available,
      shown: shown,
      selected: selected ?? this.selected,
      group: group,
    );
  }
}

/// A group of body parts that can be selected together.
class BodyPartGroup {
  final String id;
  final String name;
  final String zoomId;
  final List<String> selectIds;
  final List<String> deselectIds;
  final List<AnatomyPart> parts;

  const BodyPartGroup({
    required this.id,
    required this.name,
    required this.zoomId,
    required this.selectIds,
    this.deselectIds = const [],
    this.parts = const [],
  });
}
