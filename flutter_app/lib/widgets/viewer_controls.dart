import 'package:flutter/material.dart';

import '../models/anatomy.dart';

/// Floating control buttons overlaid on the 3D viewer.
///
/// Provides: rotate 180°, reset scene, switch male/female model.
class ViewerControls extends StatelessWidget {
  const ViewerControls({
    super.key,
    required this.isReady,
    required this.isRotating,
    required this.isResetting,
    required this.needsReset,
    required this.currentGender,
    required this.onRotate,
    required this.onReset,
    required this.onSwitchModel,
  });

  final bool isReady;
  final bool isRotating;
  final bool isResetting;
  final bool needsReset;
  final Gender currentGender;
  final VoidCallback onRotate;
  final VoidCallback onReset;
  final VoidCallback onSwitchModel;

  @override
  Widget build(BuildContext context) {
    if (!isReady) return const SizedBox.shrink();

    return Positioned(
      right: 12,
      top: MediaQuery.of(context).padding.top + 12,
      child: Column(
        children: [
          _ControlButton(
            icon: Icons.rotate_right,
            tooltip: 'Rotate 180°',
            onTap: isRotating ? null : onRotate,
          ),
          const SizedBox(height: 8),
          _ControlButton(
            icon: Icons.restart_alt,
            tooltip: 'Reset',
            onTap: (needsReset && !isResetting) ? onReset : null,
          ),
          const SizedBox(height: 8),
          _ControlButton(
            icon: currentGender == Gender.male ? Icons.male : Icons.female,
            tooltip: 'Switch model',
            onTap: onSwitchModel,
          ),
        ],
      ),
    );
  }
}

class _ControlButton extends StatelessWidget {
  const _ControlButton({
    required this.icon,
    required this.tooltip,
    required this.onTap,
  });

  final IconData icon;
  final String tooltip;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final enabled = onTap != null;
    return Tooltip(
      message: tooltip,
      child: Material(
        color: Colors.black54,
        shape: const CircleBorder(),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(10),
            child: Icon(
              icon,
              color: enabled ? Colors.white : Colors.white38,
              size: 22,
            ),
          ),
        ),
      ),
    );
  }
}
