import 'anatomy.dart';

/// Predefined body part groups matching the web app configuration.
/// Simplified set of selectIds for the initial mobile implementation.
final Map<String, BodyPartGroup> bodyPartGroups = {
  'neck': const BodyPartGroup(
    id: 'neck',
    name: 'Neck',
    zoomId: 'muscular_system-muscles_of_head_and_neck_ID',
    selectIds: [
      'muscular_system-muscles_of_head_and_neck_ID',
      'muscular_system-platysma_ID',
      'connective_tissue-ligamentum_nuchae_ID',
    ],
    parts: [
      AnatomyPart(
        objectId: 'muscular_system-muscles_of_head_and_neck_ID',
        name: 'Muscles of head and neck',
      ),
      AnatomyPart(
        objectId: 'muscular_system-platysma_ID',
        name: 'Platysma',
      ),
    ],
  ),
  'chest': const BodyPartGroup(
    id: 'chest',
    name: 'Chest',
    zoomId: 'muscular_system-muscles_of_upper_limb_ID',
    selectIds: [
      'muscular_system-muscles_of_upper_limb_ID',
      'muscular_system-pectoral_muscles_ID',
    ],
    parts: [
      AnatomyPart(
        objectId: 'muscular_system-muscles_of_upper_limb_ID',
        name: 'Muscles of upper limb',
      ),
      AnatomyPart(
        objectId: 'muscular_system-pectoral_muscles_ID',
        name: 'Pectoral muscles',
      ),
    ],
  ),
  'abdomen': const BodyPartGroup(
    id: 'abdomen',
    name: 'Abdomen',
    zoomId: 'muscular_system-muscles_of_abdomen_ID',
    selectIds: [
      'muscular_system-muscles_of_abdomen_ID',
    ],
    parts: [
      AnatomyPart(
        objectId: 'muscular_system-muscles_of_abdomen_ID',
        name: 'Muscles of abdomen',
      ),
    ],
  ),
  'back': const BodyPartGroup(
    id: 'back',
    name: 'Upper & Middle Back',
    zoomId: 'muscular_system-muscles_of_back_ID',
    selectIds: [
      'muscular_system-muscles_of_back_ID',
    ],
    parts: [
      AnatomyPart(
        objectId: 'muscular_system-muscles_of_back_ID',
        name: 'Muscles of back',
      ),
    ],
  ),
  'glutes': const BodyPartGroup(
    id: 'glutes',
    name: 'Glutes',
    zoomId: 'muscular_system-muscles_of_lower_limb_ID',
    selectIds: [
      'muscular_system-muscles_of_lower_limb_ID',
    ],
    parts: [
      AnatomyPart(
        objectId: 'muscular_system-muscles_of_lower_limb_ID',
        name: 'Muscles of lower limb',
      ),
    ],
  ),
};
