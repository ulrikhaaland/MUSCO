/// A single anatomical part in the BioDigital model.
class AnatomyPart {
  final String objectId;
  final String name;
  final String description;
  final bool available;
  final bool shown;
  final bool selected;
  final String parent;
  final List<String> children;
  final String? group;

  const AnatomyPart({
    required this.objectId,
    required this.name,
    this.description = '',
    this.available = true,
    this.shown = true,
    this.selected = false,
    this.parent = '',
    this.children = const [],
    this.group,
  });
}
