import 'package:flutter/services.dart';

/// Dart-side controller that communicates with the native BioDigital SDK
/// over a MethodChannel. Works identically on iOS (HumanKit) and
/// Android (HumanSDK) — each platform implements the same contract.
class HumanViewerController {
  static const _channel = MethodChannel('com.musco.muscoapp/human_viewer');

  // ---------------------------------------------------------------------------
  // Callbacks from native → Dart
  // ---------------------------------------------------------------------------
  void Function()? onSDKValid;
  void Function()? onSDKInvalid;
  void Function()? onViewReady;
  void Function(String modelId)? onModelLoaded;
  void Function(String objectId)? onObjectSelected;
  void Function(String objectId)? onObjectDeselected;
  void Function(String error)? onModelLoadError;

  HumanViewerController() {
    _channel.setMethodCallHandler(_handleNativeCall);
    // On hot restart the native SDK is already validated but the callback
    // won't fire again. Poll until the platform view is ready to answer.
    _pollSDKStatus();
  }

  Future<void> _pollSDKStatus() async {
    // Small delay so the platform view has time to register its handler.
    await Future.delayed(const Duration(milliseconds: 500));
    try {
      await _channel.invokeMethod('querySDKStatus');
    } catch (_) {
      // Platform view might not exist yet — retry once more.
      await Future.delayed(const Duration(seconds: 2));
      try {
        await _channel.invokeMethod('querySDKStatus');
      } catch (_) {}
    }
  }

  Future<void> _handleNativeCall(MethodCall call) async {
    switch (call.method) {
      case 'onSDKValid':
        onSDKValid?.call();
      case 'onSDKInvalid':
        onSDKInvalid?.call();
      case 'onViewReady':
        onViewReady?.call();
      case 'onModelLoaded':
        final modelId = call.arguments as String? ?? '';
        onModelLoaded?.call(modelId);
      case 'onObjectSelected':
        final objectId = call.arguments as String? ?? '';
        onObjectSelected?.call(objectId);
      case 'onObjectDeselected':
        final objectId = call.arguments as String? ?? '';
        onObjectDeselected?.call(objectId);
      case 'onModelLoadError':
        final error = call.arguments as String? ?? 'unknown';
        onModelLoadError?.call(error);
    }
  }

  // ---------------------------------------------------------------------------
  // Commands from Dart → native
  // ---------------------------------------------------------------------------

  /// Load a BioDigital model by its module path.
  Future<void> loadModel(String moduleId) =>
      _channel.invokeMethod('loadModel', moduleId);

  /// Select / deselect objects. Keys are gendered object IDs,
  /// values are `true` (select) or `false` (deselect).
  Future<void> selectObjects(Map<String, bool> selectionMap,
      {bool replace = false}) =>
      _channel.invokeMethod('selectObjects', {
        'selections': selectionMap,
        'replace': replace,
      });

  /// Enable translucent X-ray mode.
  Future<void> enableXray() => _channel.invokeMethod('enableXray');

  /// Disable X-ray mode.
  Future<void> disableXray() => _channel.invokeMethod('disableXray');

  /// Set camera position / target / up with optional animation.
  Future<void> setCamera({
    Map<String, double>? position,
    Map<String, double>? target,
    Map<String, double>? up,
    String? objectId,
    bool animate = true,
    double animationDuration = 0.5,
  }) {
    final payload = <String, Object>{
      'animate': animate,
      'animationDuration': animationDuration,
    };
    if (position != null) payload['position'] = position;
    if (target != null) payload['target'] = target;
    if (up != null) payload['up'] = up;
    if (objectId != null) payload['objectId'] = objectId;
    return _channel.invokeMethod('setCamera', payload);
  }

  /// Reset scene to initial state.
  Future<void> resetScene() => _channel.invokeMethod('resetScene');

  /// Disable default highlight on hover.
  Future<void> disableHighlight() =>
      _channel.invokeMethod('disableHighlight');

  /// Enable highlight on hover.
  Future<void> enableHighlight() =>
      _channel.invokeMethod('enableHighlight');

  /// Dispose the controller; stop listening to the channel.
  void dispose() {
    _channel.setMethodCallHandler(null);
  }
}
