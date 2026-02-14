import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../config/body_part_groups.dart';
import '../config/viewer_shared.dart';
import '../controllers/human_viewer_controller.dart';
import '../models/body_part_group.dart';
import '../l10n/app_i18n.dart';
import '../services/assistant_api_client.dart';
import '../utils/anatomy_helpers.dart';
import '../widgets/human_viewer_widget.dart';
import '../widgets/muscle_loader.dart';

class _QuickPrompt {
  const _QuickPrompt({required this.label, required this.message});

  final String label;
  final String message;
}

class _ChatMessage {
  const _ChatMessage({required this.role, required this.content});

  final String role;
  final String content;
}

class _FollowUpQuestion {
  const _FollowUpQuestion({
    required this.question,
    this.title,
    this.chatMode,
    this.selectBodyGroup,
    this.selectBodyPart,
    this.generate = false,
    this.programType,
  });

  factory _FollowUpQuestion.fromMap(Map<String, dynamic> map) {
    return _FollowUpQuestion(
      question: (map['question'] ?? '').toString(),
      title: map['title']?.toString(),
      chatMode: map['chatMode']?.toString(),
      selectBodyGroup: map['selectBodyGroup']?.toString(),
      selectBodyPart: map['selectBodyPart']?.toString(),
      generate: map['generate'] == true,
      programType: map['programType']?.toString(),
    );
  }

  final String question;
  final String? title;
  final String? chatMode;
  final String? selectBodyGroup;
  final String? selectBodyPart;
  final bool generate;
  final String? programType;
}

/// Full-screen 3D model viewer with mobile controls and chat overlay.
class ModelViewerScreen extends StatefulWidget {
  const ModelViewerScreen({super.key, this.showBackButton = true});

  final bool showBackButton;

  @override
  State<ModelViewerScreen> createState() => _ModelViewerScreenState();
}

class _ModelViewerScreenState extends State<ModelViewerScreen> {
  final _controller = HumanViewerController();
  late final AssistantApiClient _assistantApi;
  final _chatController = TextEditingController();

  bool _sdkValid = false;
  bool _viewReady = false;
  bool _modelLoaded = false;
  String _gender = 'male';
  BodyPartGroup? _selectedGroup;
  String? _selectedObjectId;
  String _statusMessage = 'Getting things ready';
  bool _isChatOverlayOpen = false;
  bool _isHistoryOpen = false;
  bool _isRotating = false;
  bool _isChatLoading = false;
  String? _chatError;

  final List<_ChatMessage> _messages = [];
  final List<_FollowUpQuestion> _followUps = [];

  static const List<_QuickPrompt> _quickPrompts = [
    _QuickPrompt(label: 'Why does this hurt?', message: 'Why does this hurt?'),
    _QuickPrompt(
      label: 'How to train this?',
      message: 'How should I train this area?',
    ),
    _QuickPrompt(
      label: 'Recovery tips',
      message: 'Give me quick recovery tips for this area.',
    ),
  ];

  String get _currentModuleId => kViewerModelIds[_gender] ?? '';

  @override
  void initState() {
    super.initState();
    _assistantApi = AssistantApiClient(authTokenProvider: _getIdToken);
    _controller
      ..onSDKValid = _onSDKValid
      ..onSDKInvalid = _onSDKInvalid
      ..onViewReady = _onViewReady
      ..onModelLoaded = _onModelLoaded
      ..onModelLoadError = _onModelLoadError
      ..onObjectSelected = _onObjectSelected;
  }

  Future<String?> _getIdToken() async {
    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user == null) return null;
      return await user.getIdToken();
    } catch (_) {
      return null;
    }
  }

  @override
  void dispose() {
    _chatController.dispose();
    _assistantApi.dispose();
    _controller.dispose();
    super.dispose();
  }

  void _onSDKValid() {
    setState(() {
      _sdkValid = true;
      _statusMessage = 'Preparing your model';
    });
    _tryLoadModel();
  }

  void _onViewReady() {
    setState(() {
      _viewReady = true;
      if (_sdkValid) _statusMessage = 'Loading anatomy model';
    });
    _tryLoadModel();
  }

  void _tryLoadModel() {
    if (!_sdkValid || !_viewReady) return;
    setState(() => _statusMessage = 'Loading anatomy model');
    _controller.loadModel(_currentModuleId);
  }

  void _onSDKInvalid() {
    setState(() => _statusMessage = 'Something went wrong. Please try again.');
  }

  void _onModelLoaded(String modelId) {
    setState(() {
      _modelLoaded = true;
      _statusMessage = '';
    });
    _controller.disableHighlight();
  }

  void _onModelLoadError(String error) {
    setState(() {
      _statusMessage = 'Could not load model. Please try again.';
    });
  }

  void _onObjectSelected(String objectId) {
    final group = getPartGroup(objectId);
    if (group == null) return;

    final selectionMap = createSelectionMap(group.selectIds, _gender);
    _controller.selectObjects(selectionMap, replace: true);
    _controller.enableXray();

    setState(() {
      _selectedGroup = group;
      _selectedObjectId = objectId;
    });
  }

  void _resetScene() {
    _controller
      ..resetScene()
      ..disableXray();
    setState(() {
      _selectedGroup = null;
      _selectedObjectId = null;
      _isRotating = false;
    });
  }

  void _switchGender() {
    final newGender = _gender == 'male' ? 'female' : 'male';
    setState(() {
      _gender = newGender;
      _modelLoaded = false;
      _selectedGroup = null;
      _selectedObjectId = null;
      _statusMessage = 'Switching model';
    });
    _controller.loadModel(_currentModuleId);
  }

  void _rotateModel() {
    if (!_modelLoaded) return;

    setState(() => _isRotating = true);

    final targetId = _selectedObjectId ?? _selectedGroup?.zoomId;
    if (targetId != null) {
      _controller.setCamera(objectId: getGenderedId(targetId, _gender));
    }

    Future<void>.delayed(const Duration(milliseconds: 600), () {
      if (!mounted) return;
      setState(() => _isRotating = false);
    });
  }

  void _openChatOverlay() {
    setState(() => _isChatOverlayOpen = true);
  }

  void _closeChatOverlay() {
    setState(() => _isChatOverlayOpen = false);
  }

  BodyPartGroup? _findGroupByName(String name) {
    final normalized = name.toLowerCase().trim();
    for (final group in bodyPartGroups.values) {
      if (group.name.toLowerCase().trim() == normalized) {
        return group;
      }
    }
    for (final group in bodyPartGroups.values) {
      final g = group.name.toLowerCase().trim();
      if (g.contains(normalized) || normalized.contains(g)) return group;
    }
    final mappedKey = kBodyGroupNameToConfig[name];
    if (mappedKey != null) return bodyPartGroups[mappedKey];
    return null;
  }

  ({BodyPartGroup group, String objectId})? _findPartByName(String name) {
    final normalized = name.toLowerCase().trim();
    for (final group in bodyPartGroups.values) {
      for (final part in group.parts) {
        final p = part.name.toLowerCase().trim();
        if (p == normalized ||
            p.contains(normalized) ||
            normalized.contains(p)) {
          return (group: group, objectId: part.objectId);
        }
      }
    }
    return null;
  }

  void _applyGroupSelection(BodyPartGroup group) {
    final selectionMap = createSelectionMap(group.selectIds, _gender);
    _controller.selectObjects(selectionMap, replace: true);
    _controller.enableXray();
    _controller.setCamera(objectId: getGenderedId(group.zoomId, _gender));
    setState(() {
      _selectedGroup = group;
      _selectedObjectId = null;
    });
  }

  void _applyPartSelection(BodyPartGroup group, String partObjectId) {
    final selectionMap = createSelectionMap(group.selectIds, _gender);
    _controller.selectObjects(selectionMap, replace: true);
    _controller.enableXray();
    _controller.setCamera(objectId: getGenderedId(partObjectId, _gender));
    setState(() {
      _selectedGroup = group;
      _selectedObjectId = partObjectId;
    });
  }

  List<Map<String, String>> _buildChatHistoryPayload() {
    return _messages
        .where((m) => m.content.trim().isNotEmpty)
        .map((m) => {'role': m.role, 'content': m.content})
        .toList();
  }

  void _appendAssistantText(String delta) {
    if (_messages.isEmpty || _messages.last.role != 'assistant') {
      _messages.add(const _ChatMessage(role: 'assistant', content: ''));
    }
    final last = _messages.last;
    _messages[_messages.length - 1] = _ChatMessage(
      role: 'assistant',
      content: '${last.content}$delta',
    );
  }

  Future<void> _sendChatMessage(String content) async {
    final trimmed = content.trim();
    if (trimmed.isEmpty || _isChatLoading) return;

    _chatController.clear();

    setState(() {
      _isChatLoading = true;
      _chatError = null;
      _followUps.clear();
      _messages.add(_ChatMessage(role: 'user', content: trimmed));
      _messages.add(const _ChatMessage(role: 'assistant', content: ''));
    });

    try {
      await for (final event in _assistantApi.streamMessage(
        message: trimmed,
        language: context.i18n.locale.languageCode,
        selectedBodyGroupName: _selectedGroup?.name,
        selectedBodyPart: _selectedPartName,
        bodyPartsInSelectedGroup:
            _selectedGroup?.parts.map((p) => p.name).toList() ?? const [],
        messages: _buildChatHistoryPayload(),
      )) {
        if (!mounted) return;
        setState(() {
          if (event.type == 'text' && event.text != null) {
            _appendAssistantText(event.text!);
          } else if (event.type == 'followup' && event.followUp != null) {
            final q = _FollowUpQuestion.fromMap(event.followUp!);
            final exists = _followUps.any(
              (f) => f.question.trim() == q.question.trim(),
            );
            if (!exists && q.question.isNotEmpty) {
              _followUps.add(q);
            }
          } else if (event.type == 'error' && event.error != null) {
            _chatError = event.error;
          }
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _chatError = e.toString());
    } finally {
      if (mounted) {
        setState(() => _isChatLoading = false);
      }
    }
  }

  void _handleFollowUpTap(_FollowUpQuestion q) {
    if (q.selectBodyPart != null && q.selectBodyPart!.trim().isNotEmpty) {
      final match = _findPartByName(q.selectBodyPart!);
      if (match != null) {
        _applyPartSelection(match.group, match.objectId);
      }
    } else if (q.selectBodyGroup != null &&
        q.selectBodyGroup!.trim().isNotEmpty) {
      final group = _findGroupByName(q.selectBodyGroup!);
      if (group != null) _applyGroupSelection(group);
    }

    if (q.generate) {
      setState(() {
        _chatError =
            'Program generation flow is not wired in Flutter yet (programType=${q.programType ?? 'unknown'}).';
      });
      return;
    }

    _sendChatMessage(q.question);
  }

  String? get _selectedPartName {
    if (_selectedObjectId == null || _selectedGroup == null) return null;

    final neutral = getNeutralId(_selectedObjectId!);
    for (final part in _selectedGroup!.parts) {
      if (getNeutralId(part.objectId) == neutral) return part.name;
    }
    return null;
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          children: [
            const Positioned.fill(child: HumanViewerWidget()),
            // Show MuscleLoader until model is fully loaded — keeps the
            // loader on screen while the native SDK view renders its first
            // frame and its own loading indicator, avoiding a white flash.
            if (!_modelLoaded)
              Positioned.fill(
                child: MuscleLoader(
                  message: _statusMessage.trim().isNotEmpty
                      ? _statusMessage
                      : context.t('common.loading'),
                ),
              ),
            if (_modelLoaded && !_isChatOverlayOpen)
              _buildFloatingControls(context),
            if (_modelLoaded && _isChatOverlayOpen)
              _buildChatOverlay(context),
            if (_modelLoaded && !_isChatOverlayOpen)
              _buildBottomChatLauncher(),
            if (_modelLoaded && _isHistoryOpen) _buildHistoryOverlay(),
            if (widget.showBackButton)
              Positioned(
                top: 8,
                left: 8,
                child: _circleButton(
                  Icons.arrow_back,
                  () => Navigator.pop(context),
                ),
              ),
          ],
        ),
      ),
    );
  }


  Widget _buildFloatingControls(BuildContext context) {
    final hasSelection = _selectedGroup != null || _selectedObjectId != null;

    return Positioned(
      right: 16,
      bottom: 92,
      child: Container(
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(
          color: Colors.black.withValues(alpha: 0.72),
          borderRadius: BorderRadius.circular(12),
          boxShadow: const [
            BoxShadow(
              color: Colors.black54,
              blurRadius: 14,
              offset: Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _controlButton(
              icon: Icons.crop_rotate,
              onTap: _modelLoaded ? _rotateModel : null,
              spinning: _isRotating,
            ),
            _controlButton(
              icon: Icons.my_location,
              onTap: hasSelection && _modelLoaded ? _resetScene : null,
            ),
            _controlButton(
              icon: _gender == 'male' ? Icons.female : Icons.male,
              onTap: _modelLoaded ? _switchGender : null,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomChatLauncher() {
    final groupName = _selectedGroup?.name;
    final partName = _selectedPartName;
    final hasSelection = groupName != null || partName != null;

    return Positioned(
      left: 0,
      right: 0,
      bottom: 0,
      child: Material(
        color: Colors.black.withValues(alpha: 0.78),
        child: InkWell(
          onTap: _openChatOverlay,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 16),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        hasSelection
                            ? (groupName ?? partName ?? '')
                            : 'Select a body part to start',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        hasSelection
                            ? (partName ?? 'Tap to open chat')
                            : 'Tap to ask questions and get guidance',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.65),
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFF4F46E5),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: const Text(
                    'Chat',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                const Icon(Icons.chevron_right, color: Colors.white70),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildChatOverlay(BuildContext context) {
    final title = _selectedGroup?.name ?? 'No body part selected';
    final subtitle = _selectedPartName ?? 'Ask anything about this area';

    return Positioned.fill(
      child: Container(
        color: const Color(0xFF111827),
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: EdgeInsets.fromLTRB(
                  16,
                  MediaQuery.of(context).padding.top + 12,
                  16,
                  12,
                ),
                children: [
                  if (_messages.isEmpty) ...[
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1F2937),
                        border: Border.all(color: const Color(0xFF374151)),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Text(
                        'Start with a quick prompt or ask your own question.',
                        style: TextStyle(color: Colors.white, fontSize: 14),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _quickPrompts
                          .map(
                            (p) => ActionChip(
                              backgroundColor: const Color(0x1F6366F1),
                              side: const BorderSide(color: Color(0x596366F1)),
                              label: Text(
                                p.label,
                                style: const TextStyle(
                                  color: Color(0xFFC7D2FE),
                                ),
                              ),
                              onPressed: () => _sendChatMessage(p.message),
                            ),
                          )
                          .toList(),
                    ),
                    const SizedBox(height: 20),
                  ],
                  ..._messages.map(_chatBubble),
                  if (_chatError != null) ...[
                    const SizedBox(height: 6),
                    Text(
                      _chatError!,
                      style: const TextStyle(
                        color: Colors.redAccent,
                        fontSize: 12,
                      ),
                    ),
                  ],
                  if (_followUps.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _followUps
                          .map(
                            (q) => ActionChip(
                              backgroundColor: const Color(0x1438BDF8),
                              side: const BorderSide(color: Color(0x33475569)),
                              onPressed: _isChatLoading
                                  ? null
                                  : () => _handleFollowUpTap(q),
                              label: Text(
                                q.title?.trim().isNotEmpty == true
                                    ? q.title!
                                    : q.question,
                                style: const TextStyle(color: Colors.white),
                              ),
                            ),
                          )
                          .toList(),
                    ),
                  ],
                  if (_isChatLoading) ...[
                    const SizedBox(height: 12),
                    const Align(
                      alignment: Alignment.centerLeft,
                      child: SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white70,
                        ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 80),
                ],
              ),
            ),
            _buildChatFooter(title, subtitle),
          ],
        ),
      ),
    );
  }

  Widget _chatBubble(_ChatMessage message) {
    final isUser = message.role == 'user';
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        constraints: const BoxConstraints(maxWidth: 310),
        decoration: BoxDecoration(
          color: isUser ? const Color(0xFF4F46E5) : const Color(0xFF1F2937),
          borderRadius: BorderRadius.circular(12),
          border: isUser ? null : Border.all(color: const Color(0xFF374151)),
        ),
        child: Text(
          message.content,
          style: const TextStyle(color: Colors.white, fontSize: 14),
        ),
      ),
    );
  }

  Widget _buildChatFooter(String title, String subtitle) {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFF0F172A),
        border: Border(top: BorderSide(color: Color(0xFF1F2937))),
      ),
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      subtitle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                visualDensity: VisualDensity.compact,
                icon: const Icon(Icons.history, color: Colors.white70),
                onPressed: () => setState(() => _isHistoryOpen = true),
              ),
              IconButton(
                visualDensity: VisualDensity.compact,
                icon: const Icon(
                  Icons.add_comment_outlined,
                  color: Colors.white70,
                ),
                onPressed: () => setState(() {
                  _messages.clear();
                  _followUps.clear();
                  _chatError = null;
                }),
              ),
              IconButton(
                visualDensity: VisualDensity.compact,
                icon: const Icon(Icons.close, color: Colors.white),
                onPressed: _closeChatOverlay,
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _chatController,
                  style: const TextStyle(color: Colors.white),
                  minLines: 1,
                  maxLines: 4,
                  onSubmitted: _sendChatMessage,
                  decoration: InputDecoration(
                    hintText: 'Ask in chat',
                    hintStyle: const TextStyle(color: Colors.white54),
                    filled: true,
                    fillColor: const Color(0xFF1F2937),
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 10,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: Color(0xFF374151)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: Color(0xFF374151)),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              _circleButton(
                Icons.send,
                _isChatLoading
                    ? () {}
                    : () => _sendChatMessage(_chatController.text),
                compact: true,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryOverlay() {
    return Positioned.fill(
      child: GestureDetector(
        onTap: () => setState(() => _isHistoryOpen = false),
        child: Container(
          color: Colors.black54,
          alignment: Alignment.bottomCenter,
          child: GestureDetector(
            onTap: () {},
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 20),
              decoration: const BoxDecoration(
                color: Color(0xFF111827),
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Chat history',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 10),
                  if (_messages.isEmpty)
                    const Text(
                      'No chats yet',
                      style: TextStyle(color: Colors.white70),
                    )
                  else
                    const Text(
                      'History panel is ready. Next step: connect persisted chat sessions.',
                      style: TextStyle(color: Colors.white70),
                    ),
                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: () => setState(() => _isHistoryOpen = false),
                      child: const Text('Close'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _controlButton({
    required IconData icon,
    required VoidCallback? onTap,
    bool spinning = false,
  }) {
    final button = Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(8),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(8),
            child: AnimatedRotation(
              turns: spinning ? 1 : 0,
              duration: const Duration(milliseconds: 600),
              child: Icon(
                icon,
                color: onTap == null ? Colors.white38 : Colors.white,
                size: 22,
              ),
            ),
          ),
        ),
      ),
    );

    return onTap == null ? Opacity(opacity: 0.5, child: button) : button;
  }

  Widget _circleButton(
    IconData icon,
    VoidCallback onTap, {
    bool compact = false,
  }) {
    return Material(
      color: Colors.black54,
      shape: const CircleBorder(),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onTap,
        child: Padding(
          padding: EdgeInsets.all(compact ? 8 : 10),
          child: Icon(icon, color: Colors.white, size: compact ? 18 : 22),
        ),
      ),
    );
  }
}
