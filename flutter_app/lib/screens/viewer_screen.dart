import 'package:flutter/material.dart';

import '../models/anatomy.dart';
import '../models/body_part_groups.dart';
import '../widgets/body_part_panel.dart';
import '../widgets/human_viewer.dart';
import '../widgets/viewer_controls.dart';

/// Main screen: 3D anatomy viewer with controls and selection panel.
///
/// Orchestrates the same flow as `HumanViewer.tsx` + `useHumanAPI.ts`:
/// load model → listen for object selection → highlight group → zoom.
class ViewerScreen extends StatefulWidget {
  const ViewerScreen({super.key});

  @override
  State<ViewerScreen> createState() => _ViewerScreenState();
}

class _ViewerScreenState extends State<ViewerScreen>
    with SingleTickerProviderStateMixin {
  final _viewerKey = GlobalKey<HumanViewerWidgetState>();

  Gender _gender = Gender.male;
  bool _isReady = false;
  bool _isRotating = false;
  bool _isResetting = false;
  bool _needsReset = false;

  BodyPartGroup? _selectedGroup;
  AnatomyPart? _selectedPart;

  // ── lifecycle ──

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // 3D Viewer (full screen)
          Positioned.fill(
            child: HumanViewerWidget(
              key: _viewerKey,
              gender: _gender,
              onReady: _onViewerReady,
              onObjectSelected: _onObjectSelected,
              onCameraUpdated: _onCameraUpdated,
            ),
          ),

          // Floating controls (top-right)
          ViewerControls(
            isReady: _isReady,
            isRotating: _isRotating,
            isResetting: _isResetting,
            needsReset: _needsReset,
            currentGender: _gender,
            onRotate: _handleRotate,
            onReset: _handleReset,
            onSwitchModel: _handleSwitchModel,
          ),

          // Bottom panel (selected body part info)
          if (_selectedGroup != null)
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: BodyPartPanel(
                selectedGroup: _selectedGroup,
                selectedPart: _selectedPart,
                onClose: _clearSelection,
              ),
            ),

          // Instruction hint when nothing selected
          if (_isReady && _selectedGroup == null)
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: _buildHintBar(),
            ),
        ],
      ),
    );
  }

  // ── callbacks ──

  void _onViewerReady() {
    setState(() => _isReady = true);
  }

  void _onCameraUpdated() {
    if (!_isResetting && mounted) {
      setState(() => _needsReset = true);
    }
  }

  void _onObjectSelected(String objectId, bool isDeselection) {
    if (_isResetting) return;

    if (isDeselection) {
      // If we had a specific part selected, step back to group view.
      if (_selectedPart != null) {
        setState(() => _selectedPart = null);
      } else {
        _clearSelection();
      }
      return;
    }

    // Find which group the selected ID belongs to.
    final neutralId = _neutralId(objectId);
    BodyPartGroup? matchedGroup;
    AnatomyPart? matchedPart;

    for (final group in bodyPartGroups.values) {
      for (final part in group.parts) {
        if (part.objectId == neutralId || _genderedId(part.objectId) == objectId) {
          matchedGroup = group;
          matchedPart = AnatomyPart(
            objectId: objectId,
            name: part.name,
            description: '${part.name} area',
            group: group.name,
            selected: true,
          );
          break;
        }
      }
      // Also check selectIds directly.
      if (matchedGroup == null) {
        for (final sid in group.selectIds) {
          if (sid == neutralId || _genderedId(sid) == objectId) {
            matchedGroup = group;
            break;
          }
        }
      }
      if (matchedGroup != null) break;
    }

    if (matchedGroup == null) return;

    final api = _viewerKey.currentState?.api;
    if (api == null) return;

    // If tapping within the same group, select the specific part.
    if (_selectedGroup?.id == matchedGroup.id && matchedPart != null) {
      api.enableXray();
      api.selectObjects({objectId: true});
      setState(() => _selectedPart = matchedPart);
      return;
    }

    // New group: highlight group selectIds + enable xray.
    final selectionMap = <String, bool>{};
    for (final id in matchedGroup.selectIds) {
      selectionMap[_genderedId(id)] = true;
    }
    api.enableXray();
    api.selectObjects(selectionMap);

    setState(() {
      _selectedGroup = matchedGroup;
      _selectedPart = null;
      _needsReset = true;
    });
  }

  // ── control handlers ──

  Future<void> _handleRotate() async {
    final api = _viewerKey.currentState?.api;
    if (api == null || _isRotating) return;

    setState(() {
      _isRotating = true;
      _needsReset = true;
    });

    // Rotate 180° in steps (matches web: 10° per frame, ~18 frames).
    const step = 10.0;
    var rotated = 0.0;
    while (rotated < 180) {
      await api.cameraOrbit(step);
      rotated += step;
      await Future<void>.delayed(const Duration(milliseconds: 16));
    }

    if (mounted) setState(() => _isRotating = false);
  }

  Future<void> _handleReset() async {
    final api = _viewerKey.currentState?.api;
    if (api == null || _isResetting) return;

    setState(() => _isResetting = true);

    await api.resetScene();
    _clearSelection();

    await Future<void>.delayed(const Duration(milliseconds: 500));
    if (mounted) {
      setState(() {
        _isResetting = false;
        _needsReset = false;
      });
    }
  }

  void _handleSwitchModel() {
    final next = _gender == Gender.male ? Gender.female : Gender.male;
    _clearSelection();
    setState(() => _gender = next);
    _viewerKey.currentState?.switchGender(next);
  }

  void _clearSelection() {
    setState(() {
      _selectedGroup = null;
      _selectedPart = null;
    });
  }

  // ── helpers ──

  /// Strip gender prefix to get the neutral object ID.
  String _neutralId(String id) {
    return id
        .replaceFirst(RegExp(r'^male_'), '')
        .replaceFirst(RegExp(r'^female_'), '');
  }

  /// Apply gender prefix based on current model.
  String _genderedId(String neutralId) {
    final prefix = _gender == Gender.male ? 'male' : 'female';
    if (neutralId.startsWith('male_') || neutralId.startsWith('female_')) {
      return neutralId; // Already gendered.
    }
    return '${prefix}_$neutralId';
  }

  Widget _buildHintBar() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Colors.transparent,
            Colors.black.withValues(alpha: 0.8),
          ],
        ),
      ),
      padding: EdgeInsets.fromLTRB(
        20,
        24,
        20,
        MediaQuery.of(context).padding.bottom + 16,
      ),
      child: const Text(
        'Tap a body part to get started',
        textAlign: TextAlign.center,
        style: TextStyle(
          color: Colors.white70,
          fontSize: 15,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}
