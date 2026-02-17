import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

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
  const _QuickPrompt({required this.labelKey, required this.messageKey});

  final String labelKey;
  final String messageKey;
}

class _ChatMessage {
  const _ChatMessage({required this.role, required this.content});

  final String role;
  final String content;

  Map<String, dynamic> toMap() => {'role': role, 'content': content};

  factory _ChatMessage.fromMap(Map<String, dynamic> map) {
    return _ChatMessage(
      role: (map['role'] ?? '').toString(),
      content: (map['content'] ?? '').toString(),
    );
  }
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

  Map<String, dynamic> toMap() {
    return {
      'question': question,
      if (title != null) 'title': title,
      if (chatMode != null) 'chatMode': chatMode,
      if (selectBodyGroup != null) 'selectBodyGroup': selectBodyGroup,
      if (selectBodyPart != null) 'selectBodyPart': selectBodyPart,
      'generate': generate,
      if (programType != null) 'programType': programType,
    };
  }
}

class _ChatSession {
  const _ChatSession({
    required this.id,
    required this.title,
    required this.updatedAt,
    required this.messages,
    required this.followUps,
    required this.previousQuestions,
    this.assistantResponse,
  });

  final String id;
  final String title;
  final DateTime updatedAt;
  final List<_ChatMessage> messages;
  final List<_FollowUpQuestion> followUps;
  final List<Map<String, dynamic>> previousQuestions;
  final Map<String, dynamic>? assistantResponse;

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'updatedAt': updatedAt.toIso8601String(),
      'messages': messages.map((m) => m.toMap()).toList(),
      'followUps': followUps.map((q) => q.toMap()).toList(),
      'previousQuestions': previousQuestions,
      if (assistantResponse != null) 'assistantResponse': assistantResponse,
    };
  }

  factory _ChatSession.fromMap(Map<String, dynamic> map) {
    final rawMessages = map['messages'];
    final rawFollowUps = map['followUps'];
    final rawPreviousQuestions = map['previousQuestions'];
    final rawAssistantResponse = map['assistantResponse'];
    return _ChatSession(
      id: (map['id'] ?? '').toString(),
      title: (map['title'] ?? '').toString(),
      updatedAt:
          DateTime.tryParse((map['updatedAt'] ?? '').toString()) ??
          DateTime.now(),
      messages: rawMessages is List
          ? rawMessages
                .whereType<Map>()
                .map(
                  (item) => _ChatMessage.fromMap(
                    item.map((k, v) => MapEntry(k.toString(), v)),
                  ),
                )
                .toList()
          : const [],
      followUps: rawFollowUps is List
          ? rawFollowUps
                .whereType<Map>()
                .map(
                  (item) => _FollowUpQuestion.fromMap(
                    item.map((k, v) => MapEntry(k.toString(), v)),
                  ),
                )
                .toList()
          : const [],
      previousQuestions: rawPreviousQuestions is List
          ? rawPreviousQuestions
                .whereType<Map>()
                .map((item) => item.map((k, v) => MapEntry(k.toString(), v)))
                .toList()
          : const [],
      assistantResponse: rawAssistantResponse is Map
          ? rawAssistantResponse.map((k, v) => MapEntry(k.toString(), v))
          : null,
    );
  }
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
  String _statusMessage = '';
  bool _isChatOverlayOpen = false;
  bool _isHistoryOpen = false;
  bool _isRotating = false;
  bool _isChatLoading = false;
  String? _chatError;

  final List<_ChatMessage> _messages = [];
  final List<_FollowUpQuestion> _followUps = [];
  final List<Map<String, dynamic>> _previousQuestions = [];
  Map<String, dynamic>? _assistantResponse;
  final Map<String, Map<String, dynamic>> _inlineExercises = {};
  List<_ChatSession> _chatSessions = const [];
  String? _activeChatSessionId;

  static const String _chatSessionsStorageKey = 'model_viewer_chat_sessions_v1';

  static const List<_QuickPrompt> _quickPrompts = [
    _QuickPrompt(
      labelKey: 'flutter.modelViewer.quickPrompt.whyHurt.label',
      messageKey: 'flutter.modelViewer.quickPrompt.whyHurt.message',
    ),
    _QuickPrompt(
      labelKey: 'flutter.modelViewer.quickPrompt.trainArea.label',
      messageKey: 'flutter.modelViewer.quickPrompt.trainArea.message',
    ),
    _QuickPrompt(
      labelKey: 'flutter.modelViewer.quickPrompt.recovery.label',
      messageKey: 'flutter.modelViewer.quickPrompt.recovery.message',
    ),
  ];

  String get _currentModuleId => kViewerModelIds[_gender] ?? '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      setState(() {
        _statusMessage = _t(
          'flutter.modelViewer.status.gettingReady',
          fallback: 'Getting things ready',
        );
      });
    });
    _assistantApi = AssistantApiClient(authTokenProvider: _getIdToken);
    _controller
      ..onSDKValid = _onSDKValid
      ..onSDKInvalid = _onSDKInvalid
      ..onViewReady = _onViewReady
      ..onModelLoaded = _onModelLoaded
      ..onModelLoadError = _onModelLoadError
      ..onObjectSelected = _onObjectSelected;
    _loadChatSessions();
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

  String _t(String key, {Map<String, String>? replacements, String? fallback}) {
    if (!mounted) return fallback ?? key;
    return context.t(key, replacements: replacements);
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
      _statusMessage = _t(
        'flutter.modelViewer.status.preparingModel',
        fallback: 'Preparing your model',
      );
    });
    _tryLoadModel();
  }

  void _onViewReady() {
    setState(() {
      _viewReady = true;
      if (_sdkValid) {
        _statusMessage = _t(
          'flutter.modelViewer.status.loadingModel',
          fallback: 'Loading anatomy model',
        );
      }
    });
    _tryLoadModel();
  }

  void _tryLoadModel() {
    if (!_sdkValid || !_viewReady) return;
    setState(
      () => _statusMessage = _t(
        'flutter.modelViewer.status.loadingModel',
        fallback: 'Loading anatomy model',
      ),
    );
    _controller.loadModel(_currentModuleId);
  }

  void _onSDKInvalid() {
    setState(
      () => _statusMessage = _t(
        'chat.error',
        fallback: 'Something went wrong. Please try again.',
      ),
    );
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
      _statusMessage = _t(
        'flutter.modelViewer.status.loadError',
        fallback: 'Could not load model. Please try again.',
      );
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
      _statusMessage = _t(
        'flutter.modelViewer.status.switchingModel',
        fallback: 'Switching model',
      );
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

  List<String> _extractExerciseMarkers(String text) {
    final matches = RegExp(r'\[\[([^\]]+)\]\]').allMatches(text);
    final names = <String>{};
    for (final m in matches) {
      final name = (m.group(1) ?? '').trim();
      if (name.isNotEmpty) names.add(name);
    }
    return names.toList();
  }

  String _stripExerciseMarkers(String text) {
    return text.replaceAllMapped(
      RegExp(r'\[\[([^\]]+)\]\]'),
      (m) => (m.group(1) ?? '').trim(),
    );
  }

  Future<void> _prefetchInlineExercisesFromMessage(String content) async {
    final names = _extractExerciseMarkers(
      content,
    ).where((name) => !_inlineExercises.containsKey(name)).toList();
    if (names.isEmpty) return;

    final results = await _assistantApi.searchExercisesByNames(
      names: names,
      locale: context.i18n.locale.languageCode,
    );
    if (!mounted || results.isEmpty) return;
    setState(() {
      _inlineExercises.addAll(results);
    });
  }

  Future<String?> _resolveExerciseVideoUrl(String rawUrl) async {
    final trimmed = rawUrl.trim();
    if (trimmed.isEmpty) return null;

    if (trimmed.startsWith('gs://')) {
      try {
        final ref = FirebaseStorage.instance.refFromURL(trimmed);
        return await ref.getDownloadURL();
      } catch (_) {
        return null;
      }
    }
    return trimmed;
  }

  Future<void> _openExerciseVideo(String exerciseName) async {
    final exercise = _inlineExercises[exerciseName];
    final rawUrl = (exercise?['videoUrl'] ?? '').toString();
    final resolvedUrl = await _resolveExerciseVideoUrl(rawUrl);
    if (!mounted) return;

    if (resolvedUrl == null || resolvedUrl.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            context.t(
              'flutter.modelViewer.chat.exerciseFoundNoVideo',
              replacements: {'name': exerciseName},
            ),
          ),
        ),
      );
      return;
    }

    final uri = Uri.tryParse(resolvedUrl);
    if (uri == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            context.t(
              'flutter.modelViewer.chat.exerciseFoundNoVideo',
              replacements: {'name': exerciseName},
            ),
          ),
        ),
      );
      return;
    }

    final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!mounted || launched) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          context.t(
            'flutter.modelViewer.chat.exerciseFoundNoVideo',
            replacements: {'name': exerciseName},
          ),
        ),
      ),
    );
  }

  Future<void> _sendChatMessage(String content) async {
    final trimmed = content.trim();
    if (trimmed.isEmpty || _isChatLoading) return;
    if (trimmed.toLowerCase() == 'answer in chat') return;

    final priorHistory = _buildChatHistoryPayload();

    _chatController.clear();

    setState(() {
      _activeChatSessionId ??= DateTime.now().millisecondsSinceEpoch.toString();
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
        messages: priorHistory,
        previousQuestions: _previousQuestions.isEmpty
            ? null
            : List<Map<String, dynamic>>.from(_previousQuestions),
        maxFollowUpOptions: 3,
        diagnosisAssistantResponse: _assistantResponse,
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
          } else if (event.type == 'assistant_response' &&
              event.assistantResponse != null) {
            _assistantResponse = event.assistantResponse;

            final followUps = event.assistantResponse!['followUpQuestions'];
            if (followUps is List) {
              _followUps
                ..clear()
                ..addAll(
                  followUps.whereType<Map>().map(
                    (item) => _FollowUpQuestion.fromMap(
                      item.map((k, v) => MapEntry(k.toString(), v)),
                    ),
                  ),
                );
            }

            final selectedBodyPart =
                event.assistantResponse!['selectedBodyPart'];
            if (_selectedObjectId == null && selectedBodyPart is String) {
              final match = _findPartByName(selectedBodyPart);
              if (match != null) {
                _applyPartSelection(match.group, match.objectId);
              }
            }

            final selectedBodyGroup =
                event.assistantResponse!['selectedBodyGroup'];
            if (_selectedGroup == null && selectedBodyGroup is String) {
              final group = _findGroupByName(selectedBodyGroup);
              if (group != null) {
                _applyGroupSelection(group);
              }
            }
          } else if (event.type == 'error' && event.error != null) {
            _chatError = event.error;
          } else if (event.type == 'complete') {
            final assistant = _messages.lastWhere(
              (m) => m.role == 'assistant',
              orElse: () => const _ChatMessage(role: '', content: ''),
            );
            if (assistant.content.trim().isNotEmpty) {
              _prefetchInlineExercisesFromMessage(assistant.content);
            }
          }
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _chatError = e.toString());
    } finally {
      if (mounted) {
        setState(() => _isChatLoading = false);
        _upsertActiveSession();
      }
    }
  }

  void _handleFollowUpTap(_FollowUpQuestion q) {
    if (q.question.trim().toLowerCase() == 'answer in chat') return;

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
        _chatError = _t(
          'flutter.modelViewer.chat.programGenerationUnsupported',
          replacements: {'programType': q.programType ?? 'unknown'},
          fallback:
              'Program generation flow is not wired in Flutter yet (programType=${q.programType ?? 'unknown'}).',
        );
      });
      return;
    }

    final merged = <Map<String, dynamic>>[
      ..._previousQuestions,
      ..._followUps.map((item) => item.toMap()),
    ];
    final seen = <String>{};
    _previousQuestions
      ..clear()
      ..addAll(
        merged.where((item) {
          final key = (item['question'] ?? '').toString().trim().toLowerCase();
          if (key.isEmpty || seen.contains(key)) return false;
          seen.add(key);
          return true;
        }),
      );

    _sendChatMessage(q.question);
  }

  Future<void> _loadChatSessions() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_chatSessionsStorageKey);
    if (raw == null || raw.trim().isEmpty) return;
    try {
      final decoded = jsonDecode(raw);
      if (decoded is! List) return;
      final sessions =
          decoded
              .whereType<Map>()
              .map(
                (item) => _ChatSession.fromMap(
                  item.map((k, v) => MapEntry(k.toString(), v)),
                ),
              )
              .where((s) => s.id.isNotEmpty)
              .toList()
            ..sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
      if (!mounted) return;
      setState(() {
        _chatSessions = sessions;
        if (sessions.isNotEmpty) {
          _applySession(sessions.first);
        }
      });
    } catch (_) {
      // Ignore malformed session cache.
    }
  }

  Future<void> _persistChatSessions() async {
    final prefs = await SharedPreferences.getInstance();
    final encoded = jsonEncode(_chatSessions.map((s) => s.toMap()).toList());
    await prefs.setString(_chatSessionsStorageKey, encoded);
  }

  String _deriveSessionTitle() {
    final firstUser = _messages.firstWhere(
      (m) => m.role == 'user' && m.content.trim().isNotEmpty,
      orElse: () => _ChatMessage(
        role: 'assistant',
        content: context.t('chatHistory.newChat'),
      ),
    );
    final normalized = firstUser.content.trim().replaceAll('\n', ' ');
    if (normalized.isEmpty) return context.t('chatHistory.newChat');
    if (normalized.length <= 44) return normalized;
    return '${normalized.substring(0, 44)}...';
  }

  void _applySession(_ChatSession session) {
    _activeChatSessionId = session.id;
    _messages
      ..clear()
      ..addAll(session.messages);
    _followUps
      ..clear()
      ..addAll(session.followUps);
    _previousQuestions
      ..clear()
      ..addAll(session.previousQuestions);
    _assistantResponse = session.assistantResponse;
    _chatError = null;
  }

  void _upsertActiveSession() {
    if (_activeChatSessionId == null || _messages.isEmpty) return;
    final updatedSession = _ChatSession(
      id: _activeChatSessionId!,
      title: _deriveSessionTitle(),
      updatedAt: DateTime.now(),
      messages: List<_ChatMessage>.from(_messages),
      followUps: List<_FollowUpQuestion>.from(_followUps),
      previousQuestions: List<Map<String, dynamic>>.from(_previousQuestions),
      assistantResponse: _assistantResponse == null
          ? null
          : Map<String, dynamic>.from(_assistantResponse!),
    );
    final next = List<_ChatSession>.from(_chatSessions);
    final existingIndex = next.indexWhere((s) => s.id == updatedSession.id);
    if (existingIndex == -1) {
      next.add(updatedSession);
    } else {
      next[existingIndex] = updatedSession;
    }
    next.sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
    setState(() => _chatSessions = next);
    _persistChatSessions();
  }

  void _startNewChat() {
    setState(() {
      _activeChatSessionId = null;
      _messages.clear();
      _followUps.clear();
      _previousQuestions.clear();
      _assistantResponse = null;
      _chatError = null;
      _isHistoryOpen = false;
    });
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
            if (_modelLoaded && _isChatOverlayOpen) _buildChatOverlay(context),
            if (_modelLoaded && !_isChatOverlayOpen) _buildBottomChatLauncher(),
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
            if (_modelLoaded)
              Positioned(
                top: 8,
                right: 8,
                child: _buildLocaleSwitcher(context),
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
                            : context.t('mobile.chat.selectBodyPart'),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        hasSelection
                            ? (partName ??
                                  context.t(
                                    'flutter.modelViewer.chat.tapToOpenChat',
                                  ))
                            : context.t('mobile.chat.askAnything'),
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
                  child: Text(
                    context.t('mobile.chat.button'),
                    style: const TextStyle(
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
    final title = _selectedGroup?.name ?? context.t('chat.noBodyPartSelected');
    final subtitle = _selectedPartName ?? context.t('mobile.chat.askAnything');

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
                      child: Text(
                        context.t('flutter.modelViewer.chat.quickPromptIntro'),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                        ),
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
                                context.t(p.labelKey),
                                style: const TextStyle(
                                  color: Color(0xFFC7D2FE),
                                ),
                              ),
                              onPressed: () =>
                                  _sendChatMessage(context.t(p.messageKey)),
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
    final exerciseNames = isUser
        ? const <String>[]
        : _extractExerciseMarkers(message.content);
    final cleanedContent = isUser
        ? message.content
        : _stripExerciseMarkers(message.content);
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
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              cleanedContent,
              style: const TextStyle(color: Colors.white, fontSize: 14),
            ),
            if (exerciseNames.isNotEmpty) ...[
              const SizedBox(height: 8),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: exerciseNames.map((name) {
                  return ActionChip(
                    backgroundColor: const Color(0x1A3B82F6),
                    side: const BorderSide(color: Color(0x553B82F6)),
                    label: Text(
                      name,
                      style: const TextStyle(color: Color(0xFFDBEAFE)),
                    ),
                    onPressed: () => _openExerciseVideo(name),
                  );
                }).toList(),
              ),
            ],
          ],
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
                onPressed: _startNewChat,
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
                    hintText: context.t('chat.askInChat'),
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
                  Text(
                    context.t('chatHistory.title'),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 10),
                  if (_messages.isEmpty)
                    Text(
                      context.t('chatHistory.noChats'),
                      style: const TextStyle(color: Colors.white70),
                    )
                  else
                    const SizedBox.shrink(),
                  if (_chatSessions.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    ConstrainedBox(
                      constraints: const BoxConstraints(maxHeight: 300),
                      child: ListView.separated(
                        shrinkWrap: true,
                        itemCount: _chatSessions.length,
                        separatorBuilder: (_, _) =>
                            const Divider(height: 1, color: Color(0xFF1F2937)),
                        itemBuilder: (context, index) {
                          final session = _chatSessions[index];
                          final isActive = session.id == _activeChatSessionId;
                          return ListTile(
                            contentPadding: EdgeInsets.zero,
                            dense: true,
                            title: Text(
                              session.title,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                color: isActive ? Colors.white : Colors.white70,
                                fontWeight: isActive
                                    ? FontWeight.w700
                                    : FontWeight.w500,
                              ),
                            ),
                            subtitle: Text(
                              '${session.messages.length} ${context.t('chatHistory.messages')}',
                              style: const TextStyle(color: Colors.white54),
                            ),
                            trailing: isActive
                                ? const Icon(
                                    Icons.check_circle,
                                    color: Color(0xFF22C55E),
                                    size: 18,
                                  )
                                : null,
                            onTap: () {
                              setState(() {
                                _applySession(session);
                                _isHistoryOpen = false;
                              });
                            },
                          );
                        },
                      ),
                    ),
                  ],
                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: _startNewChat,
                      child: Text(context.t('chatHistory.newChat')),
                    ),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: () => setState(() => _isHistoryOpen = false),
                      child: Text(context.t('chatHistory.close')),
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

  Widget _buildLocaleSwitcher(BuildContext context) {
    final currentCode = context.i18n.locale.languageCode;
    return Material(
      color: Colors.black54,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
      child: PopupMenuButton<String>(
        initialValue: currentCode,
        tooltip: context.t('common.language'),
        onSelected: (code) async {
          await context.i18n.setLocale(Locale(code));
        },
        itemBuilder: (_) => [
          PopupMenuItem(value: 'en', child: Text(context.t('language.en'))),
          PopupMenuItem(value: 'nb', child: Text(context.t('language.nb'))),
        ],
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.language, color: Colors.white, size: 18),
              const SizedBox(width: 6),
              Text(
                currentCode.toUpperCase(),
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
