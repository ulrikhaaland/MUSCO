import 'package:flutter/material.dart';
import '../controllers/human_viewer_controller.dart';
import '../widgets/human_viewer_widget.dart';
import '../utils/anatomy_helpers.dart';
import '../models/body_part_group.dart';

/// Full-screen 3D model viewer with selection state and controls.
class ModelViewerScreen extends StatefulWidget {
  const ModelViewerScreen({super.key});

  @override
  State<ModelViewerScreen> createState() => _ModelViewerScreenState();
}

class _ModelViewerScreenState extends State<ModelViewerScreen> {
  final _controller = HumanViewerController();

  bool _sdkValid = false;
  bool _modelLoaded = false;
  String _gender = 'male';
  BodyPartGroup? _selectedGroup;
  String? _selectedObjectId;
  String _statusMessage = 'Initializing SDK…';

  // The module paths for the full anatomy models.
  // These may need adjustment based on your BioDigital content library.
  static const _maleModuleId = 'production/maleAdult/male_19';
  static const _femaleModuleId = 'production/femaleAdult/female_19';

  String get _currentModuleId =>
      _gender == 'male' ? _maleModuleId : _femaleModuleId;

  @override
  void initState() {
    super.initState();
    _controller
      ..onSDKValid = _onSDKValid
      ..onSDKInvalid = _onSDKInvalid
      ..onModelLoaded = _onModelLoaded
      ..onObjectSelected = _onObjectSelected;
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  // ---------------------------------------------------------------------------
  // SDK / model lifecycle
  // ---------------------------------------------------------------------------

  void _onSDKValid() {
    setState(() {
      _sdkValid = true;
      _statusMessage = 'SDK valid — loading model…';
    });
    _controller.loadModel(_currentModuleId);
  }

  void _onSDKInvalid() {
    setState(() => _statusMessage = 'SDK validation failed. Check API key.');
  }

  void _onModelLoaded(String modelId) {
    setState(() {
      _modelLoaded = true;
      _statusMessage = '';
    });
    _controller.disableHighlight();
  }

  // ---------------------------------------------------------------------------
  // Selection
  // ---------------------------------------------------------------------------

  void _onObjectSelected(String objectId) {
    final group = getPartGroup(objectId);
    if (group == null) return;

    final selectionMap = createSelectionMap(group.selectIds, _gender);
    _controller.selectObjects(selectionMap, replace: true);
    _controller.enableXray();

    // objectId already stored for UI display via _selectedObjectId

    setState(() {
      _selectedGroup = group;
      _selectedObjectId = objectId;
    });
  }

  // ---------------------------------------------------------------------------
  // Controls
  // ---------------------------------------------------------------------------

  void _resetScene() {
    _controller
      ..resetScene()
      ..disableXray();
    setState(() {
      _selectedGroup = null;
      _selectedObjectId = null;
    });
  }

  void _switchGender() {
    final newGender = _gender == 'male' ? 'female' : 'male';
    setState(() {
      _gender = newGender;
      _modelLoaded = false;
      _selectedGroup = null;
      _selectedObjectId = null;
      _statusMessage = 'Loading $newGender model…';
    });
    _controller.loadModel(_currentModuleId);
  }

  // ---------------------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          children: [
            // 3D viewer fills entire screen
            const Positioned.fill(child: HumanViewerWidget()),

            // Status overlay while loading / SDK invalid
            if (!_sdkValid || !_modelLoaded || _statusMessage.isNotEmpty)
              Positioned.fill(
                child: Container(
                  color: Colors.black54,
                  alignment: Alignment.center,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const CircularProgressIndicator(color: Colors.white),
                      const SizedBox(height: 16),
                      Text(
                        _statusMessage,
                        style: const TextStyle(color: Colors.white, fontSize: 16),
                      ),
                    ],
                  ),
                ),
              ),

            // Top bar with back + gender toggle
            Positioned(
              top: 8,
              left: 8,
              right: 8,
              child: Row(
                children: [
                  _circleButton(Icons.arrow_back, () => Navigator.pop(context)),
                  const Spacer(),
                  _circleButton(
                    _gender == 'male' ? Icons.male : Icons.female,
                    _switchGender,
                  ),
                ],
              ),
            ),

            // Bottom controls: reset + selected part info
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: _bottomBar(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _circleButton(IconData icon, VoidCallback onTap) {
    return Material(
      color: Colors.black54,
      shape: const CircleBorder(),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(10),
          child: Icon(icon, color: Colors.white, size: 22),
        ),
      ),
    );
  }

  Widget _bottomBar() {
    final groupName = _selectedGroup?.name;
    final partName = _selectedObjectId != null
        ? _selectedGroup?.parts
            .where((p) => getNeutralId(p.objectId) == getNeutralId(_selectedObjectId!))
            .firstOrNull
            ?.name
        : null;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Colors.transparent, Colors.black87],
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                if (groupName != null)
                  Text(
                    groupName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                if (partName != null)
                  Text(
                    partName,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.7),
                      fontSize: 14,
                    ),
                  ),
                if (groupName == null)
                  Text(
                    'Tap a body part to select',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.5),
                      fontSize: 14,
                    ),
                  ),
              ],
            ),
          ),
          if (_selectedGroup != null)
            _circleButton(Icons.refresh, _resetScene),
        ],
      ),
    );
  }
}
