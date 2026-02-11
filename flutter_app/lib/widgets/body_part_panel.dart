import 'package:flutter/material.dart';

import '../models/anatomy.dart';

/// Bottom sheet panel displaying the selected body part/group info.
///
/// Shows the group name and, when a specific part is selected, shows
/// the part name with a brief description placeholder.
class BodyPartPanel extends StatelessWidget {
  const BodyPartPanel({
    super.key,
    required this.selectedGroup,
    this.selectedPart,
    this.onClose,
  });

  final BodyPartGroup? selectedGroup;
  final AnatomyPart? selectedPart;
  final VoidCallback? onClose;

  @override
  Widget build(BuildContext context) {
    final group = selectedGroup;
    if (group == null) return const SizedBox.shrink();

    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        color: Color(0xFF1A1A2E),
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Drag handle
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Header row
            Row(
              children: [
                Expanded(
                  child: Text(
                    selectedPart?.name ?? group.name,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                IconButton(
                  onPressed: onClose,
                  icon: const Icon(Icons.close, color: Colors.white54),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),

            if (selectedPart != null) ...[
              const SizedBox(height: 4),
              Text(
                'Part of ${group.name}',
                style: const TextStyle(color: Colors.white54, fontSize: 14),
              ),
            ],

            const SizedBox(height: 16),

            // Placeholder for future chat / exercise integration
            Text(
              'Tap a muscle on the model to explore, or select a body group below.',
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.7),
                fontSize: 14,
                height: 1.4,
              ),
            ),

            const SizedBox(height: 16),

            // Body group quick-select chips
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                'Neck',
                'Chest',
                'Abdomen',
                'Upper & Middle Back',
                'Glutes',
              ].map((name) {
                final isActive = group.name == name;
                return ChoiceChip(
                  label: Text(name),
                  selected: isActive,
                  onSelected: (_) {
                    // Selection handled via onGroupSelected callback in the screen.
                  },
                  selectedColor: const Color(0xFF6366F1),
                  backgroundColor: const Color(0xFF2D2D44),
                  labelStyle: TextStyle(
                    color: isActive ? Colors.white : Colors.white70,
                    fontSize: 13,
                  ),
                  side: BorderSide.none,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }
}
